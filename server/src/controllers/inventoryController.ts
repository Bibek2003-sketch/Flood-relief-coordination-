import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import { AuthRequest } from '../middleware/auth';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { category, lowStock } = req.query;
    let query: any = {};
    if (category) query.category = category;
    
    let items = await InventoryItem.find(query).sort({ itemName: 1 });
    
    if (lowStock === 'true') {
      items = items.filter(item => item.quantity < item.minimumStock);
    }
    
    res.json({ status: 'success', count: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const addInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateInventoryQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Item not found' });
    }

    item.quantity = quantity;
    await item.save();

    const io = req.app.get('io');
    if (io && item.quantity < item.minimumStock) {
      io.emit('inventory-alert', { message: `Low stock alert for ${item.itemName}`, item });
    }

    res.json({ status: 'success', data: item });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
