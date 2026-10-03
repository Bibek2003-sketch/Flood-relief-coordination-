import { Request, Response } from 'express';
import FloodIncident from '../models/FloodIncident';
import { AuthRequest } from '../middleware/auth';

// Get all incidents
export const getIncidents = async (req: Request, res: Response) => {
  try {
    const { status, severity, district } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (district) query.district = district;

    const incidents = await FloodIncident.find(query).sort({ createdAt: -1 });
    
    res.json({ status: 'success', count: incidents.length, data: incidents });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single incident
export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const incident = await FloodIncident.findById(req.params.id).populate('reportedBy', 'firstName lastName email');
    
    if (!incident) {
      return res.status(404).json({ status: 'error', message: 'Incident not found' });
    }
    
    res.json({ status: 'success', data: incident });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create new incident
export const createIncident = async (req: AuthRequest, res: Response) => {
  try {
    // Inject user ID
    req.body.reportedBy = req.user?._id;
    
    const incident = await FloodIncident.create(req.body);
    
    // Emit socket event for real-time dashboard update
    const io = req.app.get('io');
    if (io) {
      io.emit('new-incident', incident);
    }

    res.status(201).json({ status: 'success', data: incident });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update incident
export const updateIncident = async (req: AuthRequest, res: Response) => {
  try {
    const incident = await FloodIncident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({ status: 'error', message: 'Incident not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('incident-updated', incident);
    }

    res.json({ status: 'success', data: incident });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete incident
export const deleteIncident = async (req: AuthRequest, res: Response) => {
  try {
    const incident = await FloodIncident.findByIdAndDelete(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ status: 'error', message: 'Incident not found' });
    }

    res.json({ status: 'success', data: {} });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
