import { Request, Response } from 'express';
import NotificationLog, { SupportedLanguage } from '../models/NotificationLog';
import smsService from '../services/sms/smsService';
import { renderSms, getFullTemplateCatalog } from '../services/sms/smsTemplateService';
import { SmsEventType } from '../locales/sms';
import { AuthRequest } from '../middleware/auth';

/**
 * Retrieves paginated SMS notification logs for authorized Admin Command Center.
 */
export const getSmsLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const { status, language, eventType, search } = req.query;

    const filter: any = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (language && language !== 'ALL') {
      filter.preferredLanguage = language;
    }
    if (eventType && eventType !== 'ALL') {
      filter.eventType = eventType;
    }
    if (search) {
      const searchStr = String(search).trim();
      filter.$or = [
        { requestId: { $regex: searchStr, $options: 'i' } },
        { recipientMasked: { $regex: searchStr, $options: 'i' } },
        { providerMessageId: { $regex: searchStr, $options: 'i' } }
      ];
    }

    const [logs, total] = await Promise.all([
      NotificationLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationLog.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves aggregate SMS dispatch metrics and provider health status.
 */
export const getSmsStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalCount,
      sentCount,
      deliveredCount,
      failedCount,
      skippedCount,
      languageCounts,
      encodingCounts,
      recentLogs
    ] = await Promise.all([
      NotificationLog.countDocuments(),
      NotificationLog.countDocuments({ status: 'SENT' }),
      NotificationLog.countDocuments({ status: 'DELIVERED' }),
      NotificationLog.countDocuments({ status: 'FAILED' }),
      NotificationLog.countDocuments({ status: 'SKIPPED' }),
      NotificationLog.aggregate([
        { $group: { _id: '$preferredLanguage', count: { $sum: 1 } } }
      ]),
      NotificationLog.aggregate([
        { $group: { _id: '$encoding', count: { $sum: 1 } } }
      ]),
      NotificationLog.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('requestId eventType preferredLanguage status recipientMasked createdAt')
        .lean()
    ]);

    const languageMap: Record<string, number> = { en: 0, as: 0, hi: 0, bn: 0, br: 0 };
    languageCounts.forEach(item => {
      if (item._id) languageMap[item._id] = item.count;
    });

    const encodingMap: Record<string, number> = { 'GSM-7': 0, 'UCS-2': 0 };
    encodingCounts.forEach(item => {
      if (item._id) encodingMap[item._id] = item.count;
    });

    const providerInfo = smsService.getStatusInfo();

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        sent: sentCount,
        delivered: deliveredCount,
        failed: failedCount,
        skipped: skippedCount,
        languages: languageMap,
        encodings: encodingMap,
        provider: providerInfo,
        recentLogs
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Previews an emergency SMS template in any supported language with segment estimation.
 */
export const previewSmsTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { eventType, language = 'en', variables = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({ success: false, message: 'Please provide eventType' });
    }

    const rendered = renderSms(
      eventType as SmsEventType,
      language as SupportedLanguage,
      variables
    );

    res.status(200).json({
      success: true,
      data: rendered
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Returns complete multilingual template matrix for admin review.
 */
export const getTemplateCatalog = async (_req: AuthRequest, res: Response) => {
  try {
    const catalog = getFullTemplateCatalog();
    res.status(200).json({
      success: true,
      data: catalog
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delivery Receipt (DLR) Webhook handler for external SMS providers (MSG91 / Exotel).
 */
export const handleSmsWebhook = async (req: Request, res: Response) => {
  try {
    const secret = req.headers['x-sms-webhook-secret'] || req.query.secret;
    const configuredSecret = process.env.SMS_WEBHOOK_SECRET;

    if (configuredSecret && secret !== configuredSecret) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized webhook request' });
    }

    const body = req.body || {};
    // Extract provider message ID (handles MSG91 requestId / Exotel Sid / standard messageId)
    const providerMessageId = body.requestId || body.request_id || body.messageId || body.Sid || body.sms_id;
    const rawStatus = (body.status || body.desc || body.Status || '').toUpperCase();

    if (!providerMessageId) {
      return res.status(200).json({ status: 'ignored', message: 'No provider message ID present' });
    }

    let normalizedStatus: 'DELIVERED' | 'FAILED' | 'UNKNOWN' = 'UNKNOWN';
    if (['DELIVRD', 'DELIVERED', 'SUCCESS', 'SENT'].includes(rawStatus)) {
      normalizedStatus = 'DELIVERED';
    } else if (['FAILED', 'REJECTED', 'UNDELIV', 'EXPIRED'].includes(rawStatus)) {
      normalizedStatus = 'FAILED';
    }

    const updateData: any = {
      status: normalizedStatus,
      rawResponse: body
    };

    if (normalizedStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (normalizedStatus === 'FAILED') {
      updateData.failureCode = rawStatus;
      updateData.safeFailureReason = body.reason || body.error || 'Carrier delivery receipt indicated failure';
    }

    const updated = await NotificationLog.findOneAndUpdate(
      { providerMessageId },
      updateData,
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      updated: Boolean(updated)
    });
  } catch (error: any) {
    console.error('[SMS-WEBHOOK] Error processing delivery receipt:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

