import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore.js';

export const getLaboratories = async (_req: Request, res: Response) => {
  try {
    const labs = await DataStore.getLaboratories();
    res.json({ success: true, data: labs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createLaboratory = async (req: Request, res: Response) => {
  try {
    const { code, name, roomNumber, capacity, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, error: 'Laboratory code and name are required.' });
    }
    const newLab = await DataStore.createLaboratory({
      code,
      name,
      roomNumber,
      capacity: Number(capacity) || 30,
      description,
    });
    res.status(201).json({ success: true, data: newLab, message: `Laboratory ${newLab.code} created successfully.` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateLaboratory = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const updated = await DataStore.updateLaboratory(code, req.body);
    res.json({ success: true, data: updated, message: `Laboratory ${code} updated successfully.` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteLaboratory = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = await DataStore.deleteLaboratory(code, force);

    if (!result.success && result.requiresConfirmation) {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        assetCount: result.assetCount,
        message: result.message,
      });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
