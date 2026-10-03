import { Request, Response } from 'express';
import RescueOperation from '../models/RescueOperation';
import { AuthRequest } from '../middleware/auth';

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
    const operations = await RescueOperation.find({ assignedTeam: req.user?._id })
      .populate('requestId')
      .sort({ createdAt: -1 });
    
    res.json({ status: 'success', count: operations.length, data: operations });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createRescueOperation = async (req: AuthRequest, res: Response) => {
  try {
    // Check business rule: "A rescue team cannot be assigned to two active missions simultaneously"
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
