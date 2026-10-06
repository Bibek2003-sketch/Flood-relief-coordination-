import { Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import Shelter from '../models/Shelter';
import User from '../models/User';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getNgoResources = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Fetch resources belonging to this NGO, or unassigned items if any
    const resources = await InventoryItem.find({
      $or: [
        { organization: userId },
        { organization: { $exists: false } },
        { organization: null }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNgoResource = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = req.user;

    const resourceData = {
      ...req.body,
      organization: userId,
      organizationName: user?.organization || `${user?.firstName} ${user?.lastName}`.trim() || 'Partner NGO'
    };

    const item = await InventoryItem.create(resourceData);

    const io = req.app.get('io');
    if (io) {
      io.emit('inventory-updated', item);
    }

    res.status(201).json({
      success: true,
      message: 'Resource added to NGO inventory',
      data: item
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNgoResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = (req.user?.role || '').toLowerCase();

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization check: Admins can update any; NGOs can only update their own or items with no org
    const isOwner = item.organization && item.organization.toString() === userId.toString();
    const isUnassigned = !item.organization;
    const isAdmin = userRole.includes('admin');

    if (!isOwner && !isUnassigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify resources belonging to another organization'
      });
    }

    Object.assign(item, req.body);
    if (!item.organization) {
      item.organization = userId;
      item.organizationName = req.user?.organization || 'Partner NGO';
    }

    await item.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('inventory-updated', item);
    }

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: item
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNgoResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = (req.user?.role || '').toLowerCase();

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const isOwner = item.organization && item.organization.toString() === userId.toString();
    const isAdmin = userRole.includes('admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete resources belonging to another organization'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource removed from inventory'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNgoStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const resources = await InventoryItem.find({
      $or: [{ organization: userId }, { organization: null }]
    });

    const totalStock = resources.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const lowStockCount = resources.filter(item => item.quantity <= item.minimumStock).length;

    const sheltersCount = await Shelter.countDocuments();
    const distributionTasksCount = await Task.countDocuments({
      taskType: { $in: ['Food distribution', 'Water distribution', 'Relief material delivery'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalItemTypes: resources.length,
        totalStock,
        lowStockCount,
        sheltersCount,
        distributionTasksCount,
        orgName: req.user?.organization || 'NGO Partner Organization'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNgoShelters = async (req: AuthRequest, res: Response) => {
  try {
    const shelters = await Shelter.find().sort({ currentOccupancy: -1 });
    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
