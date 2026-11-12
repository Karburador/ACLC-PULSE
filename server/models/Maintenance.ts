import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenance extends Document {
  title: string;
  assetId?: string;
  assetTag?: string;
  lab: 'COMLAB' | 'NETLAB' | 'TESDA' | 'MACLAB' | 'CYBERLAB' | 'IOTLAB';
  type: 'Routine Preventive' | 'PC Re-imaging' | 'Network Audit' | 'Hardware Repair' | 'Safety Inspection';
  column: 'Reported' | 'Diagnosed' | 'Under Repair' | 'Replaced/Retired';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  assignedTechnician: string;
  description: string;
  diagnosis?: string;
  costEstimate?: number;
  completedDate?: string;
}

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    title: { type: String, required: true, trim: true },
    assetId: { type: String },
    assetTag: { type: String },
    lab: {
      type: String,
      enum: ['COMLAB', 'NETLAB', 'TESDA', 'MACLAB', 'CYBERLAB', 'IOTLAB'],
      required: true,
    },
    type: {
      type: String,
      enum: ['Routine Preventive', 'PC Re-imaging', 'Network Audit', 'Hardware Repair', 'Safety Inspection'],
      default: 'Routine Preventive',
    },
    column: {
      type: String,
      enum: ['Reported', 'Diagnosed', 'Under Repair', 'Replaced/Retired'],
      default: 'Reported',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    scheduledDate: { type: String, required: true },
    assignedTechnician: { type: String, required: true },
    description: { type: String, required: true },
    diagnosis: { type: String },
    costEstimate: { type: Number, default: 0 },
    completedDate: { type: String },
  },
  { timestamps: true }
);

export const MaintenanceModel =
  mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
