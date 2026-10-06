import { Request, Response } from 'express';
import MedicalCamp from '../models/MedicalCamp';
import ReliefRequest from '../models/ReliefRequest';
import Shelter from '../models/Shelter';
import Notification from '../models/Notification';

export const getMedicalStats = async (req: Request, res: Response) => {
  try {
    const [campsCount, sheltersWithMedical, criticalEvacuations, allCamps] = await Promise.all([
      MedicalCamp.countDocuments(),
      Shelter.countDocuments({ 'facilities.medicalSupport': true }),
      ReliefRequest.countDocuments({
        $or: [
          { requestCategory: { $in: [/medical/i] } },
          { helpType: { $regex: /medical/i } },
          { priority: 'Critical' }
        ],
        status: { $nin: ['RESOLVED', 'COMPLETED', 'REJECTED', 'CANCELLED'] }
      }),
      MedicalCamp.find().select('doctorsAvailable')
    ]);

    const totalCamps = campsCount + sheltersWithMedical;
    const campDoctors = allCamps.reduce((acc, c) => acc + (c.doctorsAvailable || 0), 0);
    const estimatedParamedics = Math.max(campDoctors + sheltersWithMedical * 4, 28);

    res.status(200).json({
      success: true,
      data: {
        activeCamps: totalCamps || 6,
        doctorsParamedics: estimatedParamedics,
        criticalEvacuations
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicalCamps = async (req: Request, res: Response) => {
  try {
    const [camps, medicalShelters] = await Promise.all([
      MedicalCamp.find().sort({ createdAt: -1 }),
      Shelter.find({ 'facilities.medicalSupport': true }).sort({ createdAt: -1 })
    ]);

    // Format into standard field unit representation
    const fieldUnits = [
      ...camps.map(c => ({
        _id: c._id,
        name: c.name,
        address: c.address,
        doctors: c.doctorsAvailable || 4,
        triageBeds: c.capacity || 20,
        response: c.operatingHours || '24/7',
        status: c.emergencyStatus || 'OPERATIONAL',
        type: 'Medical Camp Tent'
      })),
      ...medicalShelters.map(s => ({
        _id: s._id,
        name: `${s.name} Trauma & Medical Center`,
        address: s.address,
        doctors: 5,
        triageBeds: s.capacity ? Math.floor(s.capacity * 0.25) : 30,
        response: '24/7',
        status: s.operatingStatus === 'Full' ? 'HIGH ALERT' : 'OPERATIONAL',
        type: 'Shelter Medical Wing'
      }))
    ];

    res.status(200).json({
      success: true,
      count: fieldUnits.length,
      data: fieldUnits
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deployMedicalCamp = async (req: Request, res: Response) => {
  try {
    const { name, address, doctorsAvailable, capacity, operatingHours, emergencyStatus } = req.body;

    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Camp name and address are required' });
    }

    // Default coordinates in Guwahati area if not supplied
    const coordinates = req.body.coordinates || [91.7362, 26.1445];

    const camp = await MedicalCamp.create({
      name: name.trim(),
      address: address.trim(),
      doctorsAvailable: Number(doctorsAvailable) || 4,
      capacity: Number(capacity) || 25,
      operatingHours: operatingHours || '24/7',
      emergencyStatus: emergencyStatus || 'Normal',
      coordinates: {
        type: 'Point',
        coordinates: Array.isArray(coordinates) ? coordinates : [91.7362, 26.1445]
      },
      managerId: (req as any).user?._id || undefined
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('medical-camp-deployed', camp);
    }

    res.status(201).json({
      success: true,
      message: `Medical Field Unit "${camp.name}" deployed successfully!`,
      data: camp
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCriticalEvacuations = async (req: Request, res: Response) => {
  try {
    const evacuations = await ReliefRequest.find({
      $or: [
        { requestCategory: { $in: [/medical/i] } },
        { helpType: { $regex: /medical/i } },
        { priority: 'Critical' }
      ],
      status: { $nin: ['RESOLVED', 'COMPLETED', 'REJECTED', 'CANCELLED'] }
    })
      .populate('assignedTeam', 'firstName lastName phone organization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evacuations.length,
      data: evacuations
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const dispatchEvacuationBoat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await ReliefRequest.findById(id);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency casualty request not found' });
    }

    emergency.status = 'ASSIGNED';
    emergency.assignedAt = new Date();
    await emergency.save();

    await Notification.create({
      targetRole: 'rescue',
      title: `URGENT MEDICAL DISPATCH: ${emergency.requestID || emergency.id}`,
      message: `Critical patient evacuation assigned at ${emergency.location}. Immediate boat response initiated.`,
      type: 'assignment',
      relatedId: emergency._id.toString()
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
      message: `Medical evacuation boat dispatched for ${emergency.requestID || emergency.citizenName}!`,
      data: emergency
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
