export type LabType = 'ALL' | 'COMLAB' | 'NETLAB' | 'TESDA';

export type AssetCategory = 'Tools' | 'Equipment' | 'Consumable Materials';

export type AssetStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Damaged' | 'Archived';

export interface Asset {
  id: string;
  _id?: string;
  assetTag: string; // e.g., ACLC-COM-001
  name: string;
  category: AssetCategory;
  lab: 'COMLAB' | 'NETLAB' | 'TESDA';
  status: AssetStatus;
  quantity: number;
  availableQuantity: number;
  unit: string; // e.g. 'unit', 'pcs', 'meters', 'box'
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

export type LoanStatus = 'Active' | 'Returned' | 'Overdue';

export interface LoanRecord {
  id: string;
  _id?: string;
  borrowerName: string;
  borrowerIdNumber: string; // Student or Faculty ID
  borrowerRole: 'Student' | 'Faculty' | 'Staff' | 'TESDA Scholar';
  departmentSection: string; // e.g. BSCS-3A, ACT-2B, TVET-CSS
  assetId: string;
  assetTag: string;
  assetName: string;
  lab: 'COMLAB' | 'NETLAB' | 'TESDA';
  quantity: number;
  dateBorrowed: string;
  expectedReturnDate: string;
  dateReturned?: string;
  status: LoanStatus;
  purpose: string;
  issuedBy: string;
  returnedNotes?: string;
}

export type KanbanColumn = 'Reported' | 'Diagnosed' | 'Under Repair' | 'Replaced/Retired';

export interface MaintenanceTask {
  id: string;
  _id?: string;
  title: string;
  assetId?: string;
  assetTag?: string;
  lab: 'COMLAB' | 'NETLAB' | 'TESDA';
  type: 'Routine Preventive' | 'PC Re-imaging' | 'Network Audit' | 'Hardware Repair' | 'Safety Inspection';
  column: KanbanColumn;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  assignedTechnician: string;
  description: string;
  diagnosis?: string;
  costEstimate?: number;
  completedDate?: string;
}

export interface LabStorageLayout {
  lab: 'COMLAB' | 'NETLAB' | 'TESDA';
  name: string;
  totalCapacityUnits: number;
  activeUnitsCount: number;
  cabinets: {
    id: string;
    name: string;
    description: string;
    shelves: {
      id: string;
      label: string;
      assignedCategory: AssetCategory;
    }[];
  }[];
}
