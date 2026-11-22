import React, { useMemo } from 'react';
import { Asset, LabType, Laboratory, LoanRecord, MaintenanceTask } from '../../types';
import {
  Plus,
  HandCoins,
  ArrowRight,
  Building2,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  Wrench,
  Clock,
  CheckCircle2,
  Boxes,
} from 'lucide-react';

interface DashboardOverviewProps {
  currentLab: LabType;
  metrics: {
    totalAssets: number;
    availableAssets: number;
    inUseAssets: number;
    damagedAssets: number;
    activeLoans: number;
    overdueLoans: number;
    pendingMaintenance: number;
    totalAssetItemsCount: number;
    isAtlasConnected: boolean;
  };
  assets?: Asset[];
  loans?: LoanRecord[];
  maintenance?: MaintenanceTask[];
  onNavigate: (tab: any) => void;
  onOpenNewAsset: () => void;
  onOpenBorrow: () => void;
  laboratories?: Laboratory[];
  onOpenLabModal?: () => void;
  onOpenResetModal?: () => void;
  onSelectLab?: (lab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentLab,
  metrics,
  assets = [],
  loans = [],
  maintenance = [],
  onNavigate,
  onOpenNewAsset,
  onOpenBorrow,
  laboratories = [],
  onOpenLabModal,
  onSelectLab,
}) => {
  const activeLabObj = useMemo(
    () => (currentLab !== 'ALL' ? laboratories.find((l) => l.code === currentLab) : undefined),
    [currentLab, laboratories]
  );

  // Category distribution from real assets in active scope
  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of assets) {
      const cat = asset.category || 'Computers';
      counts.set(cat, (counts.get(cat) || 0) + (asset.quantity || 0));
    }
    const entries = Array.from(counts.entries())
      .map(([category, units]) => ({ category, units }))
      .sort((a, b) => b.units - a.units);
    const total = entries.reduce((sum, e) => sum + e.units, 0) || 1;
    return entries.map((e) => ({
      ...e,
      pct: Math.round((e.units / total) * 100),
    }));
  }, [assets]);

  // Real items needing attention: Overdue / Active loans + Pending maintenance tickets
  const attentionItems = useMemo(() => {
    const overdue = loans
      .filter((l) => l.status === 'Overdue')
      .map((l) => ({
        id: `loan-${l.id}`,
        title: l.assetName,
        meta: `${l.borrowerName} · Due ${l.expectedReturnDate}`,
        statusLabel: 'Overdue Loan',
        tone: 'text-rose-700',
        tab: 'loans' as const,
        icon: AlertTriangle,
      }));

    const active = loans
      .filter((l) => l.status === 'Active')
      .slice(0, 3)
      .map((l) => ({
        id: `loan-${l.id}`,
        title: l.assetName,
        meta: `${l.borrowerName} · Return ${l.expectedReturnDate}`,
        statusLabel: 'Borrowed',
        tone: 'text-amber-700',
        tab: 'loans' as const,
        icon: Clock,
      }));

    const tickets = maintenance
      .filter((m) => m.column !== 'Replaced/Retired')
      .slice(0, 3)
      .map((m) => ({
        id: `maint-${m.id}`,
        title: m.title,
        meta: `${m.lab} · ${m.assignedTechnician}`,
        statusLabel: m.column,
        tone: m.priority === 'Critical' || m.priority === 'High' ? 'text-rose-700' : 'text-blue-700',
        tab: 'maintenance' as const,
        icon: Wrench,
      }));

    return [...overdue, ...tickets, ...active].slice(0, 5);
  }, [loans, maintenance]);

  const kpiItems = [
    {
      label: 'Total Units',
      value: metrics.totalAssets,
      detail: `${metrics.totalAssetItemsCount} item records`,
      icon: Boxes,
      tone: 'text-blue-700',
      onClick: () => onNavigate('inventory'),
    },
    {
      label: 'Available',
      value: metrics.availableAssets,
      detail: 'Ready for class use',
      icon: CheckCircle2,
      tone: 'text-emerald-700',
      onClick: () => onNavigate('inventory'),
    },
    {
      label: 'Deployed / In Use',
      value: metrics.inUseAssets,
      detail: 'Active workstations & loans',
      icon: Clock,
      tone: 'text-amber-700',
      onClick: () => onNavigate('inventory'),
    },
    {
      label: 'Under Repair',
      value: metrics.damagedAssets,
      detail: `${metrics.pendingMaintenance} open tickets`,
      icon: AlertTriangle,
      tone: metrics.damagedAssets > 0 ? 'text-rose-700' : 'text-slate-500',
      onClick: () => onNavigate('maintenance'),
    },
    {
      label: 'Active Loans',
      value: metrics.activeLoans,
      detail: metrics.overdueLoans > 0 ? `${metrics.overdueLoans} overdue` : 'All within schedule',
      icon: HandCoins,
      tone: metrics.overdueLoans > 0 ? 'text-rose-700' : 'text-blue-700',
      onClick: () => onNavigate('loans'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clean Page Header & Primary Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>ACLC College of Manila</span>
            <span aria-hidden="true">·</span>
            <span>{currentLab === 'ALL' ? `${laboratories.length} Laboratories` : currentLab}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 text-balance">
            {currentLab === 'ALL'
              ? 'Laboratory Operations Overview'
              : activeLabObj?.name || currentLab}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenBorrow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <HandCoins className="w-3.5 h-3.5 text-amber-600" />
            <span>Issue Item</span>
          </button>

          <button
            onClick={onOpenNewAsset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Unified Single-Elevation 5-Column KPI Strip */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden">
        {kpiItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="p-4 sm:p-5 text-left hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-600 truncate">
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.tone} shrink-0`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-950 font-mono tabular-nums tracking-tight">
                {item.value}
              </div>
              <p className={`text-xs mt-1 truncate ${item.label === 'Active Loans' && metrics.overdueLoans > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
                {item.detail}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Laboratories Directory Table (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Academic Laboratories ({laboratories.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a laboratory to filter inventory or review capacity
              </p>
            </div>
            {onOpenLabModal && (
              <button
                onClick={onOpenLabModal}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Manage Labs
              </button>
            )}
          </div>

          {laboratories.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">No laboratories added yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first campus laboratory (e.g. COMLAB, CYBERLAB, TESDA) to organize assets.
                </p>
              </div>
              {onOpenLabModal && (
                <button
                  onClick={onOpenLabModal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  Create Laboratory
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {laboratories.map((lab) => {
                const isSelected = currentLab === lab.code;
                const activeCount = lab.activeUnitsCount || 0;
                const cap = Math.max(1, lab.capacity || 1);
                const pct = Math.min(100, Math.round((activeCount / cap) * 100));

                return (
                  <div
                    key={lab.code}
                    className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          type="button"
                          onClick={() => onSelectLab && onSelectLab(isSelected ? 'ALL' : lab.code)}
                          className="font-bold text-slate-950 hover:text-blue-700 cursor-pointer text-left truncate"
                        >
                          {lab.code}
                        </button>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="text-xs text-slate-600 truncate font-medium">
                          {lab.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[180px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSelected ? 'bg-blue-700' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.max(activeCount > 0 ? 6 : 0, pct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono tabular-nums text-slate-600">
                          {activeCount} / {lab.capacity} units
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onSelectLab && onSelectLab(isSelected ? 'ALL' : lab.code)}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Filter'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectLab) onSelectLab(lab.code);
                          onNavigate('inventory');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Inventory</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Category Breakdown & Operational Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Equipment Mix */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-950">Equipment Breakdown</h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {metrics.totalAssets} total
              </span>
            </div>

            <div className="p-5">
              {categoryBreakdown.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No equipment recorded in {currentLab === 'ALL' ? 'this workspace' : currentLab} yet.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenNewAsset}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    + Encode your first asset
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryBreakdown.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.category}</span>
                        <span className="font-mono tabular-nums text-slate-600">
                          {item.units}u · {item.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full"
                          style={{ width: `${Math.max(4, item.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Active Attention Feed (Loans & Repairs) */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-950">Loans &amp; Maintenance Feed</h2>
              <button
                type="button"
                onClick={() => onNavigate('loans')}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                View All
              </button>
            </div>

            {attentionItems.length === 0 ? (
              <div className="p-5 text-center space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  All equipment nominal
                </p>
                <p className="text-xs text-slate-500">
                  No active loans or open maintenance tickets right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {attentionItems.map((entry) => {
                  const Icon = entry.icon;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onNavigate(entry.tab)}
                      className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 ${entry.tone} shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {entry.title}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{entry.meta}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 whitespace-nowrap ${entry.tone}`}>
                        {entry.statusLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Shortcuts Footer */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('storage')}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-700 cursor-pointer whitespace-nowrap"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Print QR Tags</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-700 cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
