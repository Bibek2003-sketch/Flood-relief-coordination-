import { Request, Response } from 'express';
import RescueOperation from '../models/RescueOperation';
import ReliefRequest from '../models/ReliefRequest';
import RescueTeam from '../models/RescueTeam';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { triggerEmergencySms } from '../services/sms/smsTriggerHelper';

export const getRescueOperations = async (req: Request, res: Response) => {
  try {
    const { status, teamId } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (teamId) query.assignedTeam = teamId;

    const operations = await RescueOperation.find(query)
      .populate('assignedTeam', 'firstName lastName phone')
      .populate('requestId')
      .sort({ createdAt: -1 });
    
    res.json({ status: 'success', count: operations.length, data: operations });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMyRescueMissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Find any rescue squads linked to this user
    const userTeams = await RescueTeam.find({
      $or: [{ userId }, { contactNumber: req.user?.contactNumber }]
    });
    const teamIds = [userId, ...userTeams.map(t => t._id)];

    // Fetch emergencies directly assigned to this rescue unit or team
    const assignedEmergencies = await ReliefRequest.find({
      $or: [
        { assignedTeam: { $in: teamIds } },
        { assignedTo: { $in: teamIds } }
      ]
    }).populate('assignedTeam').sort({ updatedAt: -1 });

    // Also fetch any traditional RescueOperation entries
    const operations = await RescueOperation.find({
      assignedTeam: { $in: teamIds }
    })
      .populate('requestId')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      success: true,
      count: assignedEmergencies.length,
      data: {
        emergencies: assignedEmergencies,
        operations
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateMissionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, peopleRescued } = req.body;
    const userId = req.user?._id;

    // Find any teams linked to this user
    const userTeams = await RescueTeam.find({
      $or: [{ userId }, { contactNumber: req.user?.contactNumber }]
    });
    const teamIds = [userId, ...userTeams.map(t => t._id)];

    // Check if it's a ReliefRequest
    let emergency = await ReliefRequest.findOne({
      _id: id,
      $or: [
        { assignedTeam: { $in: teamIds } },
        { assignedTo: { $in: teamIds } }
      ]
    });

    if (emergency) {
      // Map statuses: ASSIGNED -> ACCEPTED -> ON_THE_WAY -> RESCUE_IN_PROGRESS -> COMPLETED
      emergency.status = status;
      if (notes) emergency.notes = notes;
      if (status === 'COMPLETED' || status === 'RESOLVED') {
        emergency.resolvedAt = new Date();
        // Release assigned rescue team back to AVAILABLE
        if (emergency.assignedTeam) {
          const releasedTeam = await RescueTeam.findByIdAndUpdate(
            emergency.assignedTeam,
            { status: 'AVAILABLE', currentMission: undefined },
            { new: true }
          );
          const io = req.app.get('io');
          if (io && releasedTeam) {
            io.emit('rescue-team-updated', releasedTeam);
          }
        }
      }

      if (!emergency.timeline) emergency.timeline = [];
      const rescueAgentName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Field Rescue Unit';
      emergency.timeline.push({
        status,
        title: `Rescue Mission: ${status.replace(/_/g, ' ')}`,
        note: notes || (peopleRescued ? `Evacuated ${peopleRescued} people.` : `Mission status marked as ${status}`),
        timestamp: new Date(),
        updatedBy: userId,
        updatedByName: rescueAgentName
      });

      await emergency.save();

      // Trigger Outbound Multilingual SMS for operational rescue events
      if (status === 'ACCEPTED') {
        triggerEmergencySms(emergency, 'RESCUE_TEAM_ACCEPTED');
      } else if (status === 'ON_THE_WAY') {
        triggerEmergencySms(emergency, 'RESCUE_TEAM_EN_ROUTE');
      } else if (status === 'ARRIVED') {
        triggerEmergencySms(emergency, 'RESCUE_TEAM_ARRIVED');
      } else if (status === 'RESCUE_IN_PROGRESS') {
        triggerEmergencySms(emergency, 'ASSISTANCE_IN_PROGRESS');
      } else if (status === 'DELAYED') {
        triggerEmergencySms(emergency, 'TEMPORARILY_DELAYED');
      } else if (status === 'COMPLETED' || status === 'RESOLVED') {
        triggerEmergencySms(emergency, 'REPORT_RESOLVED');
      }

      // Create Audit Log
      await AuditLog.create({
        action: `MISSION_STATUS_${status}`,
        performedBy: userId,
        performedByName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        targetId: emergency._id.toString(),
        targetType: 'ReliefRequest',
        details: {
          requestId: emergency.requestID,
          newStatus: status,
          peopleRescued,
          notes
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('emergency-status-changed', {
          requestId: emergency.requestID,
          status: emergency.status,
          priority: emergency.priority
        });
        io.emit('request-updated', emergency);
      }

      return res.status(200).json({
        success: true,
        message: `Mission status updated to ${status}`,
        data: emergency
      });
    }

    // Otherwise check RescueOperation
    const operation = await RescueOperation.findOne({
      _id: id,
      assignedTeam: userId
    });

    if (operation) {
      if (status) operation.status = status;
      if (peopleRescued !== undefined) operation.peopleRescued = peopleRescued;
      if (notes) operation.notes = notes;
      await operation.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('rescue-updated', operation);
      }

      return res.status(200).json({
        success: true,
        message: `Operation status updated to ${status}`,
        data: operation
      });
    }

    return res.status(404).json({ success: false, message: 'Assigned mission not found or unauthorized' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRescueStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const [activeEmergencies, completedEmergencies, activeOps, completedOps] = await Promise.all([
      ReliefRequest.countDocuments({
        $or: [{ assignedTeam: userId }, { assignedTo: userId }],
        status: { $in: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'RESCUE_IN_PROGRESS', 'Assigned', 'In Progress'] }
      }),
      ReliefRequest.countDocuments({
        $or: [{ assignedTeam: userId }, { assignedTo: userId }],
        status: { $in: ['RESOLVED', 'COMPLETED', 'Completed', 'Resolved'] }
      }),
      RescueOperation.countDocuments({
        assignedTeam: userId,
        status: { $in: ['Assigned', 'Team Dispatched', 'En Route', 'Rescue in Progress'] }
      }),
      RescueOperation.countDocuments({
        assignedTeam: userId,
        status: 'Completed'
      })
    ]);

    res.json({
      success: true,
      data: {
        activeMissions: activeEmergencies + activeOps,
        completedMissions: completedEmergencies + completedOps,
        totalAssigned: activeEmergencies + completedEmergencies + activeOps + completedOps
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRescueOperation = async (req: AuthRequest, res: Response) => {
  try {
    const { assignedTeam } = req.body;
    if (assignedTeam) {
      const activeMission = await RescueOperation.findOne({ 
        assignedTeam, 
        status: { $in: ['Assigned', 'Team Dispatched', 'En Route', 'Rescue in Progress'] } 
      });
      if (activeMission) {
        return res.status(400).json({ status: 'error', message: 'Team is already on an active mission' });
      }
    }

    const operation = await RescueOperation.create(req.body);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('rescue-dispatched', operation);
    }

    res.status(201).json({ status: 'success', data: operation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateRescueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, peopleRescued, notes } = req.body;
    
    const operation = await RescueOperation.findById(req.params.id);
    if (!operation) {
      return res.status(404).json({ status: 'error', message: 'Operation not found' });
    }

    if (status) operation.status = status;
    if (peopleRescued !== undefined) operation.peopleRescued = peopleRescued;
    if (notes) operation.notes = notes;

    await operation.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('rescue-updated', operation);
    }

    res.json({ status: 'success', data: operation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
