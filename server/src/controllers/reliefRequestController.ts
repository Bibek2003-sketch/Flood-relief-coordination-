import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ReliefRequest from '../models/ReliefRequest';
import Shelter from '../models/Shelter';
import User from '../models/User';
import RescueTeam from '../models/RescueTeam';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/emailService';
import { triggerEmergencySms } from '../services/sms/smsTriggerHelper';

export const getPublicOverviewStats = async (req: Request, res: Response) => {
  try {
    const [
      activeIncidents,
      rescueMissions,
      openShelters,
      volunteersCount
    ] = await Promise.all([
      ReliefRequest.countDocuments({ status: { $nin: ['RESOLVED', 'COMPLETED', 'REJECTED', 'CANCELLED'] } }),
      ReliefRequest.countDocuments({ status: { $in: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'RESCUE_IN_PROGRESS', 'RESOLVED', 'COMPLETED'] } }),
      Shelter.countDocuments({ operatingStatus: { $ne: 'Closed' } }),
      User.countDocuments({
        $or: [{ roleName: 'volunteer' }, { role: { $in: ['volunteer', 'Volunteer'] } }],
        status: { $ne: 'suspended' }
      })
    ]);

    res.json({
      status: 'success',
      data: {
        activeIncidents: activeIncidents || 0,
        rescueMissions: rescueMissions || 0,
        openShelters: openShelters || 0,
        volunteersCount: volunteersCount || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const { status, priority, category } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.requestCategory = category;

    const requests = await ReliefRequest.find(query)
      .populate('submittedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ status: 'success', count: requests.length, data: requests });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await ReliefRequest.find({ submittedBy: req.user?._id })
      .sort({ createdAt: -1 });
    
    res.json({ status: 'success', count: requests.length, data: requests });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    req.body.citizenName = req.body.citizenName || req.body.name || 'Citizen';
    req.body.numberOfPeople = req.body.numberOfPeople || req.body.people || 1;
    if (req.body.categories && (!req.body.requestCategory || req.body.requestCategory.length === 0)) {
      req.body.requestCategory = req.body.categories;
    }
    req.body.submittedBy = req.user?._id;
    
    // Validate preferredLanguage for SMS notifications
    const validLanguages = ['en', 'as', 'hi', 'bn', 'br'];
    req.body.preferredLanguage = validLanguages.includes(req.body.preferredLanguage) 
      ? req.body.preferredLanguage 
      : 'en';

    const request = await ReliefRequest.create(req.body);

    // Trigger Outbound Multilingual SMS Acknowledgement
    triggerEmergencySms(request, 'EMERGENCY_REPORT_RECEIVED');
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new-request', request);
      io.emit('emergency-created', request);
    }

    // Try to send an email if contactEmail is provided or contact is an email address
    const emailToUse = req.body.contactEmail || (req.body.contact && req.body.contact.includes('@') ? req.body.contact : null);
    if (emailToUse) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0891b2;">Emergency Report Received</h2>
          <p>Dear ${req.body.name || 'Citizen'},</p>
          <p>We have successfully received your emergency report.</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <strong>Status:</strong> Priority calculated and logged into the Command Center.<br>
            <strong>Location details provided:</strong> ${req.body.location || 'Not specified'}<br>
            <strong>People affected:</strong> ${req.body.people || 1}
          </div>
          <p>Our rescue coordination team is reviewing your report. Please stay safe and keep your phone accessible if possible.</p>
          <p>Stay safe,<br>Flood Relief Coordination Team</p>
        </div>
      `;
      // We don't await this so it doesn't block the response
      sendEmail({
        to: emailToUse,
        subject: '✅ Emergency Report Received - We are on it',
        html: emailHtml
      }).catch(err => console.error('Failed to send confirmation email:', err));
    }

    res.status(201).json({ 
      status: 'success', 
      success: true,
      requestId: request.requestID,
      data: request 
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const trackRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = (req.params.requestId || req.params.id || (req.query.requestId as string) || (req.query.id as string) || '').trim();

    if (!rawId) {
      res.status(400).json({
        status: 'fail',
        success: false,
        message: 'Please provide a valid Request ID to track emergency.'
      });
      return;
    }

    // Match either requestID or _id
    const query = rawId.startsWith('FLD-') || rawId.startsWith('REQ-') 
      ? { requestID: { $regex: new RegExp(`^${rawId}$`, 'i') } }
      : { $or: [{ requestID: { $regex: new RegExp(`^${rawId}$`, 'i') } }, { _id: mongoose.isValidObjectId(rawId) ? rawId : null }] };

    const request = await ReliefRequest.findOne(query)
      .populate('assignedTeam', 'firstName lastName organization')
      .populate('assignedTo', 'firstName lastName organization');

    if (!request) {
      res.status(404).json({
        status: 'fail',
        success: false,
        message: `No emergency report found with Request ID '${rawId}'. Please verify the ID and try again.`
      });
      return;
    }

    const currentStatus = (request.status || 'SUBMITTED').toUpperCase().replace(/\s+/g, '_');

    let normalizedStatus = currentStatus;
    if (normalizedStatus === 'COMPLETED') normalizedStatus = 'RESOLVED';
    if (normalizedStatus === 'IN_PROGRESS') normalizedStatus = 'RESCUE_IN_PROGRESS';
    if (normalizedStatus === 'PENDING') normalizedStatus = 'SUBMITTED';

    const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESOLVED'];
    let currentIdx = statusOrder.indexOf(normalizedStatus);
    if (currentIdx === -1) currentIdx = 0;

    // Build public visual progression steps
    const stepConfigs = [
      { key: 'SUBMITTED', label: 'Report Submitted', description: 'Emergency logged into central disaster registry' },
      { key: 'UNDER_REVIEW', label: 'Under Review', description: 'Triage officer assessing severity and priority' },
      { key: 'VERIFIED', label: 'Emergency Verified', description: 'Coordinates and emergency verified for squad dispatch' },
      { key: 'ASSIGNED', label: 'Rescue Squad Assigned', description: request.assignedTeam || request.assignedTo ? 'Field squad assigned to mission' : 'Squad assigned and alerted' },
      { key: 'RESCUE_IN_PROGRESS', label: 'Rescue in Progress', description: 'Rescue unit en route or actively extracting citizens' },
      { key: 'RESOLVED', label: 'Mission Resolved', description: 'Citizens successfully secured and extracted' }
    ];

    const steps = stepConfigs.map((cfg, idx) => {
      const isPast = currentIdx > idx;
      const isCurrent = currentIdx === idx;
      const isCompleted = isPast || (currentIdx === statusOrder.length - 1 && idx === statusOrder.length - 1);
      return {
        key: cfg.key,
        label: cfg.label,
        description: cfg.description,
        done: isCompleted,
        completed: isCompleted,
        current: isCurrent
      };
    });

    // Safe sanitized public data (NO sensitive PII)
    const assignedTeamName = (request.assignedTeam as any)?.name ||
      (request.assignedTeam as any)?.organization || 
      `${(request.assignedTeam as any)?.firstName || ''} ${(request.assignedTeam as any)?.lastName || ''}`.trim() || 
      (request.assignedTo as any)?.organization ||
      'Disaster Quick Response Squad';

    // Safe sanitized public timeline (hide internal coordinator IDs and sensitive operational notes)
    const sanitizedTimeline = (request.timeline || []).map(entry => ({
      status: entry.status,
      title: entry.title || `Status updated to ${entry.status}`,
      note: entry.note || undefined,
      timestamp: entry.timestamp
    }));

    const safePublicData = {
      requestId: request.requestID,
      status: currentStatus,
      priority: request.priority,
      categories: request.requestCategory,
      numberOfPeople: request.numberOfPeople,
      locationArea: request.location ? request.location.split(',').slice(0, 2).join(', ') : 'Guwahati Metropolitan Area',
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      assignedTeamName: ['ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESOLVED'].includes(currentStatus) ? assignedTeamName : undefined,
      steps,
      timeline: sanitizedTimeline
    };

    res.status(200).json({
      status: 'success',
      success: true,
      data: safePublicData
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo, assignedTeam, priority } = req.body;
    
    const request = await ReliefRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }

    if (status) request.status = status;
    if (assignedTo) request.assignedTo = assignedTo;
    if (assignedTeam) request.assignedTeam = assignedTeam;
    if (priority) request.priority = priority;

    if (status === 'RESOLVED' || status === 'Completed') {
      request.resolvedAt = new Date();
      if (request.assignedTeam) {
        const releasedTeam = await RescueTeam.findByIdAndUpdate(
          request.assignedTeam,
          { status: 'AVAILABLE', currentMission: undefined },
          { new: true }
        );
        const io = req.app.get('io');
        if (io && releasedTeam) {
          io.emit('rescue-team-updated', releasedTeam);
        }
      }
    }
    if (status === 'ASSIGNED' || assignedTeam) {
      request.assignedAt = new Date();
    }

    // Append to timeline
    if (status) {
      if (!request.timeline) request.timeline = [];
      const userDisplayName = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email : 'Operations Coordinator';
      request.timeline.push({
        status,
        title: `Status Transition: ${status.replace(/_/g, ' ')}`,
        note: req.body.notes || `Emergency updated to ${status}`,
        timestamp: new Date(),
        updatedBy: req.user?._id,
        updatedByName: userDisplayName
      });

      // Audit Log
      await AuditLog.create({
        action: `REQUEST_STATUS_${status}`,
        performedBy: req.user?._id,
        performedByName: userDisplayName,
        targetId: request._id.toString(),
        targetType: 'ReliefRequest',
        details: {
          requestId: request.requestID,
          newStatus: status,
          priority: request.priority
        }
      });
    }

    await request.save();

    // Trigger Outbound Multilingual SMS for relevant lifecycle transitions
    if (status) {
      let smsEvent: any = null;
      const upperStatus = status.toUpperCase().replace(/\s+/g, '_');
      if (upperStatus === 'UNDER_REVIEW') smsEvent = 'EMERGENCY_UNDER_REVIEW';
      else if (upperStatus === 'VERIFIED') smsEvent = 'EMERGENCY_VERIFIED';
      else if (upperStatus === 'ASSIGNED') smsEvent = 'RESCUE_TEAM_ASSIGNED';
      else if (upperStatus === 'RESCUE_IN_PROGRESS' || upperStatus === 'IN_PROGRESS') smsEvent = 'RESCUE_OPERATION_STARTED';
      else if (upperStatus === 'RESOLVED' || upperStatus === 'COMPLETED') smsEvent = 'EMERGENCY_RESOLVED';
      else if (upperStatus === 'REJECTED') smsEvent = 'EMERGENCY_REJECTED';
      else if (upperStatus === 'DUPLICATE') smsEvent = 'EMERGENCY_MARKED_DUPLICATE';

      if (smsEvent) {
        triggerEmergencySms(request, smsEvent);
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('request-updated', request);
      io.emit('emergency-status-changed', {
        requestId: request.requestID,
        status: request.status,
        priority: request.priority
      });
    }

    res.json({ status: 'success', data: request });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
