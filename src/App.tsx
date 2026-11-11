import React, { useState, useEffect, useCallback } from 'react';
import { LabType, Asset, LoanRecord, MaintenanceTask } from './types';
import { api } from './services/api';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
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
import {
  Boxes,
  HandCoins,
  QrCode,
  Wrench,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentLab, setCurrentLab] = useState<LabType>('ALL');

  // Core Data States
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([]);
  const [metrics, setMetrics] = useState({
    totalAssets: 85,
    availableAssets: 78,
    inUseAssets: 7,
    damagedAssets: 2,
    activeLoans: 3,
    overdueLoans: 1,
    pendingMaintenance: 3,
    totalAssetItemsCount: 15,
    isAtlasConnected: false,
  });

  const [loading, setLoading] = useState(true);
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

  const [preselectedTagAsset, setPreselectedTagAsset] = useState<Asset | null>(null);
  const [storageSubTab, setStorageSubTab] = useState<'visualizer' | 'tags'>('visualizer');
  const [maintenanceSubTab, setMaintenanceSubTab] = useState<'kanban' | 'scheduler'>('kanban');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all primary datasets
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetsData, loansData, maintenanceData, metricsData] = await Promise.all([
        api.getAssets({
          lab: currentLab,
          category: inventoryCategory,
          status: inventoryStatus,
          search: inventorySearch,
        }),
        api.getLoans({ lab: currentLab }),
        api.getMaintenanceTasks(currentLab),
        api.getMetrics(currentLab),
      ]);

      setAssets(assetsData);
      setLoans(loansData);
      setMaintenance(maintenanceData);
      setMetrics(metricsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      showToast(err.message || 'Error connecting to data engine', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentLab, inventoryCategory, inventoryStatus, inventorySearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification Notification Pill */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-rose-500 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
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
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeLoansCount={activeLoansCount}
          maintenanceCount={maintenanceTicketsCount}
        />

        {/* Main Application Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
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
              />
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Core Laboratory Inventory
                    </h2>
                    <p className="text-xs text-slate-400">
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
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setStorageSubTab('visualizer')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      storageSubTab === 'visualizer'
                        ? 'bg-blue-900/60 text-amber-300 border border-blue-700/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Storage Rack & Cabinet Map
                  </button>
                  <button
                    onClick={() => setStorageSubTab('tags')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      storageSubTab === 'tags'
                        ? 'bg-blue-900/60 text-amber-300 border border-blue-700/60'
                        : 'text-slate-400 hover:text-white'
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
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setMaintenanceSubTab('kanban')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      maintenanceSubTab === 'kanban'
                        ? 'bg-blue-900/60 text-amber-300 border border-blue-700/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Repair & Replacement Kanban
                  </button>
                  <button
                    onClick={() => setMaintenanceSubTab('scheduler')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      maintenanceSubTab === 'scheduler'
                        ? 'bg-blue-900/60 text-amber-300 border border-blue-700/60'
                        : 'text-slate-400 hover:text-white'
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
        defaultLab={currentLab === 'ALL' ? 'COMLAB' : currentLab}
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
    </div>
  );
}
