export type CustodianRole = 'Admin' | 'Custodian';

export interface AuthorizedCustodian {
  email: string;
  displayName: string;
  role: CustodianRole;
  active: boolean;
  notes?: string;
  addedByEmail: string;
  ownerId: string;
  createdAt?: any;
  updatedAt?: any;
}

export type AuditAction =
  | 'ASSET_CREATE'
  | 'ASSET_UPDATE'
  | 'ASSET_DELETE'
  | 'LOAN_ISSUE'
  | 'LOAN_RETURN'
  | 'MAINT_CREATE'
  | 'MAINT_UPDATE'
  | 'MAINT_DELETE'
  | 'LAB_CREATE'
  | 'LAB_UPDATE'
  | 'LAB_DELETE'
  | 'CUSTODIAN_ADD'
  | 'CUSTODIAN_UPDATE'
  | 'CUSTODIAN_REMOVE'
  | 'CATALOG_WIPE_ZERO'
  | 'CATALOG_RESTORE_DEFAULT';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  targetType: 'asset' | 'loan' | 'maintenance' | 'laboratory' | 'custodian' | 'system';
  targetId: string;
  targetLabel: string;
  details: string;
  actorUid: string;
  actorEmail: string;
  actorName: string;
  lab?: string;
  createdAt?: any;
}

export interface Laboratory {
  code: string;
  name: string;
  roomNumber: string;
  capacity: number;
  description?: string;
  isCustom?: boolean;
  totalAssets?: number;
  activeUnits?: number;
  activeUnitsCount?: number;
  loanCount?: number;
  maintenanceCount?: number;
  createdByEmail?: string;
  lastUpdatedByEmail?: string;
}

export type LabFacility = string;

export type LabType = 'ALL' | string;

export type AssetCategory =
  | 'Computers'
  | 'Routers'
  | 'Tools'
  | 'Projectors'
  | 'Peripherals'
  | 'Consumables';

export type AssetStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Damaged' | 'Archived';

export interface Asset {
  id: string;
  _id?: string;
  assetTag: string; // e.g., ACLC-COM-001, ACLC-MAC-001
  name: string;
  category: AssetCategory;
  lab: LabFacility;
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
  monitorInfo?: {
    brandModel?: string;
    serialNumber?: string;
    specs?: string;
  };
  acquisitionDate?: string;
  lastMaintained?: string;
  notes?: string;
  createdByEmail?: string;
  lastUpdatedByEmail?: string;
}

export type LoanStatus = 'Active' | 'Returned' | 'Overdue';

export interface LoanRecord {
  id: string;
  _id?: string;
  borrowerName: string;
  borrowerIdNumber: string; // Student or Faculty ID
  borrowerRole: 'Faculty' | 'Instructor' | 'Admin' | 'Student' | 'Staff' | 'TESDA Scholar';
  departmentSection: string; // e.g. BSCS-3A, ACT-2B, TVET-CSS, BSIT-4B
  assetId: string;
  assetTag: string;
  assetName: string;
  lab: LabFacility;
  quantity: number;
  dateBorrowed: string;
  expectedReturnDate: string;
  dateReturned?: string;
  status: LoanStatus;
  purpose: string;
  issuedBy: string;
  returnedNotes?: string;
  createdByEmail?: string;
  lastUpdatedByEmail?: string;
}

export type KanbanColumn = 'Reported' | 'Diagnosed' | 'Under Repair' | 'Replaced/Retired';

export interface MaintenanceTask {
  id: string;
  _id?: string;
  title: string;
  assetId?: string;
  assetTag?: string;
  lab: LabFacility;
  type: 'Routine Preventive' | 'PC Re-imaging' | 'Network Audit' | 'Hardware Repair' | 'Safety Inspection';
  column: KanbanColumn;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  assignedTechnician: string;
  description: string;
  diagnosis?: string;
  costEstimate?: number;
  completedDate?: string;
  createdByEmail?: string;
  lastUpdatedByEmail?: string;
}

export interface LabStorageLayout {
  lab: LabFacility;
  name: string;
  roomNumber: string;
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
