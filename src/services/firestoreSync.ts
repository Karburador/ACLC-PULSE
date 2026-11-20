import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
  Unsubscribe,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Asset, Laboratory, LoanRecord, MaintenanceTask } from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_LOANS,
  INITIAL_MAINTENANCE,
} from '../data/initialCatalog';

export const CAMPUS_ADMIN_EMAIL = 'barracudaskynet@gmail.com';

export const DEFAULT_LABORATORIES: Laboratory[] = [
  {
    code: 'COMLAB',
    name: 'Computer Programming & Applications Lab',
    roomNumber: 'Room 304',
    capacity: 40,
    description:
      'Dell OptiPlex Core i7 Workstations, 24" UltraSharp monitors, classroom projector, and network cabling tools.',
    isCustom: false,
  },
  {
    code: 'NETLAB',
    name: 'Cisco CCNA Networking Lab',
    roomNumber: 'Room 306',
    capacity: 25,
    description:
      'Cisco 2911 ISR routers, Catalyst 2960-X 24-port switches, Fluke MicroScanner2 verifiers, and 42U rack units.',
    isCustom: false,
  },
  {
    code: 'TESDA',
    name: 'Computer Systems Servicing (CSS NC II) Hardware Lab',
    roomNumber: 'Room 208',
    capacity: 20,
    description:
      'Modular assembly test beds, Hakko digital soldering stations, Uni-T multimeters, and component diagnosis benches.',
    isCustom: false,
  },
  {
    code: 'MACLAB',
    name: 'Multimedia & Graphic Design Studio',
    roomNumber: 'Room 302',
    capacity: 30,
    description:
      'Apple iMac 24" 4.5K Retina M3, Wacom Cintiq 16 Pro pen displays, ViewSonic 4K laser projector, and studio gear.',
    isCustom: false,
  },
  {
    code: 'CYBERLAB',
    name: 'Cybersecurity, Cloud & Server Operations Lab',
    roomNumber: 'Room 308',
    capacity: 20,
    description:
      'Dell PowerEdge R750 dual Xeon servers, Fortinet FortiGate firewalls, MikroTik 10G routers, and fiber diagnostics.',
    isCustom: false,
  },
  {
    code: 'IOTLAB',
    name: 'IoT, Robotics & Embedded Systems Lab',
    roomNumber: 'Room 204',
    capacity: 25,
    description:
      'Raspberry Pi 5 Developer Stations, Arduino Mega kits, Rigol digital oscilloscopes, and smart sensor kits.',
    isCustom: false,
  },
];

export function isCampusAdmin(user: User | null): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === CAMPUS_ADMIN_EMAIL.toLowerCase()
  );
}

function sanitizeId(raw: string, fallbackPrefix: string): string {
  const cleaned = (raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);
  if (cleaned.length > 0) return cleaned;
  return `${fallbackPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function sanitizeLabCode(raw: string): string {
  return (raw || '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 32);
}

function clampStr(raw: unknown, maxLen: number, fallback = ''): string {
  if (typeof raw !== 'string') return fallback;
  return raw.trim().slice(0, maxLen);
}

function buildScopedQuery(user: User, colName: string): Query<DocumentData> {
  const colRef = collection(db, colName);
  if (isCampusAdmin(user)) {
    return colRef;
  }
  return query(colRef, where('ownerId', '==', user.uid));
}

function buildAssetPayload(
  data: Partial<Asset>,
  id: string,
  ownerId: string,
  isCreate: boolean
) {
  const qty = Math.max(0, Math.min(100000, Number(data.quantity) || 0));
  const rawAvail =
    data.availableQuantity !== undefined ? Number(data.availableQuantity) : qty;
  const avail = Math.max(0, Math.min(qty, rawAvail));

  const rack = clampStr(data.storageLocation?.rackOrCabinet, 120, 'Long Table 1') || 'Long Table 1';
  const shelf = clampStr(data.storageLocation?.shelf, 120, 'Under Table (No Shelf)') || 'Under Table (No Shelf)';
  const slot = clampStr(data.storageLocation?.slot, 120);

  const storageLocation: Record<string, string> = {
    rackOrCabinet: rack,
    shelf,
  };
  if (slot) storageLocation.slot = slot;

  const payload: Record<string, any> = {
    id,
    assetTag: (clampStr(data.assetTag, 64) || `ACLC-${sanitizeLabCode(data.lab || 'GEN')}-${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
    name: clampStr(data.name, 160, 'Unnamed Asset') || 'Unnamed Asset',
    category: data.category || 'Computers',
    lab: sanitizeLabCode(data.lab || 'COMLAB') || 'COMLAB',
    status: data.status || 'Available',
    quantity: qty,
    availableQuantity: avail,
    unit: clampStr(data.unit, 40, 'units') || 'units',
    storageLocation,
    ownerId,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    payload.createdAt = serverTimestamp();
  }

  const serialNumber = clampStr(data.serialNumber, 100);
  const brandModel = clampStr(data.brandModel, 120);
  const specs = clampStr(data.specs, 600);
  const acquisitionDate = clampStr(data.acquisitionDate, 40);
  const lastMaintained = clampStr(data.lastMaintained, 40);
  const notes = clampStr(data.notes, 600);

  if (serialNumber) payload.serialNumber = serialNumber;
  if (brandModel) payload.brandModel = brandModel;
  if (specs) payload.specs = specs;
  if (acquisitionDate) payload.acquisitionDate = acquisitionDate;
  if (lastMaintained) payload.lastMaintained = lastMaintained;
  if (notes) payload.notes = notes;

  return payload;
}

async function commitBatchedOperations(
  ops: Array<(batch: ReturnType<typeof writeBatch>) => void>
) {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    const slice = ops.slice(i, i + CHUNK_SIZE);
    for (const op of slice) {
      op(batch);
    }
    await batch.commit();
  }
}

export const firestoreSync = {
  /**
   * Ensure first-time campus cloud database is initialized once.
   * Respects system_meta/catalog.mode === 'zero' so Reset to 0 NEVER re-seeds across browsers.
   */
  async ensureInitialized(user: User): Promise<void> {
    if (!isCampusAdmin(user)) {
      // Non-bootstrapped users operate on their own scoped documents without touching global catalog marker
      return;
    }

    const metaRef = doc(db, 'system_meta', 'catalog');
    let metaSnap;
    try {
      metaSnap = await getDoc(metaRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'system_meta/catalog');
    }

    if (metaSnap.exists()) {
      return;
    }

    // Check if labs/assets were already populated
    let existingLabs;
    try {
      existingLabs = await getDocs(buildScopedQuery(user, 'laboratories'));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'laboratories');
    }

    if (!existingLabs.empty) {
      try {
        await setDoc(metaRef, {
          initialized: true,
          mode: 'default',
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'system_meta/catalog');
      }
      return;
    }

    await this.seedDefaultCatalog(user, false);
  },

  async seedDefaultCatalog(user: User, wipeExisting = true): Promise<void> {
    try {
      const ops: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

      if (wipeExisting) {
        const [assetsSnap, loansSnap, maintSnap, labsSnap] = await Promise.all([
          getDocs(buildScopedQuery(user, 'assets')),
          getDocs(buildScopedQuery(user, 'loans')),
          getDocs(buildScopedQuery(user, 'maintenance')),
          getDocs(buildScopedQuery(user, 'laboratories')),
        ]);

        assetsSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
        loansSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
        maintSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
        labsSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
      }

      for (const lab of DEFAULT_LABORATORIES) {
        const ref = doc(db, 'laboratories', lab.code);
        ops.push((b) =>
          b.set(ref, {
            code: lab.code,
            name: clampStr(lab.name, 120),
            roomNumber: clampStr(lab.roomNumber, 60),
            capacity: Number(lab.capacity) || 30,
            description: clampStr(lab.description || '', 500),
            isCustom: Boolean(lab.isCustom),
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      for (const asset of INITIAL_ASSETS) {
        const id = sanitizeId(asset.id, 'asset');
        const ref = doc(db, 'assets', id);
        ops.push((b) => b.set(ref, buildAssetPayload(asset, id, user.uid, true)));
      }

      for (const loan of INITIAL_LOANS) {
        const id = sanitizeId(loan.id, 'loan');
        const ref = doc(db, 'loans', id);
        ops.push((b) =>
          b.set(ref, {
            id,
            borrowerName: clampStr(loan.borrowerName, 120),
            borrowerIdNumber: clampStr(loan.borrowerIdNumber, 64),
            borrowerRole: loan.borrowerRole,
            departmentSection: clampStr(loan.departmentSection, 80),
            assetId: sanitizeId(loan.assetId, 'asset'),
            assetTag: clampStr(loan.assetTag, 64),
            assetName: clampStr(loan.assetName, 160),
            lab: sanitizeLabCode(loan.lab),
            quantity: Math.max(1, Number(loan.quantity) || 1),
            dateBorrowed: clampStr(loan.dateBorrowed, 40),
            expectedReturnDate: clampStr(loan.expectedReturnDate, 40),
            status: loan.status,
            purpose: clampStr(loan.purpose, 400),
            issuedBy: clampStr(loan.issuedBy, 120),
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      for (const task of INITIAL_MAINTENANCE) {
        const id = sanitizeId(task.id, 'maint');
        const ref = doc(db, 'maintenance', id);
        const taskPayload: Record<string, any> = {
          id,
          title: clampStr(task.title, 200),
          lab: sanitizeLabCode(task.lab),
          type: task.type,
          column: task.column,
          priority: task.priority,
          scheduledDate: clampStr(task.scheduledDate, 40),
          assignedTechnician: clampStr(task.assignedTechnician, 120),
          description: clampStr(task.description, 800),
          costEstimate: Number(task.costEstimate) || 0,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (task.assetId) taskPayload.assetId = sanitizeId(task.assetId, 'asset');
        if (task.assetTag) taskPayload.assetTag = clampStr(task.assetTag, 64);
        if (task.diagnosis) taskPayload.diagnosis = clampStr(task.diagnosis, 600);
        if (task.completedDate) taskPayload.completedDate = clampStr(task.completedDate, 40);

        ops.push((b) => b.set(ref, taskPayload));
      }

      if (isCampusAdmin(user)) {
        const metaRef = doc(db, 'system_meta', 'catalog');
        ops.push((b) =>
          b.set(metaRef, {
            initialized: true,
            mode: 'default',
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      await commitBatchedOperations(ops);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seedDefaultCatalog');
    }
  },

  async wipeAllToZero(user: User): Promise<void> {
    try {
      const [assetsSnap, loansSnap, maintSnap] = await Promise.all([
        getDocs(buildScopedQuery(user, 'assets')),
        getDocs(buildScopedQuery(user, 'loans')),
        getDocs(buildScopedQuery(user, 'maintenance')),
      ]);

      const ops: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
      assetsSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
      loansSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
      maintSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));

      if (isCampusAdmin(user)) {
        const metaRef = doc(db, 'system_meta', 'catalog');
        const metaSnap = await getDoc(metaRef);
        if (metaSnap.exists()) {
          ops.push((b) =>
            b.update(metaRef, {
              initialized: true,
              mode: 'zero',
              updatedAt: serverTimestamp(),
            })
          );
        } else {
          ops.push((b) =>
            b.set(metaRef, {
              initialized: true,
              mode: 'zero',
              ownerId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          );
        }
      }

      await commitBatchedOperations(ops);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'wipeAllToZero');
    }
  },

  subscribeToAll(
    user: User,
    callbacks: {
      onLaboratories: (labs: Laboratory[]) => void;
      onAssets: (assets: Asset[]) => void;
      onLoans: (loans: LoanRecord[]) => void;
      onMaintenance: (tasks: MaintenanceTask[]) => void;
      onError: (err: Error) => void;
    }
  ): Unsubscribe {
    const unsubs: Unsubscribe[] = [];

    const unsubLabs = onSnapshot(
      buildScopedQuery(user, 'laboratories'),
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            code: data.code || d.id,
            name: data.name || '',
            roomNumber: data.roomNumber || '',
            capacity: Number(data.capacity) || 30,
            description: data.description || '',
            isCustom: Boolean(data.isCustom),
          } as Laboratory;
        });
        list.sort((a, b) => a.code.localeCompare(b.code));
        callbacks.onLaboratories(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'laboratories');
        } catch (wrapped: any) {
          callbacks.onError(wrapped);
        }
      }
    );
    unsubs.push(unsubLabs);

    const unsubAssets = onSnapshot(
      buildScopedQuery(user, 'assets'),
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            ...(data as Asset),
            id: data.id || d.id,
          };
        });
        callbacks.onAssets(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'assets');
        } catch (wrapped: any) {
          callbacks.onError(wrapped);
        }
      }
    );
    unsubs.push(unsubAssets);

    const unsubLoans = onSnapshot(
      buildScopedQuery(user, 'loans'),
      (snap) => {
        const today = new Date().toISOString().split('T')[0];
        const list = snap.docs.map((d) => {
          const data = d.data() as LoanRecord;
          let status = data.status;
          if (status === 'Active' && data.expectedReturnDate < today) {
            status = 'Overdue';
          }
          return {
            ...data,
            id: data.id || d.id,
            status,
          };
        });
        callbacks.onLoans(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'loans');
        } catch (wrapped: any) {
          callbacks.onError(wrapped);
        }
      }
    );
    unsubs.push(unsubLoans);

    const unsubMaint = onSnapshot(
      buildScopedQuery(user, 'maintenance'),
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as MaintenanceTask;
          return {
            ...data,
            id: data.id || d.id,
          };
        });
        list.sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));
        callbacks.onMaintenance(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'maintenance');
        } catch (wrapped: any) {
          callbacks.onError(wrapped);
        }
      }
    );
    unsubs.push(unsubMaint);

    return () => {
      unsubs.forEach((u) => u());
    };
  },

  // LABORATORIES
  async createLaboratory(
    user: User,
    data: { code: string; name: string; roomNumber: string; capacity?: number; description?: string }
  ) {
    const code = sanitizeLabCode(data.code);
    if (!code) throw new Error('Laboratory code identifier is required (e.g. ROBOTICS)');

    const ref = doc(db, 'laboratories', code);
    try {
      const existing = await getDoc(ref);
      if (existing.exists()) {
        throw new Error(`Laboratory code "${code}" already exists.`);
      }

      const payload: Record<string, any> = {
        code,
        name: clampStr(data.name, 120, `${code} Laboratory`) || `${code} Laboratory`,
        roomNumber: clampStr(data.roomNumber, 60, 'Room TBD') || 'Room TBD',
        capacity: Math.max(1, Math.min(10000, Number(data.capacity) || 30)),
        isCustom: true,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const desc = clampStr(data.description, 500);
      if (desc) payload.description = desc;

      await setDoc(ref, payload);
    } catch (err: any) {
      if (err?.message?.includes('already exists')) throw err;
      handleFirestoreError(err, OperationType.CREATE, `laboratories/${code}`);
    }
  },

  async updateLaboratory(code: string, updates: Partial<Laboratory>) {
    const upperCode = sanitizeLabCode(code);
    const ref = doc(db, 'laboratories', upperCode);
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Laboratory "${code}" not found.`);
      }
      const updatePayload: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.name !== undefined) {
        updatePayload.name = clampStr(updates.name, 120, snap.data().name) || snap.data().name;
      }
      if (updates.roomNumber !== undefined) {
        updatePayload.roomNumber = clampStr(updates.roomNumber, 60, snap.data().roomNumber) || snap.data().roomNumber;
      }
      if (updates.capacity !== undefined) {
        updatePayload.capacity = Math.max(1, Math.min(10000, Number(updates.capacity) || 30));
      }
      if (updates.description !== undefined) {
        updatePayload.description = clampStr(updates.description, 500);
      }

      await updateDoc(ref, updatePayload);
    } catch (err: any) {
      if (err?.message?.includes('not found')) throw err;
      handleFirestoreError(err, OperationType.UPDATE, `laboratories/${upperCode}`);
    }
  },

  async deleteLaboratory(
    user: User,
    code: string
  ): Promise<{
    success: boolean;
    blocked?: boolean;
    assetCount?: number;
    loanCount?: number;
    maintenanceCount?: number;
    message?: string;
  }> {
    const upperCode = sanitizeLabCode(code);
    try {
      const [assetsSnap, loansSnap, maintSnap] = await Promise.all([
        getDocs(buildScopedQuery(user, 'assets')),
        getDocs(buildScopedQuery(user, 'loans')),
        getDocs(buildScopedQuery(user, 'maintenance')),
      ]);

      const assetCount = assetsSnap.docs.filter(
        (d) => (d.data().lab || '').toUpperCase() === upperCode
      ).length;
      const loanCount = loansSnap.docs.filter(
        (d) => (d.data().lab || '').toUpperCase() === upperCode
      ).length;
      const maintenanceCount = maintSnap.docs.filter(
        (d) => (d.data().lab || '').toUpperCase() === upperCode
      ).length;

      if (assetCount > 0 || loanCount > 0 || maintenanceCount > 0) {
        const parts: string[] = [];
        if (assetCount > 0) parts.push(`${assetCount} asset(s)`);
        if (loanCount > 0) parts.push(`${loanCount} loan record(s)`);
        if (maintenanceCount > 0) parts.push(`${maintenanceCount} maintenance ticket(s)`);

        return {
          success: false,
          blocked: true,
          assetCount,
          loanCount,
          maintenanceCount,
          message: `Security Block: Cannot delete "${upperCode}" because it still contains ${parts.join(', ')}. Please delete or transfer all records before removing this laboratory.`,
        };
      }

      await deleteDoc(doc(db, 'laboratories', upperCode));
      return {
        success: true,
        message: `Laboratory "${upperCode}" has been safely removed.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `laboratories/${upperCode}`);
    }
  },

  // ASSETS
  async createAsset(user: User, data: Partial<Asset>) {
    const id = sanitizeId('', 'asset');
    const payload = buildAssetPayload(data, id, user.uid, true);
    try {
      await setDoc(doc(db, 'assets', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assets/${id}`);
    }
  },

  async updateAsset(id: string, updates: Partial<Asset>) {
    const docId = sanitizeId(id, 'asset');
    const ref = doc(db, 'assets', docId);
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Asset "${id}" not found.`);
      }
      const current = snap.data() as Asset & { ownerId: string; createdAt: any };
      const merged: Partial<Asset> = {
        ...current,
        ...updates,
        storageLocation: updates.storageLocation || current.storageLocation,
      };
      const payload = buildAssetPayload(merged, docId, current.ownerId, false);
      delete payload.id;
      delete payload.ownerId;
      await updateDoc(ref, payload);
    } catch (err: any) {
      if (err?.message?.includes('not found')) throw err;
      handleFirestoreError(err, OperationType.UPDATE, `assets/${docId}`);
    }
  },

  async deleteAsset(id: string) {
    const docId = sanitizeId(id, 'asset');
    try {
      await deleteDoc(doc(db, 'assets', docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `assets/${docId}`);
    }
  },

  // LOANS
  async createLoan(user: User, data: Partial<LoanRecord>, allAssets: Asset[]) {
    const id = sanitizeId('', 'loan');
    const asset = allAssets.find((a) => a.id === data.assetId);
    if (!asset) {
      throw new Error('Selected asset could not be found.');
    }

    const qty = Math.max(1, Math.min(10000, Number(data.quantity) || 1));
    const newAvail = Math.max(0, (asset.availableQuantity || 0) - qty);
    const newStatus = newAvail === 0 ? 'In Use' : asset.status;

    try {
      const batch = writeBatch(db);
      const assetRef = doc(db, 'assets', asset.id);
      batch.update(assetRef, {
        availableQuantity: newAvail,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      const loanRef = doc(db, 'loans', id);
      batch.set(loanRef, {
        id,
        borrowerName: clampStr(data.borrowerName, 120, 'Borrower') || 'Borrower',
        borrowerIdNumber: clampStr(data.borrowerIdNumber, 64, 'ID-PENDING') || 'ID-PENDING',
        borrowerRole: data.borrowerRole || 'Student',
        departmentSection: clampStr(data.departmentSection, 80, 'General') || 'General',
        assetId: asset.id,
        assetTag: clampStr(asset.assetTag, 64),
        assetName: clampStr(asset.name, 160),
        lab: sanitizeLabCode(asset.lab),
        quantity: qty,
        dateBorrowed: clampStr(data.dateBorrowed, 40) || new Date().toISOString().split('T')[0],
        expectedReturnDate:
          clampStr(data.expectedReturnDate, 40) || new Date().toISOString().split('T')[0],
        status: 'Active',
        purpose: clampStr(data.purpose, 400, 'Laboratory Practical Coursework') || 'Laboratory Practical Coursework',
        issuedBy: clampStr(data.issuedBy, 120, 'Lab Custodian') || 'Lab Custodian',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `loans/${id}`);
    }
  },

  async returnLoan(id: string, notes: string | undefined, allLoans: LoanRecord[], allAssets: Asset[]) {
    const docId = sanitizeId(id, 'loan');
    const loan = allLoans.find((l) => l.id === docId);
    if (!loan) {
      throw new Error('Loan record not found.');
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const batch = writeBatch(db);
      const loanRef = doc(db, 'loans', docId);
      const loanUpdate: Record<string, any> = {
        status: 'Returned',
        dateReturned: today,
        updatedAt: serverTimestamp(),
      };
      const cleanNotes = clampStr(notes, 400);
      if (cleanNotes) {
        loanUpdate.returnedNotes = cleanNotes;
      }
      batch.update(loanRef, loanUpdate);

      const asset = allAssets.find((a) => a.id === loan.assetId);
      if (asset) {
        const restoredQty = Math.min(
          asset.quantity,
          (asset.availableQuantity || 0) + (loan.quantity || 1)
        );
        batch.update(doc(db, 'assets', asset.id), {
          availableQuantity: restoredQty,
          status: 'Available',
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `loans/${docId}`);
    }
  },

  // MAINTENANCE
  async createMaintenanceTask(user: User, data: Partial<MaintenanceTask>) {
    const id = sanitizeId('', 'maint');
    try {
      const batch = writeBatch(db);
      const payload: Record<string, any> = {
        id,
        title: clampStr(data.title, 200, 'Maintenance Ticket') || 'Maintenance Ticket',
        lab: sanitizeLabCode(data.lab || 'COMLAB') || 'COMLAB',
        type: data.type || 'Hardware Repair',
        column: data.column || 'Reported',
        priority: data.priority || 'Medium',
        scheduledDate:
          clampStr(data.scheduledDate, 40) || new Date().toISOString().split('T')[0],
        assignedTechnician:
          clampStr(data.assignedTechnician, 120, 'Lab Technician') || 'Lab Technician',
        description:
          clampStr(data.description, 800) ||
          clampStr(data.title, 200, 'Facility check') ||
          'Facility check',
        costEstimate: Math.max(0, Number(data.costEstimate) || 0),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const assetId = clampStr(data.assetId, 128);
      const assetTag = clampStr(data.assetTag, 64);
      const diagnosis = clampStr(data.diagnosis, 600);
      if (assetId) {
        payload.assetId = sanitizeId(assetId, 'asset');
        const assetSnap = await getDoc(doc(db, 'assets', payload.assetId));
        if (assetSnap.exists()) {
          batch.update(doc(db, 'assets', payload.assetId), {
            status: payload.column === 'Replaced/Retired' ? 'Archived' : 'Under Maintenance',
            updatedAt: serverTimestamp(),
          });
        }
      }
      if (assetTag) payload.assetTag = assetTag;
      if (diagnosis) payload.diagnosis = diagnosis;

      batch.set(doc(db, 'maintenance', id), payload);
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `maintenance/${id}`);
    }
  },

  async updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>, allTasks: MaintenanceTask[]) {
    const docId = sanitizeId(id, 'maint');
    const existingTask = allTasks.find((t) => t.id === docId);

    try {
      const batch = writeBatch(db);
      const updatePayload: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.column !== undefined) updatePayload.column = updates.column;
      if (updates.priority !== undefined) updatePayload.priority = updates.priority;
      if (updates.diagnosis !== undefined) updatePayload.diagnosis = clampStr(updates.diagnosis, 600);
      if (updates.costEstimate !== undefined) updatePayload.costEstimate = Math.max(0, Number(updates.costEstimate) || 0);
      if (updates.completedDate !== undefined) updatePayload.completedDate = clampStr(updates.completedDate, 40);
      if (updates.assignedTechnician !== undefined) updatePayload.assignedTechnician = clampStr(updates.assignedTechnician, 120);
      if (updates.description !== undefined) updatePayload.description = clampStr(updates.description, 800);

      if (updates.column === 'Replaced/Retired') {
        if (!updates.completedDate) {
          updatePayload.completedDate = new Date().toISOString().split('T')[0];
        }
        if (existingTask?.assetId) {
          const assetSnap = await getDoc(doc(db, 'assets', existingTask.assetId));
          if (assetSnap.exists()) {
            batch.update(doc(db, 'assets', existingTask.assetId), {
              status: 'Available',
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      batch.update(doc(db, 'maintenance', docId), updatePayload);
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `maintenance/${docId}`);
    }
  },

  async deleteMaintenanceTask(id: string) {
    const docId = sanitizeId(id, 'maint');
    try {
      await deleteDoc(doc(db, 'maintenance', docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `maintenance/${docId}`);
    }
  },
};
