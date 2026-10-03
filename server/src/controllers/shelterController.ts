import { Request, Response } from 'express';
import Shelter from '../models/Shelter';
import { AuthRequest } from '../middleware/auth';

export const getShelters = async (req: Request, res: Response) => {
  try {
    const { operatingStatus, womenFriendly, medicalSupport } = req.query;
    
    let query: any = {};
    if (operatingStatus) query.operatingStatus = operatingStatus;
    if (womenFriendly === 'true') query['facilities.womenFriendly'] = true;
    if (medicalSupport === 'true') query['facilities.medicalSupport'] = true;

    const shelters = await Shelter.find(query).populate('managerId', 'firstName lastName phone');
    
    res.json({ status: 'success', count: shelters.length, data: shelters });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createShelter = async (req: AuthRequest, res: Response) => {
  try {
    const shelter = await Shelter.create(req.body);
    res.status(201).json({ status: 'success', data: shelter });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateOccupancy = async (req: AuthRequest, res: Response) => {
  try {
    const { currentOccupancy } = req.body;
    const shelter = await Shelter.findById(req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ status: 'error', message: 'Shelter not found' });
    }

    if (currentOccupancy > shelter.capacity) {
      return res.status(400).json({ status: 'error', message: 'Occupancy cannot exceed max capacity' });
    }

    shelter.currentOccupancy = currentOccupancy;
    await shelter.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('shelter-updated', shelter);
    }

    res.json({ status: 'success', data: shelter });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
