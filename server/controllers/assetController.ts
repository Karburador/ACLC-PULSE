import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore.js';

export const getAssets = async (req: Request, res: Response) => {
  try {
    const { lab, search, category, status } = req.query as {
      lab?: string;
      search?: string;
      category?: string;
      status?: string;
    };
    const assets = await DataStore.getAssets(lab, search, category, status);
    res.json({ success: true, data: assets, count: assets.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await DataStore.getAssetById(id);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    res.json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const { name, category, lab, quantity } = req.body;
    if (!name || !category || !lab) {
      return res.status(400).json({ success: false, error: 'Name, Category, and Lab are required fields' });
    }
    const asset = await DataStore.createAsset(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await DataStore.updateAsset(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await DataStore.deleteAsset(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Asset not found or already deleted' });
    }
    res.json({ success: true, message: 'Asset deleted or archived successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
