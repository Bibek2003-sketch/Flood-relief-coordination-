import { Request, Response } from 'express';
import ReliefRequest from '../models/ReliefRequest';
import User from '../models/User';
import Shelter from '../models/Shelter';
import InventoryItem from '../models/InventoryItem';
import RescueOperation from '../models/RescueOperation';
import Notification from '../models/Notification';
import RescueTeam from '../models/RescueTeam';
import AuditLog from '../models/AuditLog';
import { ensureDemoRescueTeams } from '../utils/rescueTeamSeeder';
import { AuthRequest } from '../middleware/auth';

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalEmergencies,
      criticalEmergencies,
      pendingEmergencies,
      activeRescues,
      completedRescues,
      rescueTeamsCount,
      volunteersCount,
      ngosCount,
      reliefCampsCount,
      inventorySummary
    ] = await Promise.all([
      ReliefRequest.countDocuments(),
      ReliefRequest.countDocuments({ priority: 'Critical', status: { $nin: ['RESOLVED', 'COMPLETED', 'REJECTED', 'CANCELLED'] } }),
      ReliefRequest.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'Pending', 'Verified'] } }),
      ReliefRequest.countDocuments({ status: { $in: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'RESCUE_IN_PROGRESS', 'Assigned', 'In Progress'] } }),
      ReliefRequest.countDocuments({ status: { $in: ['RESOLVED', 'COMPLETED', 'Completed', 'Resolved'] } }),
      RescueTeam.countDocuments({ status: { $ne: 'MAINTENANCE' } }),
      User.countDocuments({
        $or: [{ roleName: 'volunteer' }, { role: { $in: ['volunteer', 'Volunteer'] } }],
        status: { $ne: 'suspended' }
      }),
      User.countDocuments({
        $or: [{ roleName: 'ngo' }, { role: { $in: ['ngo', 'NGO Coordinator'] } }],
        status: { $ne: 'suspended' }
      }),
      Shelter.countDocuments(),
      InventoryItem.aggregate([
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$quantity', '$minimumStock'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const inventoryStats = inventorySummary[0] || { totalItems: 0, totalQuantity: 0, lowStockCount: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalEmergencies,
        criticalEmergencies,
        pendingEmergencies,
        activeRescues,
        completedRescues,
        rescueTeamsCount,
        volunteersCount,
        ngosCount,
        reliefCampsCount,
        inventoryStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmergencies = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, search } = req.query;
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }
    if (search) {
      const searchStr = String(search).trim();
      query.$or = [
        { requestID: { $regex: searchStr, $options: 'i' } },
        { name: { $regex: searchStr, $options: 'i' } },
        { location: { $regex: searchStr, $options: 'i' } },
        { contact: { $regex: searchStr, $options: 'i' } }
      ];
    }

    const emergencies = await ReliefRequest.find(query)
      .populate('assignedTeam')
      .populate('assignedTo', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRescueTeams = async (req: AuthRequest, res: Response) => {
  try {
    await ensureDemoRescueTeams();
    const { availableOnly, status } = req.query;

    const query: any = {};
    if (availableOnly === 'true' || status === 'AVAILABLE') {
      query.status = 'AVAILABLE';
    } else if (status && status !== 'ALL') {
      query.status = status;
    }

    const teams = await RescueTeam.find(query)
      .populate('currentMission', 'requestID location priority status')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignRescueTeam = async (req: AuthRequest, res: Response) => {
  try {
    await ensureDemoRescueTeams();
    const { id } = req.params;
    const { assignedTeamId, priority } = req.body;

    if (!assignedTeamId) {
      return res.status(400).json({ success: false, message: 'Please select a rescue team to assign' });
    }

    const emergency = await ReliefRequest.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    // 1. Find RescueTeam by _id or teamId
    let rescueTeam = await RescueTeam.findById(assignedTeamId);
    if (!rescueTeam) {
      rescueTeam = await RescueTeam.findOne({ teamId: assignedTeamId });
    }

    // 2. Fallback to User if needed
    let teamUser = null;
    if (!rescueTeam) {
      teamUser = await User.findById(assignedTeamId);
      if (!teamUser) {
        return res.status(404).json({ success: false, message: 'Rescue squad or team member not found' });
      }
    }

    // 3. Ensure team is not already on an active mission
    if (
      rescueTeam &&
      rescueTeam.status !== 'AVAILABLE' &&
      rescueTeam.currentMission &&
      rescueTeam.currentMission.toString() !== emergency._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: `Rescue team "${rescueTeam.name}" is already on an active mission (${rescueTeam.status}) and cannot be dispatched.`
      });
    }

    // 4. If emergency previously had another team assigned, release that team
    if (emergency.assignedTeam && rescueTeam && emergency.assignedTeam.toString() !== rescueTeam._id.toString()) {
      await RescueTeam.findByIdAndUpdate(emergency.assignedTeam, {
        status: 'AVAILABLE',
        currentMission: undefined
      });
    }

    const teamDisplayName = rescueTeam ? rescueTeam.name : `${teamUser?.firstName} ${teamUser?.lastName}`;
    const targetUserId = rescueTeam?.userId || teamUser?._id;

    // 5. Update Emergency record
    emergency.assignedTeam = (rescueTeam ? rescueTeam._id : teamUser?._id) as any;
    if (targetUserId) {
      emergency.assignedTo = targetUserId as any;
    }
    emergency.status = 'ASSIGNED';
    emergency.assignedAt = new Date();
    if (priority) {
      emergency.priority = priority;
    }
    if (!emergency.timeline) emergency.timeline = [];
    const coordinatorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Operations HQ';
    emergency.timeline.push({
      status: 'ASSIGNED',
      title: `Rescue Squad Assigned: ${teamDisplayName}`,
      note: `Unit dispatched to ${emergency.location}. Operational priority: ${emergency.priority}.`,
      timestamp: new Date(),
      updatedBy: req.user?._id,
      updatedByName: coordinatorName
    });
    await emergency.save();

    // 6. Update RescueTeam status to ON_MISSION
    if (rescueTeam) {
      rescueTeam.status = 'ON_MISSION';
      rescueTeam.currentMission = emergency._id as any;
      await rescueTeam.save();
    }

    // 7. Create Audit Log
    await AuditLog.create({
      action: 'DISPATCH_RESCUE_TEAM',
      performedBy: req.user?._id,
      performedByName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      targetId: emergency._id.toString(),
      targetType: 'ReliefRequest',
      details: {
        emergencyId: emergency.requestID,
        assignedTeamId: rescueTeam?.teamId || teamUser?._id,
        teamName: teamDisplayName,
        location: emergency.location,
        priority: emergency.priority
      }
    });

    // 8. Create Notification for Rescue Squad
    if (targetUserId) {
      await Notification.create({
        recipient: targetUserId,
        targetRole: 'rescue',
        title: `Emergency Assigned: ${emergency.requestID || emergency.id}`,
        message: `Your squad (${teamDisplayName}) has been assigned to an emergency at ${emergency.location}. Priority: ${emergency.priority}.`,
        type: 'assignment',
        relatedId: emergency._id.toString()
      });
    }

    // 9. Broadcast real-time Socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency-status-changed', {
        requestId: emergency.requestID,
        status: emergency.status,
        priority: emergency.priority,
        assignedTeamName: teamDisplayName
      });
      io.emit('request-updated', emergency);
      if (rescueTeam) {
        io.emit('rescue-team-updated', rescueTeam);
      }
    }

    const populated = await ReliefRequest.findById(id)
      .populate('assignedTeam')
      .populate('assignedTo', 'firstName lastName organization phone');

    res.status(200).json({
      success: true,
      message: `Rescue team "${teamDisplayName}" assigned to emergency ${emergency.requestID}`,
      data: populated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmergency = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, priority, notes } = req.body;

    const emergency = await ReliefRequest.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    emergency.status = verified ? 'VERIFIED' : 'REJECTED';
    emergency.verifiedAt = new Date();
    if (priority) emergency.priority = priority;
    if (notes) emergency.notes = notes;

    if (!emergency.timeline) emergency.timeline = [];
    const coordinatorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Operations HQ';
    emergency.timeline.push({
      status: emergency.status,
      title: verified ? 'Emergency Distress Verified' : 'Emergency Report Rejected',
      note: notes || (verified ? `Field report verified for dispatch. Priority: ${emergency.priority}` : 'Report marked as invalid/duplicate'),
      timestamp: new Date(),
      updatedBy: req.user?._id,
      updatedByName: coordinatorName
    });

    await emergency.save();

    await AuditLog.create({
      action: verified ? 'VERIFY_EMERGENCY' : 'REJECT_EMERGENCY',
      performedBy: req.user?._id,
      performedByName: coordinatorName,
      targetId: emergency._id.toString(),
      targetType: 'ReliefRequest',
      details: {
        requestId: emergency.requestID,
        status: emergency.status,
        priority: emergency.priority,
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

    res.status(200).json({
      success: true,
      message: `Emergency marked as ${emergency.status}`,
      data: emergency
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmergencyPriority = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const emergency = await ReliefRequest.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    const oldPriority = emergency.priority;
    emergency.priority = priority;

    if (!emergency.timeline) emergency.timeline = [];
    const coordinatorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Operations HQ';
    emergency.timeline.push({
      status: emergency.status,
      title: `Priority Escalation: ${priority.toUpperCase()}`,
      note: `Priority changed from ${oldPriority} to ${priority} by operations command`,
      timestamp: new Date(),
      updatedBy: req.user?._id,
      updatedByName: coordinatorName
    });

    await emergency.save();

    await AuditLog.create({
      action: 'UPDATE_PRIORITY',
      performedBy: req.user?._id,
      performedByName: coordinatorName,
      targetId: emergency._id.toString(),
      targetType: 'ReliefRequest',
      details: {
        requestId: emergency.requestID,
        oldPriority,
        newPriority: priority
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

    res.status(200).json({ success: true, data: emergency });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmergencyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const emergency = await ReliefRequest.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    emergency.status = status;
    if (notes) emergency.notes = notes;
    if (status === 'RESOLVED' || status === 'COMPLETED') {
      emergency.resolvedAt = new Date();
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
    const coordinatorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Operations HQ';
    emergency.timeline.push({
      status,
      title: `Operational Transition: ${status.replace(/_/g, ' ')}`,
      note: notes || `Status updated to ${status} by disaster command officer`,
      timestamp: new Date(),
      updatedBy: req.user?._id,
      updatedByName: coordinatorName
    });

    await emergency.save();

    await AuditLog.create({
      action: `STATUS_CHANGE_${status}`,
      performedBy: req.user?._id,
      performedByName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      targetId: emergency._id.toString(),
      targetType: 'ReliefRequest',
      details: {
        emergencyId: emergency.requestID,
        status,
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

    res.status(200).json({ success: true, data: emergency });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOperationalUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    const query: any = {};

    if (role) {
      if (role === 'rescue') {
        query.$or = [{ roleName: 'rescue' }, { role: { $in: ['rescue', 'Rescue Team'] } }];
      } else if (role === 'volunteer') {
        query.$or = [{ roleName: 'volunteer' }, { role: { $in: ['volunteer', 'Volunteer'] } }];
      } else if (role === 'ngo') {
        query.$or = [{ roleName: 'ngo' }, { role: { $in: ['ngo', 'NGO Coordinator'] } }];
      } else {
        query.$or = [{ roleName: role }, { role }];
      }
    } else {
      query.$or = [
        { roleName: { $in: ['rescue', 'volunteer', 'ngo'] } },
        { role: { $in: ['rescue', 'Rescue Team', 'volunteer', 'Volunteer', 'ngo', 'NGO Coordinator'] } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const coordinatorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Operations HQ';
    await AuditLog.create({
      action: `USER_STATUS_${status.toUpperCase()}`,
      performedBy: req.user?._id,
      performedByName: coordinatorName,
      targetId: user._id.toString(),
      targetType: 'User',
      details: {
        userId: user._id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        role: user.roleName || user.role,
        newStatus: status
      }
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await AuditLog.find()
      .populate('performedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
