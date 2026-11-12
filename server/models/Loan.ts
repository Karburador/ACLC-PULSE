import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
  borrowerName: string;
  borrowerIdNumber: string;
  borrowerRole: 'Student' | 'Faculty' | 'Staff' | 'TESDA Scholar';
  departmentSection: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  lab: 'COMLAB' | 'NETLAB' | 'TESDA' | 'MACLAB' | 'CYBERLAB' | 'IOTLAB';
  quantity: number;
  dateBorrowed: string;
  expectedReturnDate: string;
  dateReturned?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  purpose: string;
  issuedBy: string;
  returnedNotes?: string;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerName: { type: String, required: true, trim: true },
    borrowerIdNumber: { type: String, required: true, trim: true },
    borrowerRole: {
      type: String,
      enum: ['Student', 'Faculty', 'Staff', 'TESDA Scholar'],
      default: 'Student',
    },
    departmentSection: { type: String, required: true, trim: true },
    assetId: { type: String, required: true },
    assetTag: { type: String, required: true },
    assetName: { type: String, required: true },
    lab: {
      type: String,
      enum: ['COMLAB', 'NETLAB', 'TESDA', 'MACLAB', 'CYBERLAB', 'IOTLAB'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    dateBorrowed: { type: String, required: true },
    expectedReturnDate: { type: String, required: true },
    dateReturned: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active',
    },
    purpose: { type: String, required: true },
    issuedBy: { type: String, required: true, default: 'Lab Custodian' },
    returnedNotes: { type: String },
  },
  { timestamps: true }
);

export const LoanModel = mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);
