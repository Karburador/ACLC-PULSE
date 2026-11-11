import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore.js';

export const getMaintenanceTasks = async (req: Request, res: Response) => {
  try {
    const { lab } = req.query as { lab?: string };
    const tasks = await DataStore.getMaintenanceTasks(lab);
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMaintenanceTask = async (req: Request, res: Response) => {
  try {
    const { title, lab, scheduledDate, assignedTechnician, description } = req.body;
    if (!title || !lab || !scheduledDate || !assignedTechnician) {
      return res.status(400).json({
        success: false,
        error: 'Title, Lab, Scheduled Date, and Assigned Technician are required',
      });
    }

    const task = await DataStore.createMaintenanceTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMaintenanceTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await DataStore.updateMaintenanceTask(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Maintenance record not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMaintenanceTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await DataStore.deleteMaintenanceTask(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Maintenance task not found' });
    }
    res.json({ success: true, message: 'Maintenance record removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
