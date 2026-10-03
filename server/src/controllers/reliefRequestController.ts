import { Request, Response } from 'express';
import ReliefRequest from '../models/ReliefRequest';
import { AuthRequest } from '../middleware/auth';

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
    req.body.submittedBy = req.user?._id;
    const request = await ReliefRequest.create(req.body);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new-request', request);
    }

    res.status(201).json({ status: 'success', data: request });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.body;
    
    const request = await ReliefRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }

    if (status) request.status = status;
    if (assignedTo) request.assignedTo = assignedTo;

    await request.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('request-updated', request);
    }

    res.json({ status: 'success', data: request });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
