import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratory extends Document {
  code: string;
  name: string;
  roomNumber: string;
  capacity: number;
  description?: string;
  isCustom?: boolean;
}

const LaboratorySchema = new Schema<ILaboratory>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, default: 30 },
    description: { type: String, trim: true },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const LaboratoryModel =
  mongoose.models.Laboratory || mongoose.model<ILaboratory>('Laboratory', LaboratorySchema);
