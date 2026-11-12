import { Request, Response } from 'express';
import { DataStore, initDatabaseConnection, isValidMongoUri } from '../services/dataStore.js';

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const { lab } = req.query as { lab?: string };
    const metrics = await DataStore.getMetrics(lab);
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStorageLayouts = (req: Request, res: Response) => {
  try {
    const { lab } = req.query as { lab?: string };
    const layouts = DataStore.getStorageLayouts(lab);
    res.json({ success: true, data: layouts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSystemHealth = async (_req: Request, res: Response) => {
  try {
    const isAtlas = DataStore.isAtlasConnected();
    res.json({
      success: true,
      data: {
        system: 'ACLC-Pulse Asset Management System',
        institution: 'ACLC College of Manila',
        status: 'Operational',
        databaseMode: isAtlas ? 'MongoDB Atlas (Production)' : 'Local High-Speed Fallback (Preview/Offline Ready)',
        mongoUriConfigured: isValidMongoUri(process.env.MONGO_URI),
        labsManaged: [
          'COMLAB (40 units - Room 304)',
          'NETLAB (25 units - Room 306)',
          'TESDA Hardware Lab (20 units - Room 208)',
          'MACLAB (30 units - Room 302)',
          'CYBERLAB (20 units - Room 308)',
          'IOTLAB (25 units - Room 204)',
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resetData = async (req: Request, res: Response) => {
  try {
    const mode = req.body?.mode || req.query?.mode;
    if (mode === 'zero' || mode === 'wipe') {
      const result = await DataStore.wipeAllData();
      return res.json({ success: true, message: result.message, mode: 'zero' });
    }
    const result = await DataStore.resetToDefaults();
    res.json({ success: true, message: result.message, mode: 'default' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const exportReportCsv = async (req: Request, res: Response) => {
  try {
    const { type = 'inventory', lab } = req.query as { type?: string; lab?: string };

    if (type === 'borrowers') {
      const loans = await DataStore.getLoans(lab);
      const headers = ['Loan ID', 'Borrower Name', 'ID Number', 'Role', 'Department/Section', 'Asset Tag', 'Asset Name', 'Lab', 'Qty', 'Date Borrowed', 'Expected Return', 'Status'];
      const rows = loans.map((l: any) => [
        `"${l.id}"`,
        `"${l.borrowerName}"`,
        `"${l.borrowerIdNumber}"`,
        `"${l.borrowerRole}"`,
        `"${l.departmentSection}"`,
        `"${l.assetTag}"`,
        `"${l.assetName}"`,
        `"${l.lab}"`,
        l.quantity,
        `"${l.dateBorrowed}"`,
        `"${l.expectedReturnDate}"`,
        `"${l.status}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ACLC-Pulse-Borrowers-${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    // Default: Inventory export
    const assets = await DataStore.getAssets(lab);
    const headers = ['Asset Tag', 'Item Name', 'Category', 'Lab', 'Status', 'Total Qty', 'Available Qty', 'Unit', 'Cabinet/Rack', 'Shelf', 'Serial Number', 'Brand/Model'];
    const rows = assets.map((a: any) => [
      `"${a.assetTag}"`,
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.lab}"`,
      `"${a.status}"`,
      a.quantity,
      a.availableQuantity,
      `"${a.unit || 'units'}"`,
      `"${a.storageLocation?.rackOrCabinet || ''}"`,
      `"${a.storageLocation?.shelf || ''}"`,
      `"${a.serialNumber || ''}"`,
      `"${a.brandModel || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ACLC-Pulse-Inventory-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
