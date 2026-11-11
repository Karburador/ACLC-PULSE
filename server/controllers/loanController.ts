import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore.js';

export const getLoans = async (req: Request, res: Response) => {
  try {
    const { lab, status } = req.query as { lab?: string; status?: string };
    const loans = await DataStore.getLoans(lab, status);
    res.json({ success: true, data: loans, count: loans.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createLoan = async (req: Request, res: Response) => {
  try {
    const { borrowerName, borrowerIdNumber, assetId, quantity, expectedReturnDate } = req.body;
    if (!borrowerName || !borrowerIdNumber || !assetId || !expectedReturnDate) {
      return res.status(400).json({
        success: false,
        error: 'Borrower Name, ID Number, Asset, and Expected Return Date are required',
      });
    }

    // Verify asset availability
    const asset = await DataStore.getAssetById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Target item not found in lab inventory' });
    }

    const borrowQty = Number(quantity) || 1;
    if (asset.availableQuantity < borrowQty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient available quantity. Only ${asset.availableQuantity} ${asset.unit || 'unit(s)'} available for dispensing.`,
      });
    }

    const loanPayload = {
      ...req.body,
      assetTag: asset.assetTag,
      assetName: asset.name,
      lab: asset.lab,
    };

    const loan = await DataStore.createLoan(loanPayload);
    res.status(201).json({ success: true, data: loan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const returnLoan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const returned = await DataStore.returnLoan(id, notes);
    if (!returned) {
      return res.status(404).json({ success: false, error: 'Loan record not found' });
    }
    res.json({ success: true, data: returned, message: 'Item successfully returned and inventory restored.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
