import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  assetTag: string;
  name: string;
  category: 'Computers' | 'Routers' | 'Tools' | 'Projectors' | 'Peripherals' | 'Consumables';
  lab: 'COMLAB' | 'NETLAB' | 'TESDA' | 'MACLAB' | 'CYBERLAB' | 'IOTLAB';
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Damaged' | 'Archived';
  quantity: number;
  availableQuantity: number;
  unit: string;
  serialNumber?: string;
  brandModel?: string;
  specs?: string;
  storageLocation: {
    rackOrCabinet: string;
    shelf: string;
    slot?: string;
  };
  acquisitionDate?: string;
  lastMaintained?: string;
  notes?: string;
}

const AssetSchema = new Schema<IAsset>(
  {
    assetTag: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Computers', 'Routers', 'Tools', 'Projectors', 'Peripherals', 'Consumables'],
      required: true,
    },
    lab: {
      type: String,
      enum: ['COMLAB', 'NETLAB', 'TESDA', 'MACLAB', 'CYBERLAB', 'IOTLAB'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Under Maintenance', 'Damaged', 'Archived'],
      default: 'Available',
    },
    quantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'unit' },
    serialNumber: { type: String, trim: true },
    brandModel: { type: String, trim: true },
    specs: { type: String, trim: true },
    storageLocation: {
      rackOrCabinet: { type: String, required: true },
      shelf: { type: String, required: true },
      slot: { type: String },
    },
    acquisitionDate: { type: String },
    lastMaintained: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const AssetModel = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
