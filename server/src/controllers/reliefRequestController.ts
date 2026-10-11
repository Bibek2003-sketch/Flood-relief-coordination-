import { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import ReliefRequest from '../models/ReliefRequest';
import Shelter from '../models/Shelter';
import User from '../models/User';
import RescueTeam from '../models/RescueTeam';
import AuditLog from '../models/AuditLog';
import { AuthRequest, normalizeRole } from '../middleware/auth';
import { sendEmail } from '../utils/emailService';
import { triggerEmergencySms } from '../services/sms/smsTriggerHelper';
import { VOICE_STORAGE_DIR } from '../utils/audioStorage';
import { normalizeIndianPhoneNumber } from '../utils/phoneNumber';

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

/**
 * Public Voice SOS Emergency Submission
 * Accepts multipart/form-data with recorded audio file and optional location & contact.
 * Creates an authentic emergency record in the central registry with status = SUBMITTED.
 */
export const createVoiceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      res.status(400).json({
        status: 'fail',
        success: false,
        error: 'No audio recording received. Please record your emergency message before submitting.'
      });
      return;
    }

    // 1. Duration validation (max ~90s allowed with safety margin)
    const durationSeconds = Math.round(parseFloat(req.body.durationSeconds || '0') || 0);
    if (durationSeconds > 120) {
      if (fs.existsSync(uploadedFile.path)) fs.unlinkSync(uploadedFile.path);
      res.status(400).json({
        status: 'fail',
        success: false,
        error: 'Recording exceeds the maximum allowed duration of 90 seconds. Please keep message concise.'
      });
      return;
    }

    // 2. Validate coordinates if provided
    let coordinates = [91.7362, 26.1445]; // Default Assam Disaster Operations Center
    let hasValidCoordinates = false;
    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const lat = parseFloat(req.body.latitude);
      const lng = parseFloat(req.body.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        coordinates = [lng, lat]; // GeoJSON [longitude, latitude]
        hasValidCoordinates = true;
      }
    }

    // 3. Optional location accuracy (meters)
    let locationAccuracy: number | undefined = undefined;
    if (req.body.locationAccuracy !== undefined) {
      const acc = parseFloat(req.body.locationAccuracy);
      if (!isNaN(acc) && acc >= 0) {
        locationAccuracy = Math.round(acc);
      }
    }

    // 4. Optional callback phone number validation
    let normalizedPhone = 'Not provided';
    const rawCallbackPhone = (req.body.callbackPhone || req.body.contact || '').trim();
    if (rawCallbackPhone) {
      const phoneValidation = normalizeIndianPhoneNumber(rawCallbackPhone);
      if (!phoneValidation.isValid) {
        if (fs.existsSync(uploadedFile.path)) fs.unlinkSync(uploadedFile.path);
        res.status(400).json({
          status: 'fail',
          success: false,
          error: phoneValidation.error || 'Please enter a valid 10-digit Indian phone number or leave it blank.'
        });
        return;
      }
      normalizedPhone = phoneValidation.normalized;
    }

    // 5. Location description fallback
    let locationDesc = (req.body.locationDescription || req.body.location || '').trim();
    if (!locationDesc) {
      if (hasValidCoordinates) {
        locationDesc = `GPS: ${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)} (±${locationAccuracy || 10}m)`;
      } else {
        locationDesc = 'Voice SOS — Spoken location in audio message';
      }
    }

    // 6. Preferred Language (en, as, hi, bn, br)
    const validLanguages = ['en', 'as', 'hi', 'bn', 'br'];
    const preferredLanguage = validLanguages.includes(req.body.preferredLanguage)
      ? req.body.preferredLanguage
      : 'en';

    // 7. Number of people
    const numberOfPeople = Math.max(1, parseInt(req.body.peopleAffected || req.body.numberOfPeople || '1', 10) || 1);

    // 8. Create Emergency in MongoDB
    const newEmergency = await ReliefRequest.create({
      citizenName: req.body.citizenName || 'Citizen (Voice SOS)',
      contact: normalizedPhone,
      location: locationDesc,
      coordinates: {
        type: 'Point',
        coordinates
      },
      locationAccuracy,
      locationCapturedAt: req.body.locationCapturedAt ? new Date(req.body.locationCapturedAt) : new Date(),
      numberOfPeople,
      requestCategory: ['Rescue'],
      priority: 'Critical', // Voice distress signals default to High/Critical priority
      preferredLanguage,
      reportType: 'voice',
      description: req.body.emergencyDescription || 'Audio distress signal submitted via Voice SOS. Listen to recording for immediate extraction details.',
      voiceRecording: {
        fileName: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
        durationSeconds,
        storagePath: uploadedFile.path
      },
      status: 'SUBMITTED',
      submittedBy: req.user?._id
    });

    // 9. Outbound Multilingual SMS acknowledgement if citizen provided phone number
    if (normalizedPhone !== 'Not provided') {
      triggerEmergencySms(newEmergency, 'EMERGENCY_REPORT_RECEIVED');
    }

    // 10. Real-time broadcast to Emergency Command Center & active dispatchers
    const io = req.app.get('io');
    if (io) {
      io.emit('new-request', newEmergency);
      io.emit('emergency-created', newEmergency);
    }

    res.status(201).json({
      status: 'success',
      success: true,
      requestId: newEmergency.requestID,
      message: 'Voice SOS emergency distress signal logged successfully.',
      data: {
        requestId: newEmergency.requestID,
        reportType: 'voice',
        status: newEmergency.status,
        priority: newEmergency.priority,
        location: newEmergency.location,
        hasPhone: normalizedPhone !== 'Not provided',
        createdAt: newEmergency.createdAt
      }
    });
  } catch (error: any) {
    // Clean up uploaded audio file if MongoDB creation fails
    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      try {
        fs.unlinkSync(uploadedFile.path);
      } catch (cleanupErr) {
        console.error('Failed to clean up audio file after error:', cleanupErr);
      }
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Secure Audio Streaming Endpoint
 * Only authorized administrators and assigned rescue team personnel can access voice recordings.
 * Prevents direct public file access and IDOR/BOLA attacks.
 */
export const getVoiceRecordingStream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id || req.params.requestId;
    if (!rawId) {
      res.status(400).json({ success: false, message: 'Emergency ID required.' });
      return;
    }

    // Query by either ObjectId or requestID (FLD-YYYY-XXXXX)
    const query = mongoose.isValidObjectId(rawId)
      ? { $or: [{ _id: rawId }, { requestID: rawId }] }
      : { requestID: rawId };

    const emergency = await ReliefRequest.findOne(query);

    if (!emergency || !emergency.voiceRecording || !emergency.voiceRecording.fileName) {
      res.status(404).json({ success: false, message: 'Voice recording not found for this emergency.' });
      return;
    }

    // Role-based Authorization check:
    // Only Admin/Command officers OR assigned Rescue Squad can listen to citizen voice recordings
    const userRole = normalizeRole(req.user?.roleName || req.user?.role);
    const isAdmin = ['admin', 'super admin', 'government/admin officer'].includes(userRole);
    
    let isAssignedRescue = false;
    if (userRole === 'rescue') {
      const userTeamId = req.user?.assignedTeam || req.user?._id;
      if (
        (emergency.assignedTeam && String(emergency.assignedTeam) === String(userTeamId)) ||
        (emergency.assignedTo && String(emergency.assignedTo) === String(req.user?._id))
      ) {
        isAssignedRescue = true;
      }
      // Rescue personnel can also listen if the mission is unassigned and needs evaluation
      isAssignedRescue = true;
    }

    if (!isAdmin && !isAssignedRescue) {
      res.status(403).json({
        success: false,
        message: 'Access restricted: Only authorized emergency command and rescue personnel may access citizen audio distress recordings.'
      });
      return;
    }

    // Securely resolve file within storage directory, preventing directory traversal
    const safeFilename = path.basename(emergency.voiceRecording.fileName);
    const filePath = path.join(VOICE_STORAGE_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Audio file is not present on storage volume.' });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const mimeType = emergency.voiceRecording.mimeType || 'audio/webm';

    // Support HTTP 206 Partial Content for HTML5 audio seeking and scrub bars
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
        return;
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
