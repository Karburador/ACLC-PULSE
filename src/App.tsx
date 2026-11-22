import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { firestoreSync } from './services/firestoreSync';
import { LabType, Asset, LoanRecord, MaintenanceTask, Laboratory } from './types';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationTab, MobileBottomNav } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { InventoryTable } from './components/inventory/InventoryTable';
import { AssetModal } from './components/inventory/AssetModal';
import { BorrowModal } from './components/loans/BorrowModal';
import { LoansTracker } from './components/loans/LoansTracker';
import { StorageVisualizer } from './components/storage/StorageVisualizer';
import { AssetTagGenerator } from './components/storage/AssetTagGenerator';
import { RepairKanban } from './components/maintenance/RepairKanban';
import { MaintenanceScheduler } from './components/maintenance/MaintenanceScheduler';
import { ReportsView } from './components/reports/ReportsView';
import { DeploymentGuide } from './components/deployment/DeploymentGuide';
import { LaboratoryModal } from './components/laboratories/LaboratoryModal';
import { ResetModal } from './components/common/ResetModal';
import {
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentLab, setCurrentLab] = useState<LabType>('ALL');

  // Live Real-Time Cloud Firestore Datasets
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [allLoans, setAllLoans] = useState<LoanRecord[]>([]);
  const [allMaintenance, setAllMaintenance] = useState<MaintenanceTask[]>([]);
  const [allLaboratories, setAllLaboratories] = useState<Laboratory[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters for Inventory
  const [inventoryCategory, setInventoryCategory] = useState<string>('ALL');
  const [inventoryStatus, setInventoryStatus] = useState<string>('ALL');
  const [inventorySearch, setInventorySearch] = useState<string>('');

  // Modals & Inter-Module Action Context
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [preselectedBorrowAsset, setPreselectedBorrowAsset] = useState<Asset | null>(null);

  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [preselectedTagAsset, setPreselectedTagAsset] = useState<Asset | null>(null);
  const [storageSubTab, setStorageSubTab] = useState<'visualizer' | 'tags'>('visualizer');
  const [maintenanceSubTab, setMaintenanceSubTab] = useState<'kanban' | 'scheduler'>('kanban');

  if (syncError) {
    throw syncError;
  }

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsEmailVerified(Boolean(currentUser?.emailVerified));
      setAuthReady(true);
      if (!currentUser || !currentUser.emailVerified) {
        setCloudReady(false);
        setAllAssets([]);
        setAllLoans([]);
        setAllMaintenance([]);
        setAllLaboratories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-Time Firestore Listeners (attached only after auth is ready, user signed in & verified)
  useEffect(() => {
    if (!authReady || !user || !isEmailVerified) return;

    let active = true;
    let unsubSync: (() => void) | null = null;

    async function startCloudSync() {
      try {
        await firestoreSync.ensureInitialized(user!);
        if (!active) return;

        unsubSync = firestoreSync.subscribeToAll(user!, {
          onLaboratories: (labs) => {
            if (active) setAllLaboratories(labs);
          },
          onAssets: (assetsData) => {
            if (active) setAllAssets(assetsData);
          },
          onLoans: (loansData) => {
            if (active) setAllLoans(loansData);
          },
          onMaintenance: (maintData) => {
            if (active) setAllMaintenance(maintData);
          },
          onError: (err) => {
            if (active) setSyncError(err);
          },
        });
        if (active) setCloudReady(true);
      } catch (err: any) {
        if (active) setSyncError(err);
      }
    }

    startCloudSync();

    return () => {
      active = false;
      if (unsubSync) unsubSync();
    };
  }, [authReady, user, isEmailVerified]);

  // Handle QR Code deep link (?asset=ACLC-COM-PC01) once cloud sync is ready
  useEffect(() => {
    if (!cloudReady || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const scannedTag = params.get('asset')?.trim();
    if (scannedTag) {
      setActiveTab('inventory');
      setCurrentLab('ALL');
      setInventoryCategory('ALL');
      setInventoryStatus('ALL');
      setInventorySearch(scannedTag);
      showToast(`QR scanned: showing asset "${scannedTag}"`);
      params.delete('asset');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [cloudReady, showToast]);

  // Enrich laboratories with live counts across all synced records
  const laboratories = useMemo<Laboratory[]>(() => {
    return allLaboratories.map((lab) => {
      const upper = lab.code.toUpperCase();
      const labAssets = allAssets.filter((a) => a.lab?.toUpperCase() === upper);
      const labLoans = allLoans.filter((l) => l.lab?.toUpperCase() === upper);
      const labMaintenance = allMaintenance.filter((m) => m.lab?.toUpperCase() === upper);
      const totalUnits = labAssets.reduce((sum, a) => sum + (a.quantity || 0), 0);

      return {
        ...lab,
        totalAssets: labAssets.length,
        activeUnitsCount: totalUnits,
        loanCount: labLoans.length,
        maintenanceCount: labMaintenance.length,
      };
    });
  }, [allLaboratories, allAssets, allLoans, allMaintenance]);

  // Filtered views matching Active Scope & Inventory Search/Category/Status
  const assets = useMemo(() => {
    let list = allAssets;
    if (currentLab !== 'ALL') {
      list = list.filter((a) => a.lab?.toUpperCase() === currentLab.toUpperCase());
    }
    if (inventoryCategory !== 'ALL') {
      list = list.filter((a) => a.category === inventoryCategory);
    }
    if (inventoryStatus !== 'ALL') {
      list = list.filter((a) => a.status === inventoryStatus);
    }
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetTag.toLowerCase().includes(q) ||
          (a.brandModel && a.brandModel.toLowerCase().includes(q)) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allAssets, currentLab, inventoryCategory, inventoryStatus, inventorySearch]);

  const loans = useMemo(() => {
    if (currentLab === 'ALL') return allLoans;
    return allLoans.filter((l) => l.lab?.toUpperCase() === currentLab.toUpperCase());
  }, [allLoans, currentLab]);

  const maintenance = useMemo(() => {
    if (currentLab === 'ALL') return allMaintenance;
    return allMaintenance.filter((m) => m.lab?.toUpperCase() === currentLab.toUpperCase());
  }, [allMaintenance, currentLab]);

  const metrics = useMemo(() => {
    const scopedAssets =
      currentLab === 'ALL'
        ? allAssets
        : allAssets.filter((a) => a.lab?.toUpperCase() === currentLab.toUpperCase());

    const totalAssets = scopedAssets.reduce((acc, a) => acc + (a.quantity || 0), 0);
    const availableAssets = scopedAssets.reduce((acc, a) => acc + (a.availableQuantity || 0), 0);
    const explicitInUse = scopedAssets
      .filter((a) => a.status === 'In Use')
      .reduce((acc, a) => acc + Math.max(0, (a.quantity || 0) - (a.availableQuantity || 0)), 0);
    const damagedAssets = scopedAssets
      .filter((a) => a.status === 'Damaged')
      .reduce((acc, a) => acc + (a.quantity || 0), 0);
    const activeLoans = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue').length;
    const overdueLoans = loans.filter((l) => l.status === 'Overdue').length;
    const pendingMaintenance = maintenance.filter((m) => m.column !== 'Replaced/Retired').length;

    return {
      totalAssets,
      availableAssets,
      inUseAssets: explicitInUse > 0 ? explicitInUse : Math.max(0, totalAssets - availableAssets),
      damagedAssets,
      activeLoans,
      overdueLoans,
      pendingMaintenance,
      totalAssetItemsCount: scopedAssets.length,
      isAtlasConnected: cloudReady,
    };
  }, [allAssets, loans, maintenance, currentLab, cloudReady]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleManualSyncToast = () => {
    showToast('Cloud Sync is active in real time across all browsers.');
  };

  // Laboratory Handlers (Cloud Synced)
  const handleAddLaboratory = async (labData: {
    code: string;
    name: string;
    roomNumber: string;
    capacity: number;
    description?: string;
  }) => {
    if (!user) return;
    await firestoreSync.createLaboratory(user, labData);
    showToast(`Laboratory ${labData.code} added and synced across browsers.`);
  };

  const handleUpdateLaboratory = async (code: string, updates: Partial<Laboratory>) => {
    if (!user) return;
    await firestoreSync.updateLaboratory(user, code, updates);
    showToast(`Laboratory ${code} updated and synced.`);
  };

  const handleDeleteLaboratory = async (code: string) => {
    if (!user) return { success: false, message: 'Authentication required' };
    try {
      const res = await firestoreSync.deleteLaboratory(user, code);
      if (!res.success && res.blocked) {
        return res;
      }
      showToast(res.message || `Laboratory "${code}" deleted.`);
      if (currentLab === code) setCurrentLab('ALL');
      return { success: true, message: res.message };
    } catch (err: any) {
      showToast(err.message || 'Failed to delete laboratory', 'error');
      return { success: false, message: err.message };
    }
  };

  // System Data Reset Handlers (Cloud Synced)
  const handleResetToZero = async () => {
    if (!user) return;
    await firestoreSync.wipeAllToZero(user);
    setPreselectedTagAsset(null);
    setPreselectedBorrowAsset(null);
    setAssetToEdit(null);
    setInventoryCategory('ALL');
    setInventoryStatus('ALL');
    setInventorySearch('');
    showToast('All records deleted and synced to 0 across all browsers.');
  };

  const handleRestoreDefaults = async () => {
    if (!user) return;
    await firestoreSync.seedDefaultCatalog(user, true);
    showToast('ACLC Default Catalog (160 core units) restored and synced.');
  };

  // Asset CRUD Handlers (Cloud Synced)
  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    if (!user) return;
    if (assetToEdit) {
      await firestoreSync.updateAsset(assetToEdit.id, assetData);
      showToast(`Asset "${assetData.name}" updated and synced.`);
    } else {
      await firestoreSync.createAsset(user, assetData);
      showToast(`Asset "${assetData.name}" registered and synced.`);
    }
    setAssetToEdit(null);
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    try {
      await firestoreSync.deleteAsset(id);
      showToast(`Asset "${name}" deleted and synced.`);
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Dispensing & Loan Handlers (Cloud Synced)
  const handleIssueLoan = async (loanData: Partial<LoanRecord>) => {
    if (!user) return;
    await firestoreSync.createLoan(user, loanData, allAssets);
    showToast(`Asset issued to ${loanData.borrowerName} and synced.`);
    setPreselectedBorrowAsset(null);
  };

  const handleReturnItem = async (id: string, notes?: string) => {
    await firestoreSync.returnLoan(id, notes, allLoans, allAssets);
    showToast('Equipment returned, stock restored, and synced.');
  };

  // Maintenance Handlers (Cloud Synced)
  const handleAddMaintenance = async (taskData: Partial<MaintenanceTask>) => {
    if (!user) return;
    await firestoreSync.createMaintenanceTask(user, taskData);
    showToast('Maintenance task logged and synced.');
  };

  const handleUpdateMaintenance = async (id: string, updates: Partial<MaintenanceTask>) => {
    await firestoreSync.updateMaintenanceTask(id, updates, allMaintenance);
  };

  const handleDeleteMaintenance = async (id: string) => {
    await firestoreSync.deleteMaintenanceTask(id);
    showToast('Maintenance task removed and synced.');
  };

  // Cross-module navigations
  const handleQuickDispenseFromInventory = (asset: Asset) => {
    setPreselectedBorrowAsset(asset);
    setIsBorrowModalOpen(true);
  };

  const handlePrintTagFromInventory = (asset: Asset) => {
    setPreselectedTagAsset(asset);
    setStorageSubTab('tags');
    setActiveTab('storage');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Connecting to ACLC-Pulse Cloud Sync...</p>
        </div>
      </div>
    );
  }

  if (!user || !isEmailVerified) {
    return (
      <AuthScreen
        pendingVerificationUser={user && !isEmailVerified ? user : null}
        onVerificationConfirmed={() => {
          setIsEmailVerified(Boolean(auth.currentUser?.emailVerified));
          setUser(auth.currentUser);
        }}
        onSignOut={handleSignOut}
      />
    );
  }

  const activeLoansCount = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue').length;
  const maintenanceTicketsCount = maintenance.filter((m) => m.column !== 'Replaced/Retired').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification Pill */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl border-2 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-white border-emerald-600 text-emerald-950 shadow-emerald-950/10'
                : 'bg-white border-rose-600 text-rose-950 shadow-rose-950/10'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Top Header with Brand & Lab Switcher */}
      <Header
        currentLab={currentLab}
        onLabChange={(lab) => {
          setCurrentLab(lab);
        }}
        onOpenNewAssetModal={() => {
          setAssetToEdit(null);
          setIsAssetModalOpen(true);
        }}
        onRefresh={handleManualSyncToast}
        isAtlasConnected={cloudReady}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        laboratories={laboratories}
        onOpenLabModal={() => setIsLabModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        userEmail={user.email}
        userDisplayName={user.displayName}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Desktop permanent, Mobile off-canvas drawer) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          activeLoansCount={activeLoansCount}
          maintenanceCount={maintenanceTicketsCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          laboratories={laboratories}
          onOpenLabModal={() => setIsLabModalOpen(true)}
          userEmail={user.email}
          userDisplayName={user.displayName}
          onSignOut={handleSignOut}
        />

        {/* Main Application Canvas */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-5 lg:p-6 pb-24 lg:pb-6 bg-slate-100">
          <div className="w-full max-w-[1680px] mx-auto space-y-6">
            {/* View Switching based on active tab */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                currentLab={currentLab}
                metrics={metrics}
                onNavigate={setActiveTab}
                onOpenNewAsset={() => {
                  setAssetToEdit(null);
                  setIsAssetModalOpen(true);
                }}
                onOpenBorrow={() => {
                  setPreselectedBorrowAsset(null);
                  setIsBorrowModalOpen(true);
                }}
                laboratories={laboratories}
                onOpenLabModal={() => setIsLabModalOpen(true)}
                onOpenResetModal={() => setIsResetModalOpen(true)}
                onSelectLab={(lab) => setCurrentLab(lab)}
              />
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">
                      Core Laboratory Inventory
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Phase 1: Searchable equipment catalog with status tracking and CRUD controls.
                    </p>
                  </div>
                </div>

                <InventoryTable
                  assets={assets}
                  currentLab={currentLab}
                  selectedCategory={inventoryCategory}
                  onSelectCategory={setInventoryCategory}
                  selectedStatus={inventoryStatus}
                  onSelectStatus={setInventoryStatus}
                  searchQuery={inventorySearch}
                  onSearchChange={setInventorySearch}
                  onEditAsset={(asset) => {
                    setAssetToEdit(asset);
                    setIsAssetModalOpen(true);
                  }}
                  onDeleteAsset={handleDeleteAsset}
                  onQuickDispense={handleQuickDispenseFromInventory}
                  onPrintTag={handlePrintTagFromInventory}
                  onAddNewAsset={() => {
                    setAssetToEdit(null);
                    setIsAssetModalOpen(true);
                  }}
                />
              </div>
            )}

            {activeTab === 'loans' && (
              <LoansTracker
                loans={loans}
                currentLab={currentLab}
                onReturnItem={handleReturnItem}
                onOpenIssueModal={() => {
                  setPreselectedBorrowAsset(null);
                  setIsBorrowModalOpen(true);
                }}
              />
            )}

            {activeTab === 'storage' && (
              <div className="space-y-4">
                {/* Sub-tabs for Phase 3 */}
                <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                  <button
                    onClick={() => setStorageSubTab('visualizer')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      storageSubTab === 'visualizer'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    Storage Rack &amp; Cabinet Map
                  </button>
                  <button
                    onClick={() => setStorageSubTab('tags')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      storageSubTab === 'tags'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    Printable Asset Tag Generator
                  </button>
                </div>

                {storageSubTab === 'visualizer' ? (
                  <StorageVisualizer
                    currentLab={currentLab}
                    assets={assets}
                    laboratories={laboratories}
                    onSelectAssetForTag={(asset) => {
                      setPreselectedTagAsset(asset);
                      setStorageSubTab('tags');
                    }}
                  />
                ) : (
                  <AssetTagGenerator
                    assets={assets}
                    currentLab={currentLab}
                    selectedAsset={preselectedTagAsset}
                  />
                )}
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {/* Sub-tabs for Phase 4 */}
                <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                  <button
                    onClick={() => setMaintenanceSubTab('kanban')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      maintenanceSubTab === 'kanban'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    Repair &amp; Replacement Kanban
                  </button>
                  <button
                    onClick={() => setMaintenanceSubTab('scheduler')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      maintenanceSubTab === 'scheduler'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    Preventive Maintenance Scheduler
                  </button>
                </div>

                {maintenanceSubTab === 'kanban' ? (
                  <RepairKanban
                    tasks={maintenance}
                    currentLab={currentLab}
                    assets={assets}
                    laboratories={laboratories}
                    onAddTask={handleAddMaintenance}
                    onUpdateTask={handleUpdateMaintenance}
                    onDeleteTask={handleDeleteMaintenance}
                  />
                ) : (
                  <MaintenanceScheduler
                    tasks={maintenance}
                    currentLab={currentLab}
                    onAddTask={handleAddMaintenance}
                  />
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <ReportsView
                assets={assets}
                loans={loans}
                maintenance={maintenance}
                currentLab={currentLab}
              />
            )}

            {activeTab === 'deployment' && (
              <DeploymentGuide
                onDataReset={handleManualSyncToast}
                onResetZero={handleResetToZero}
                onRestoreDefaults={handleRestoreDefaults}
              />
            )}
          </div>
        </main>
      </div>

      {/* Asset Create & Edit Modal (Phase 1) */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setAssetToEdit(null);
        }}
        onSave={handleSaveAsset}
        assetToEdit={assetToEdit}
        defaultLab={currentLab === 'ALL' ? (laboratories[0]?.code || 'COMLAB') : currentLab}
        laboratories={laboratories}
        existingAssets={allAssets}
      />

      {/* Borrow & Dispense Modal (Phase 2) */}
      <BorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setPreselectedBorrowAsset(null);
        }}
        onIssueLoan={handleIssueLoan}
        availableAssets={assets}
        preselectedAsset={preselectedBorrowAsset}
      />

      {/* Laboratory Management Modal */}
      <LaboratoryModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        laboratories={laboratories}
        onAddLaboratory={handleAddLaboratory}
        onUpdateLaboratory={handleUpdateLaboratory}
        onDeleteLaboratory={handleDeleteLaboratory}
        currentLab={currentLab}
        onSelectLab={(code) => setCurrentLab(code)}
      />

      {/* System Reset & Database Purge Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetToZero={handleResetToZero}
        onRestoreDefaults={handleRestoreDefaults}
      />

      {/* Mobile Bottom Navigation Bar (Phones & Small Tablets) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMore={() => setIsMobileMenuOpen(true)}
        activeLoansCount={activeLoansCount}
        maintenanceCount={maintenanceTicketsCount}
      />
    </div>
  );
}
