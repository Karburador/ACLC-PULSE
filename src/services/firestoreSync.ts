import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  deleteField,
  writeBatch,
  Unsubscribe,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Asset,
  AuditAction,
  AuditLogEntry,
  AuthorizedCustodian,
  CustodianRole,
  Laboratory,
  LoanRecord,
  MaintenanceTask,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_LOANS,
  INITIAL_MAINTENANCE,
} from '../data/initialCatalog';

export const CAMPUS_ADMIN_EMAIL = 'barracudaskynet@gmail.com';
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

export function normalizeEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function isCampusAdmin(user: User | null): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      normalizeEmail(user.email) === CAMPUS_ADMIN_EMAIL.toLowerCase()
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

function getMetaDocId(_user: User): string {
  return 'catalog';
}

function getLabDocId(_user: User, code: string): string {
  return sanitizeLabCode(code);
}

function getItemPrefix(_user: User): string {
  return '';
}

function buildScopedQuery(_user: User, colName: string): Query<DocumentData> {
  return collection(db, colName);
}

function buildAuditBatchOp(
  user: User,
  params: {
    action: AuditAction;
    targetType: AuditLogEntry['targetType'];
    targetId: string;
    targetLabel: string;
    details: string;
    lab?: string;
  }
): (batch: ReturnType<typeof writeBatch>) => void {
  const id = sanitizeId('', 'audit');
  const actorEmail = normalizeEmail(user.email);
  const actorName =
    clampStr(user.displayName || actorEmail.split('@')[0] || 'Custodian', 120) || 'Custodian';

  const payload: Record<string, any> = {
    id,
    action: params.action,
    targetType: params.targetType,
    targetId: clampStr(params.targetId, 128, 'system') || 'system',
    targetLabel: clampStr(params.targetLabel, 200, 'System Record') || 'System Record',
    details: clampStr(params.details, 500, 'Operation logged') || 'Operation logged',
    actorUid: user.uid,
    actorEmail,
    actorName,
    createdAt: serverTimestamp(),
  };

  const cleanLab = params.lab ? sanitizeLabCode(params.lab) : '';
  if (cleanLab) {
    payload.lab = cleanLab;
  }

  return (batch) => batch.set(doc(db, 'audit_logs', id), payload);
}

function buildAssetPayload(
  data: Partial<Asset>,
  id: string,
  ownerId: string,
  actorEmail: string,
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
    lastUpdatedByEmail: actorEmail,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    payload.createdByEmail = actorEmail;
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

  if ((data.category || 'Computers') === 'Computers' && data.monitorInfo) {
    const monBrand = clampStr(data.monitorInfo.brandModel, 120);
    const monSerial = clampStr(data.monitorInfo.serialNumber, 100);
    const monSpecs = clampStr(data.monitorInfo.specs, 200);
    if (monBrand || monSerial || monSpecs) {
      const monitorInfo: Record<string, string> = {};
      if (monBrand) monitorInfo.brandModel = monBrand;
      if (monSerial) monitorInfo.serialNumber = monSerial;
      if (monSpecs) monitorInfo.specs = monSpecs;
      payload.monitorInfo = monitorInfo;
    }
  }

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
   * Verify user's Google email against the Admin-managed authorized_custodians allowlist.
   * Bootstrapped Head Admin (barracudaskynet@gmail.com) is always authorized and auto-registered.
   */
  async checkCustodianAccess(user: User): Promise<{
    authorized: boolean;
    role: CustodianRole | null;
    inactive: boolean;
    record: AuthorizedCustodian | null;
  }> {
    if (!user.emailVerified || !user.email) {
      return { authorized: false, role: null, inactive: false, record: null };
    }

    const emailKey = normalizeEmail(user.email);
    const ref = doc(db, 'authorized_custodians', emailKey);

    try {
      const snap = await getDoc(ref);

      if (isCampusAdmin(user)) {
        if (!snap.exists()) {
          const batch = writeBatch(db);
          batch.set(ref, {
            email: emailKey,
            displayName:
              clampStr(user.displayName || 'Head Campus Admin', 120) || 'Head Campus Admin',
            role: 'Admin',
            active: true,
            notes: 'Bootstrapped Campus Head Administrator',
            addedByEmail: emailKey,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await batch.commit();
        }
        const existingData = snap.exists() ? (snap.data() as AuthorizedCustodian) : null;
        return {
          authorized: true,
          role: 'Admin',
          inactive: false,
          record: existingData,
        };
      }

      if (!snap.exists()) {
        return { authorized: false, role: null, inactive: false, record: null };
      }

      const record = snap.data() as AuthorizedCustodian;
      if (record.active !== true) {
        return { authorized: false, role: null, inactive: true, record };
      }

      return {
        authorized: true,
        role: record.role === 'Admin' ? 'Admin' : 'Custodian',
        inactive: false,
        record,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `authorized_custodians/${emailKey}`);
    }
  },

  /**
   * Ensure first-time campus cloud database is initialized once.
   * Respects system_meta/catalog.mode === 'zero' so Reset to 0 NEVER re-seeds across browsers.
   */
  async ensureInitialized(user: User, role: CustodianRole): Promise<void> {
    if (!user.emailVerified) {
      return;
    }

    const metaDocId = getMetaDocId(user);
    const metaRef = doc(db, 'system_meta', metaDocId);
    let metaSnap;
    try {
      metaSnap = await getDoc(metaRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `system_meta/${metaDocId}`);
    }

    if (metaSnap.exists()) {
      return;
    }

    // Only Admins can initialize or seed the shared campus catalog
    if (role !== 'Admin') {
      return;
    }

    let existingLabs;
    try {
      existingLabs = await getDocs(buildScopedQuery(user, 'laboratories'));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'laboratories');
    }

    const actorEmail = normalizeEmail(user.email);
    if (!existingLabs.empty) {
      try {
        const batch = writeBatch(db);
        batch.set(metaRef, {
          initialized: true,
          mode: 'default',
          ownerId: user.uid,
          lastUpdatedByEmail: actorEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `system_meta/${metaDocId}`);
      }
      return;
    }

    await this.seedDefaultCatalog(user, false);
  },

  async seedDefaultCatalog(user: User, wipeExisting = true): Promise<void> {
    try {
      const ops: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
      const prefix = getItemPrefix(user);
      const metaDocId = getMetaDocId(user);
      const actorEmail = normalizeEmail(user.email);

      if (wipeExisting) {
        const [assetsSnap, loansSnap, maintSnap, labsSnap] = await Promise.all([
          getDocs(buildScopedQuery(user, 'assets')),
          getDocs(buildScopedQuery(user, 'loans')),
          getDocs(buildScopedQuery(user, 'maintenance')),
          getDocs(buildScopedQuery(user, 'laboratories')),
        ]);

        const deleteOps: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
        assetsSnap.docs.forEach((d) => deleteOps.push((b) => b.delete(d.ref)));
        loansSnap.docs.forEach((d) => deleteOps.push((b) => b.delete(d.ref)));
        maintSnap.docs.forEach((d) => deleteOps.push((b) => b.delete(d.ref)));
        labsSnap.docs.forEach((d) => deleteOps.push((b) => b.delete(d.ref)));
        if (deleteOps.length > 0) {
          await commitBatchedOperations(deleteOps);
        }
      }

      for (const lab of DEFAULT_LABORATORIES) {
        const ref = doc(db, 'laboratories', getLabDocId(user, lab.code));
        ops.push((b) =>
          b.set(ref, {
            code: lab.code,
            name: clampStr(lab.name, 120),
            roomNumber: clampStr(lab.roomNumber, 60),
            capacity: Number(lab.capacity) || 30,
            description: clampStr(lab.description || '', 500),
            isCustom: Boolean(lab.isCustom),
            ownerId: user.uid,
            createdByEmail: actorEmail,
            lastUpdatedByEmail: actorEmail,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      const assetIdMap = new Map<string, string>();
      for (const asset of INITIAL_ASSETS) {
        const id = sanitizeId(`${prefix}${asset.id}`, 'asset');
        assetIdMap.set(asset.id, id);
        const ref = doc(db, 'assets', id);
        ops.push((b) => b.set(ref, buildAssetPayload(asset, id, user.uid, actorEmail, true)));
      }

      for (const loan of INITIAL_LOANS) {
        const id = sanitizeId(`${prefix}${loan.id}`, 'loan');
        const mappedAssetId =
          assetIdMap.get(loan.assetId) || sanitizeId(`${prefix}${loan.assetId}`, 'asset');
        const ref = doc(db, 'loans', id);
        ops.push((b) =>
          b.set(ref, {
            id,
            borrowerName: clampStr(loan.borrowerName, 120),
            borrowerIdNumber: clampStr(loan.borrowerIdNumber, 64),
            borrowerRole: loan.borrowerRole,
            departmentSection: clampStr(loan.departmentSection, 80),
            assetId: mappedAssetId,
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
            createdByEmail: actorEmail,
            lastUpdatedByEmail: actorEmail,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      for (const task of INITIAL_MAINTENANCE) {
        const id = sanitizeId(`${prefix}${task.id}`, 'maint');
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
          createdByEmail: actorEmail,
          lastUpdatedByEmail: actorEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (task.assetId) {
          taskPayload.assetId =
            assetIdMap.get(task.assetId) || sanitizeId(`${prefix}${task.assetId}`, 'asset');
        }
        if (task.assetTag) taskPayload.assetTag = clampStr(task.assetTag, 64);
        if (task.diagnosis) taskPayload.diagnosis = clampStr(task.diagnosis, 600);
        if (task.completedDate) taskPayload.completedDate = clampStr(task.completedDate, 40);

        ops.push((b) => b.set(ref, taskPayload));
      }

      const metaRef = doc(db, 'system_meta', metaDocId);
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        ops.push((b) =>
          b.update(metaRef, {
            initialized: true,
            mode: 'default',
            lastUpdatedByEmail: actorEmail,
            updatedAt: serverTimestamp(),
          })
        );
      } else {
        ops.push((b) =>
          b.set(metaRef, {
            initialized: true,
            mode: 'default',
            ownerId: user.uid,
            lastUpdatedByEmail: actorEmail,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      ops.push(
        buildAuditBatchOp(user, {
          action: 'CATALOG_RESTORE_DEFAULT',
          targetType: 'system',
          targetId: 'catalog',
          targetLabel: 'ACLC Default Campus Catalog (160 Units)',
          details: wipeExisting
            ? 'Wiped workspace and restored 6 default labs with 160 core equipment units.'
            : 'Initialized default campus catalog for first-time setup.',
        })
      );

      await commitBatchedOperations(ops);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seedDefaultCatalog');
    }
  },

  async wipeAllToZero(user: User): Promise<void> {
    try {
      const actorEmail = normalizeEmail(user.email);
      const [assetsSnap, loansSnap, maintSnap] = await Promise.all([
        getDocs(buildScopedQuery(user, 'assets')),
        getDocs(buildScopedQuery(user, 'loans')),
        getDocs(buildScopedQuery(user, 'maintenance')),
      ]);

      const ops: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
      assetsSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
      loansSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
      maintSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));

      const metaDocId = getMetaDocId(user);
      const metaRef = doc(db, 'system_meta', metaDocId);
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        ops.push((b) =>
          b.update(metaRef, {
            initialized: true,
            mode: 'zero',
            lastUpdatedByEmail: actorEmail,
            updatedAt: serverTimestamp(),
          })
        );
      } else {
        ops.push((b) =>
          b.set(metaRef, {
            initialized: true,
            mode: 'zero',
            ownerId: user.uid,
            lastUpdatedByEmail: actorEmail,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      }

      ops.push(
        buildAuditBatchOp(user, {
          action: 'CATALOG_WIPE_ZERO',
          targetType: 'system',
          targetId: 'catalog',
          targetLabel: 'System Reset to 0',
          details: `Purged ${assetsSnap.size} assets, ${loansSnap.size} loans, and ${maintSnap.size} maintenance tickets.`,
        })
      );

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
            createdByEmail: data.createdByEmail,
            lastUpdatedByEmail: data.lastUpdatedByEmail,
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

  subscribeToSecurityData(
    role: CustodianRole,
    callbacks: {
      onCustodians?: (list: AuthorizedCustodian[]) => void;
      onAuditLogs: (logs: AuditLogEntry[]) => void;
      onError: (err: Error) => void;
    }
  ): Unsubscribe {
    const unsubs: Unsubscribe[] = [];

    const unsubLogs = onSnapshot(
      collection(db, 'audit_logs'),
      (snap) => {
        const logs = snap.docs.map((d) => {
          const data = d.data() as AuditLogEntry;
          return { ...data, id: data.id || d.id };
        });
        logs.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() ?? 0;
          const tB = b.createdAt?.toMillis?.() ?? 0;
          return tB - tA;
        });
        callbacks.onAuditLogs(logs.slice(0, 200));
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'audit_logs');
        } catch (wrapped: any) {
          callbacks.onError(wrapped);
        }
      }
    );
    unsubs.push(unsubLogs);

    if (role === 'Admin' && callbacks.onCustodians) {
      const unsubCustodians = onSnapshot(
        collection(db, 'authorized_custodians'),
        (snap) => {
          const list = snap.docs.map((d) => {
            const data = d.data() as AuthorizedCustodian;
            return { ...data, email: data.email || d.id };
          });
          list.sort((a, b) => {
            if (a.email === CAMPUS_ADMIN_EMAIL) return -1;
            if (b.email === CAMPUS_ADMIN_EMAIL) return 1;
            if (a.role !== b.role) return a.role === 'Admin' ? -1 : 1;
            return a.email.localeCompare(b.email);
          });
          callbacks.onCustodians?.(list);
        },
        (err) => {
          try {
            handleFirestoreError(err, OperationType.LIST, 'authorized_custodians');
          } catch (wrapped: any) {
            callbacks.onError(wrapped);
          }
        }
      );
      unsubs.push(unsubCustodians);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  },

  // CUSTODIAN ROSTER MANAGEMENT (Admin Only)
  async addAuthorizedCustodian(
    user: User,
    input: { email: string; displayName: string; role: CustodianRole; notes?: string }
  ) {
    const emailKey = normalizeEmail(input.email);
    if (!EMAIL_REGEX.test(emailKey) || emailKey.length > 128) {
      throw new Error('Please enter a valid Gmail or Google Workspace email address.');
    }

    const ref = doc(db, 'authorized_custodians', emailKey);
    try {
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        throw new Error(`Account "${emailKey}" is already registered in the Custodian Roster.`);
      }

      const actorEmail = normalizeEmail(user.email);
      const batch = writeBatch(db);
      const payload: Record<string, any> = {
        email: emailKey,
        displayName: clampStr(input.displayName, 120, emailKey.split('@')[0]) || emailKey.split('@')[0],
        role: input.role === 'Admin' ? 'Admin' : 'Custodian',
        active: true,
        addedByEmail: actorEmail,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const cleanNotes = clampStr(input.notes, 300);
      if (cleanNotes) payload.notes = cleanNotes;

      batch.set(ref, payload);
      buildAuditBatchOp(user, {
        action: 'CUSTODIAN_ADD',
        targetType: 'custodian',
        targetId: emailKey,
        targetLabel: `${payload.displayName} (${emailKey})`,
        details: `Authorized ${emailKey} with role "${payload.role}".`,
      })(batch);

      await batch.commit();
    } catch (err: any) {
      if (err?.message?.includes('already registered')) throw err;
      handleFirestoreError(err, OperationType.CREATE, `authorized_custodians/${emailKey}`);
    }
  },

  async updateAuthorizedCustodian(
    user: User,
    emailKeyRaw: string,
    updates: { displayName?: string; role?: CustodianRole; active?: boolean; notes?: string }
  ) {
    const emailKey = normalizeEmail(emailKeyRaw);
    if (emailKey === CAMPUS_ADMIN_EMAIL.toLowerCase() && (updates.role === 'Custodian' || updates.active === false)) {
      throw new Error('Head Campus Administrator cannot be demoted or suspended.');
    }

    const ref = doc(db, 'authorized_custodians', emailKey);
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Custodian "${emailKey}" not found.`);
      }

      const batch = writeBatch(db);
      const updatePayload: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.displayName !== undefined) {
        updatePayload.displayName = clampStr(updates.displayName, 120, snap.data().displayName) || snap.data().displayName;
      }
      if (updates.role !== undefined) {
        updatePayload.role = updates.role === 'Admin' ? 'Admin' : 'Custodian';
      }
      if (updates.active !== undefined) {
        updatePayload.active = Boolean(updates.active);
      }
      if (updates.notes !== undefined) {
        updatePayload.notes = clampStr(updates.notes, 300);
      }

      batch.update(ref, updatePayload);
      buildAuditBatchOp(user, {
        action: 'CUSTODIAN_UPDATE',
        targetType: 'custodian',
        targetId: emailKey,
        targetLabel: `${updatePayload.displayName || snap.data().displayName} (${emailKey})`,
        details: `Updated access: role=${updatePayload.role || snap.data().role}, active=${updatePayload.active !== undefined ? updatePayload.active : snap.data().active}.`,
      })(batch);

      await batch.commit();
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('Head Campus Administrator')) throw err;
      handleFirestoreError(err, OperationType.UPDATE, `authorized_custodians/${emailKey}`);
    }
  },

  async removeAuthorizedCustodian(user: User, emailKeyRaw: string) {
    const emailKey = normalizeEmail(emailKeyRaw);
    if (emailKey === CAMPUS_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Head Campus Administrator cannot be removed from the roster.');
    }

    const ref = doc(db, 'authorized_custodians', emailKey);
    try {
      const batch = writeBatch(db);
      batch.delete(ref);
      buildAuditBatchOp(user, {
        action: 'CUSTODIAN_REMOVE',
        targetType: 'custodian',
        targetId: emailKey,
        targetLabel: emailKey,
        details: `Revoked and removed campus database access for ${emailKey}.`,
      })(batch);
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `authorized_custodians/${emailKey}`);
    }
  },

  // LABORATORIES
  async createLaboratory(
    user: User,
    data: { code: string; name: string; roomNumber: string; capacity?: number; description?: string }
  ) {
    const code = sanitizeLabCode(data.code);
    if (!code) throw new Error('Laboratory code identifier is required (e.g. ROBOTICS)');

    const docId = getLabDocId(user, code);
    const ref = doc(db, 'laboratories', docId);
    const actorEmail = normalizeEmail(user.email);

    try {
      const scopedLabsSnap = await getDocs(buildScopedQuery(user, 'laboratories'));
      const duplicate = scopedLabsSnap.docs.find(
        (d) => (d.data().code || '').toUpperCase() === code
      );
      if (duplicate) {
        throw new Error(`Laboratory code "${code}" already exists.`);
      }

      const payload: Record<string, any> = {
        code,
        name: clampStr(data.name, 120, `${code} Laboratory`) || `${code} Laboratory`,
        roomNumber: clampStr(data.roomNumber, 60, 'Campus Lab') || 'Campus Lab',
        capacity: Math.max(1, Math.min(10000, Number(data.capacity) || 30)),
        isCustom: true,
        ownerId: user.uid,
        createdByEmail: actorEmail,
        lastUpdatedByEmail: actorEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const desc = clampStr(data.description, 500);
      if (desc) payload.description = desc;

      const batch = writeBatch(db);
      batch.set(ref, payload);
      buildAuditBatchOp(user, {
        action: 'LAB_CREATE',
        targetType: 'laboratory',
        targetId: code,
        targetLabel: `${code} · ${payload.name}`,
        details: `Created laboratory (${payload.roomNumber}, capacity ${payload.capacity} units).`,
        lab: code,
      })(batch);

      await batch.commit();
    } catch (err: any) {
      if (err?.message?.includes('already exists')) throw err;
      handleFirestoreError(err, OperationType.CREATE, `laboratories/${docId}`);
    }
  },

  async updateLaboratory(user: User, code: string, updates: Partial<Laboratory>) {
    const upperCode = sanitizeLabCode(code);
    const actorEmail = normalizeEmail(user.email);

    try {
      const scopedLabsSnap = await getDocs(buildScopedQuery(user, 'laboratories'));
      const targetDoc =
        scopedLabsSnap.docs.find(
          (d) => (d.data().code || '').toUpperCase() === upperCode && d.data().ownerId === user.uid
        ) ||
        scopedLabsSnap.docs.find((d) => (d.data().code || '').toUpperCase() === upperCode);

      if (!targetDoc) {
        throw new Error(`Laboratory "${code}" not found.`);
      }

      const currentData = targetDoc.data();
      const updatePayload: Record<string, any> = {
        lastUpdatedByEmail: actorEmail,
        updatedAt: serverTimestamp(),
      };
      if (updates.name !== undefined) {
        updatePayload.name = clampStr(updates.name, 120, currentData.name) || currentData.name;
      }
      if (updates.roomNumber !== undefined) {
        updatePayload.roomNumber = clampStr(updates.roomNumber, 60, currentData.roomNumber) || currentData.roomNumber;
      }
      if (updates.capacity !== undefined) {
        updatePayload.capacity = Math.max(1, Math.min(10000, Number(updates.capacity) || 30));
      }
      if (updates.description !== undefined) {
        updatePayload.description = clampStr(updates.description, 500);
      }

      const batch = writeBatch(db);
      batch.update(targetDoc.ref, updatePayload);
      buildAuditBatchOp(user, {
        action: 'LAB_UPDATE',
        targetType: 'laboratory',
        targetId: upperCode,
        targetLabel: `${upperCode} · ${updatePayload.name || currentData.name}`,
        details: `Updated laboratory settings (capacity: ${updatePayload.capacity ?? currentData.capacity} units).`,
        lab: upperCode,
      })(batch);

      await batch.commit();
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
      const [assetsSnap, loansSnap, maintSnap, labsSnap] = await Promise.all([
        getDocs(buildScopedQuery(user, 'assets')),
        getDocs(buildScopedQuery(user, 'loans')),
        getDocs(buildScopedQuery(user, 'maintenance')),
        getDocs(buildScopedQuery(user, 'laboratories')),
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

      const targetDoc =
        labsSnap.docs.find(
          (d) => (d.data().code || '').toUpperCase() === upperCode && d.data().ownerId === user.uid
        ) ||
        labsSnap.docs.find((d) => (d.data().code || '').toUpperCase() === upperCode);

      if (targetDoc) {
        const batch = writeBatch(db);
        batch.delete(targetDoc.ref);
        buildAuditBatchOp(user, {
          action: 'LAB_DELETE',
          targetType: 'laboratory',
          targetId: upperCode,
          targetLabel: `${upperCode} · ${targetDoc.data().name || upperCode}`,
          details: `Deleted empty laboratory ${upperCode}.`,
          lab: upperCode,
        })(batch);
        await batch.commit();
      }
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
    const actorEmail = normalizeEmail(user.email);
    const payload = buildAssetPayload(data, id, user.uid, actorEmail, true);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'assets', id), payload);
      buildAuditBatchOp(user, {
        action: 'ASSET_CREATE',
        targetType: 'asset',
        targetId: id,
        targetLabel: `${payload.assetTag} · ${payload.name}`,
        details: `Registered ${payload.quantity} ${payload.unit} in ${payload.lab} (${payload.category}).`,
        lab: payload.lab,
      })(batch);
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assets/${id}`);
    }
  },

  async updateAsset(user: User, id: string, updates: Partial<Asset>) {
    const docId = sanitizeId(id, 'asset');
    const ref = doc(db, 'assets', docId);
    const actorEmail = normalizeEmail(user.email);

    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Asset "${id}" not found.`);
      }
      const current = snap.data() as Asset & { ownerId: string; createdAt: any; createdByEmail?: string };
      const merged: Partial<Asset> = {
        ...current,
        ...updates,
        storageLocation: updates.storageLocation || current.storageLocation,
        monitorInfo: updates.monitorInfo !== undefined ? updates.monitorInfo : current.monitorInfo,
      };
      const payload = buildAssetPayload(merged, docId, current.ownerId, actorEmail, false);
      if (current.monitorInfo && !payload.monitorInfo) {
        payload.monitorInfo = deleteField();
      }
      delete payload.id;
      delete payload.ownerId;
      delete payload.createdByEmail;

      const batch = writeBatch(db);
      batch.update(ref, payload);
      buildAuditBatchOp(user, {
        action: 'ASSET_UPDATE',
        targetType: 'asset',
        targetId: docId,
        targetLabel: `${payload.assetTag} · ${payload.name}`,
        details: `Updated asset (status: ${payload.status}, stock: ${payload.availableQuantity}/${payload.quantity} ${payload.unit}).`,
        lab: payload.lab,
      })(batch);
      await batch.commit();
    } catch (err: any) {
      if (err?.message?.includes('not found')) throw err;
      handleFirestoreError(err, OperationType.UPDATE, `assets/${docId}`);
    }
  },

  async deleteAsset(user: User, id: string) {
    const docId = sanitizeId(id, 'asset');
    const ref = doc(db, 'assets', docId);
    try {
      const snap = await getDoc(ref);
      const label = snap.exists()
        ? `${snap.data().assetTag || docId} · ${snap.data().name || 'Asset'}`
        : docId;
      const lab = snap.exists() ? snap.data().lab : undefined;

      const batch = writeBatch(db);
      batch.delete(ref);
      buildAuditBatchOp(user, {
        action: 'ASSET_DELETE',
        targetType: 'asset',
        targetId: docId,
        targetLabel: label,
        details: `Permanently removed asset ${label} from inventory.`,
        lab,
      })(batch);
      await batch.commit();
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
    const currentAvail = asset.availableQuantity || 0;
    if (qty > currentAvail) {
      throw new Error(`Insufficient stock: only ${currentAvail} ${asset.unit} available for ${asset.assetTag}.`);
    }

    const newAvail = currentAvail - qty;
    const newStatus = newAvail === 0 ? 'In Use' : asset.status;
    const actorEmail = normalizeEmail(user.email);

    try {
      const batch = writeBatch(db);
      const assetRef = doc(db, 'assets', asset.id);
      batch.update(assetRef, {
        availableQuantity: newAvail,
        status: newStatus,
        lastUpdatedByEmail: actorEmail,
        updatedAt: serverTimestamp(),
      });

      const borrowerName = clampStr(data.borrowerName, 120, 'Borrower') || 'Borrower';
      const borrowerRole = data.borrowerRole || 'Student';

      const loanRef = doc(db, 'loans', id);
      batch.set(loanRef, {
        id,
        borrowerName,
        borrowerIdNumber: clampStr(data.borrowerIdNumber, 64, 'ID-PENDING') || 'ID-PENDING',
        borrowerRole,
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
        createdByEmail: actorEmail,
        lastUpdatedByEmail: actorEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      buildAuditBatchOp(user, {
        action: 'LOAN_ISSUE',
        targetType: 'loan',
        targetId: id,
        targetLabel: `${asset.assetTag} → ${borrowerName}`,
        details: `Issued ${qty} ${asset.unit} to ${borrowerName} (${borrowerRole}). Remaining stock: ${newAvail}/${asset.quantity}.`,
        lab: asset.lab,
      })(batch);

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `loans/${id}`);
    }
  },

  async returnLoan(
    user: User,
    id: string,
    notes: string | undefined,
    allLoans: LoanRecord[],
    allAssets: Asset[]
  ) {
    const docId = sanitizeId(id, 'loan');
    const loan = allLoans.find((l) => l.id === docId);
    if (!loan) {
      throw new Error('Loan record not found.');
    }

    const today = new Date().toISOString().split('T')[0];
    const actorEmail = normalizeEmail(user.email);

    try {
      const batch = writeBatch(db);
      const loanRef = doc(db, 'loans', docId);
      const loanUpdate: Record<string, any> = {
        status: 'Returned',
        dateReturned: today,
        lastUpdatedByEmail: actorEmail,
        updatedAt: serverTimestamp(),
      };
      const cleanNotes = clampStr(notes, 400);
      if (cleanNotes) {
        loanUpdate.returnedNotes = cleanNotes;
      }
      batch.update(loanRef, loanUpdate);

      const asset = allAssets.find((a) => a.id === loan.assetId);
      let restoredDetail = '';
      if (asset) {
        const restoredQty = Math.min(
          asset.quantity,
          (asset.availableQuantity || 0) + (loan.quantity || 1)
        );
        batch.update(doc(db, 'assets', asset.id), {
          availableQuantity: restoredQty,
          status: 'Available',
          lastUpdatedByEmail: actorEmail,
          updatedAt: serverTimestamp(),
        });
        restoredDetail = ` Restored stock to ${restoredQty}/${asset.quantity}.`;
      }

      buildAuditBatchOp(user, {
        action: 'LOAN_RETURN',
        targetType: 'loan',
        targetId: docId,
        targetLabel: `${loan.assetTag} ← ${loan.borrowerName}`,
        details: `Returned ${loan.quantity} unit(s) from ${loan.borrowerName}.${restoredDetail}${cleanNotes ? ` Note: ${cleanNotes}` : ''}`,
        lab: loan.lab,
      })(batch);

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `loans/${docId}`);
    }
  },

  // MAINTENANCE
  async createMaintenanceTask(user: User, data: Partial<MaintenanceTask>) {
    const id = sanitizeId('', 'maint');
    const actorEmail = normalizeEmail(user.email);

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
        createdByEmail: actorEmail,
        lastUpdatedByEmail: actorEmail,
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
            lastUpdatedByEmail: actorEmail,
            updatedAt: serverTimestamp(),
          });
        }
      }
      if (assetTag) payload.assetTag = assetTag;
      if (diagnosis) payload.diagnosis = diagnosis;

      batch.set(doc(db, 'maintenance', id), payload);
      buildAuditBatchOp(user, {
        action: 'MAINT_CREATE',
        targetType: 'maintenance',
        targetId: id,
        targetLabel: payload.title,
        details: `Logged ${payload.priority} ${payload.type} ticket in ${payload.lab} (Technician: ${payload.assignedTechnician}).`,
        lab: payload.lab,
      })(batch);

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `maintenance/${id}`);
    }
  },

  async updateMaintenanceTask(
    user: User,
    id: string,
    updates: Partial<MaintenanceTask>,
    allTasks: MaintenanceTask[]
  ) {
    const docId = sanitizeId(id, 'maint');
    const existingTask = allTasks.find((t) => t.id === docId);
    const actorEmail = normalizeEmail(user.email);

    try {
      const batch = writeBatch(db);
      const updatePayload: Record<string, any> = {
        lastUpdatedByEmail: actorEmail,
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
              lastUpdatedByEmail: actorEmail,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      batch.update(doc(db, 'maintenance', docId), updatePayload);
      buildAuditBatchOp(user, {
        action: 'MAINT_UPDATE',
        targetType: 'maintenance',
        targetId: docId,
        targetLabel: existingTask?.title || docId,
        details: `Moved/updated ticket${updates.column ? ` to stage "${updates.column}"` : ''}.`,
        lab: existingTask?.lab,
      })(batch);

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `maintenance/${docId}`);
    }
  },

  async deleteMaintenanceTask(user: User, id: string) {
    const docId = sanitizeId(id, 'maint');
    const ref = doc(db, 'maintenance', docId);
    try {
      const snap = await getDoc(ref);
      const title = snap.exists() ? snap.data().title || docId : docId;
      const lab = snap.exists() ? snap.data().lab : undefined;

      const batch = writeBatch(db);
      batch.delete(ref);
      buildAuditBatchOp(user, {
        action: 'MAINT_DELETE',
        targetType: 'maintenance',
        targetId: docId,
        targetLabel: title,
        details: `Deleted maintenance ticket "${title}".`,
        lab,
      })(batch);

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `maintenance/${docId}`);
    }
  },
};
