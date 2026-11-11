import { Router } from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/assetController.js';
import {
  getLoans,
  createLoan,
  returnLoan,
} from '../controllers/loanController.js';
import {
  getMaintenanceTasks,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
} from '../controllers/maintenanceController.js';
import {
  getMetrics,
  getStorageLayouts,
  getSystemHealth,
  resetData,
  exportReportCsv,
} from '../controllers/systemController.js';

const router = Router();

// Assets
router.get('/assets', getAssets);
router.get('/assets/:id', getAssetById);
router.post('/assets', createAsset);
router.put('/assets/:id', updateAsset);
router.delete('/assets/:id', deleteAsset);

// Loans / Dispensing
router.get('/loans', getLoans);
router.post('/loans', createLoan);
router.post('/loans/:id/return', returnLoan);

// Maintenance & Kanban
router.get('/maintenance', getMaintenanceTasks);
router.post('/maintenance', createMaintenanceTask);
router.put('/maintenance/:id', updateMaintenanceTask);
router.delete('/maintenance/:id', deleteMaintenanceTask);

// System & Reports
router.get('/metrics', getMetrics);
router.get('/storage/layouts', getStorageLayouts);
router.get('/system/health', getSystemHealth);
router.post('/system/reset', resetData);
router.get('/reports/export', exportReportCsv);

export default router;
