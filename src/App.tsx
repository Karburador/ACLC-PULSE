import React, { useState, useEffect, useCallback } from 'react';
import { LabType, Asset, LoanRecord, MaintenanceTask, Laboratory } from './types';
import { api } from './services/api';
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
  INITIAL_ASSETS,
  INITIAL_LOANS,
  INITIAL_MAINTENANCE,
} from './data/initialCatalog';
import {
  Boxes,
  HandCoins,
  QrCode,
  Wrench,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const DEFAULT_LABS: Laboratory[] = [
  { code: 'COMLAB', name: 'Computer Programming & Applications Lab', roomNumber: 'Room 304', capacity: 40, isCustom: false },
  { code: 'NETLAB', name: 'Cisco CCNA Networking Lab', roomNumber: 'Room 306', capacity: 25, isCustom: false },
  { code: 'TESDA', name: 'Computer Systems Servicing (CSS NC II) Hardware Lab', roomNumber: 'Room 208', capacity: 20, isCustom: false },
  { code: 'MACLAB', name: 'Multimedia & Graphic Design Studio', roomNumber: 'Room 302', capacity: 30, isCustom: false },
  { code: 'CYBERLAB', name: 'Cybersecurity, Cloud & Server Operations Lab', roomNumber: 'Room 308', capacity: 20, isCustom: false },
  { code: 'IOTLAB', name: 'IoT, Robotics & Embedded Systems Lab', roomNumber: 'Room 204', capacity: 25, isCustom: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentLab, setCurrentLab] = useState<LabType>('ALL');

  // Core Data States with instant initial values
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [loans, setLoans] = useState<LoanRecord[]>(INITIAL_LOANS);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE);
  const [laboratories, setLaboratories] = useState<Laboratory[]>(DEFAULT_LABS);
  const [metrics, setMetrics] = useState({
    totalAssets: 773,
    availableAssets: 728,
    inUseAssets: 1,
    damagedAssets: 6,
    activeLoans: 3,
    overdueLoans: 2,
    pendingMaintenance: 3,
    totalAssetItemsCount: 23,
    isAtlasConnected: false,
  });

  const [loading, setLoading] = useState(false);
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all primary datasets with safe fallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetsData, loansData, maintenanceData, metricsData, labsData] = await Promise.all([
        api.getAssets({
          lab: currentLab,
          category: inventoryCategory,
          status: inventoryStatus,
          search: inventorySearch,
        }),
        api.getLoans({ lab: currentLab }),
        api.getMaintenanceTasks(currentLab),
        api.getMetrics(currentLab),
        api.getLaboratories(),
      ]);

      if (Array.isArray(assetsData)) setAssets(assetsData);
      if (Array.isArray(loansData)) setLoans(loansData);
      if (Array.isArray(maintenanceData)) setMaintenance(maintenanceData);
      if (metricsData) setMetrics(metricsData);
      if (Array.isArray(labsData)) setLaboratories(labsData);
    } catch (err: any) {
      console.warn('Syncing with laboratory catalog:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentLab, inventoryCategory, inventoryStatus, inventorySearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Laboratory Handlers (Dynamic Add, Edit, Delete)
  const handleAddLaboratory = async (labData: { code: string; name: string; roomNumber: string; capacity: number; description?: string }) => {
    await api.createLaboratory(labData);
    showToast(`Laboratory ${labData.code} added successfully.`);
    fetchData();
  };

  const handleUpdateLaboratory = async (code: string, updates: Partial<Laboratory>) => {
    await api.updateLaboratory(code, updates);
    showToast(`Laboratory ${code} updated.`);
    fetchData();
  };

  const handleDeleteLaboratory = async (code: string, force = false) => {
    try {
      const res = await api.deleteLaboratory(code, force);
      showToast(res.message);
      if (currentLab === code) setCurrentLab('ALL');
      fetchData();
      return { success: true };
    } catch (err: any) {
      if (err.message?.includes('asset item(s)')) {
        return { success: false, requiresConfirmation: true, assetCount: 1, message: err.message };
      }
      showToast(err.message || 'Failed to delete laboratory', 'error');
      return { success: false, message: err.message };
    }
  };

  // System Data Reset Handlers
  const handleResetToZero = async () => {
    await api.resetData('zero');
    showToast('Lahat ng records ay nabura na (Database back to 0).');
    fetchData();
  };

  const handleRestoreDefaults = async () => {
    await api.resetData('default');
    showToast('ACLC Default Catalog (160 units) restored.');
    fetchData();
  };

  // Asset CRUD Handlers
  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    if (assetToEdit) {
      await api.updateAsset(assetToEdit.id, assetData);
      showToast(`Asset "${assetData.name}" updated successfully.`);
    } else {
      await api.createAsset(assetData);
      showToast(`Asset "${assetData.name}" registered into inventory.`);
    }
    setAssetToEdit(null);
    fetchData();
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete or archive "${name}"?`)) {
      try {
        await api.deleteAsset(id);
        showToast(`Asset "${name}" archived.`);
        fetchData();
      } catch (err: any) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  // Dispensing & Loan Handlers
  const handleIssueLoan = async (loanData: Partial<LoanRecord>) => {
    await api.createLoan(loanData);
    showToast(`Asset successfully issued to ${loanData.borrowerName}.`);
    setPreselectedBorrowAsset(null);
    fetchData();
  };

  const handleReturnItem = async (id: string, notes?: string) => {
    await api.returnLoan(id, notes);
    showToast('Equipment returned and inventory restored to stock.');
    fetchData();
  };

  // Maintenance Handlers
  const handleAddMaintenance = async (taskData: Partial<MaintenanceTask>) => {
    await api.createMaintenanceTask(taskData);
    showToast('Maintenance task logged on Kanban board.');
    fetchData();
  };

  const handleUpdateMaintenance = async (id: string, updates: Partial<MaintenanceTask>) => {
    await api.updateMaintenanceTask(id, updates);
    fetchData();
  };

  const handleDeleteMaintenance = async (id: string) => {
    await api.deleteMaintenanceTask(id);
    showToast('Maintenance task removed.');
    fetchData();
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
        onRefresh={fetchData}
        isAtlasConnected={metrics.isAtlasConnected}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        laboratories={laboratories}
        onOpenLabModal={() => setIsLabModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
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
        />

        {/* Main Application Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 lg:pb-6 bg-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
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
                    Storage Rack & Cabinet Map
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
                    Repair & Replacement Kanban
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
              <DeploymentGuide onDataReset={fetchData} />
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
