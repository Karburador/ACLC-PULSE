import React from 'react';
import { LabType, Laboratory } from '../../types';
import {
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HandCoins,
  Cpu,
  Network,
  Wrench,
  ArrowRight,
  ShieldAlert,
  Server,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Building2,
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
  onNavigate,
  onOpenNewAsset,
  onOpenBorrow,
  laboratories = [],
  onOpenLabModal,
  onOpenResetModal,
  onSelectLab,
}) => {
  const cards = [
    {
      title: 'Total Tracked Assets',
      value: metrics.totalAssets,
      subtext: `${metrics.totalAssetItemsCount} distinct item SKUs`,
      icon: Boxes,
      color: 'text-blue-700',
      bgColor: 'bg-white border-slate-300 shadow-xs',
    },
    {
      title: 'Available for Lab',
      value: metrics.availableAssets,
      subtext: 'In cabinet or station slots',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-white border-slate-300 shadow-xs',
    },
    {
      title: 'In Active Use / Deployed',
      value: metrics.inUseAssets,
      subtext: 'Dispatched to workstations',
      icon: Clock,
      color: 'text-amber-700',
      bgColor: 'bg-white border-slate-300 shadow-xs',
    },
    {
      title: 'Damaged / Under Repair',
      value: metrics.damagedAssets,
      subtext: `${metrics.pendingMaintenance} maintenance tickets`,
      icon: AlertTriangle,
      color: 'text-rose-700',
      bgColor: 'bg-white border-slate-300 shadow-xs',
    },
    {
      title: 'Active Borrower Loans',
      value: metrics.activeLoans,
      subtext: metrics.overdueLoans > 0 ? `${metrics.overdueLoans} overdue loans!` : 'All loans within deadline',
      icon: HandCoins,
      color: metrics.overdueLoans > 0 ? 'text-amber-800' : 'text-blue-800',
      bgColor: metrics.overdueLoans > 0 ? 'bg-amber-50 border-amber-300 shadow-xs' : 'bg-white border-slate-300 shadow-xs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with ACLC Pulse Welcome & Scope */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-xs relative overflow-hidden text-slate-900 bg-gradient-to-r from-blue-50/60 via-white to-amber-50/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC College of Manila"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full shadow-xs bg-white p-1 border-2 border-blue-900 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold font-kabel uppercase tracking-wider text-blue-900">
                  ACLC College of Manila
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-amber-700 font-kabel font-bold">ACLC-Pulse Operations</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-kabel tracking-tight text-slate-950">
                {currentLab === 'ALL'
                  ? `All Laboratory Facilities (${laboratories.length} Labs · ${metrics.totalAssets} Units Scope)`
                  : `${currentLab} - ${laboratories.find((l) => l.code === currentLab)?.name || currentLab}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium leading-relaxed">
                Real-time asset tracking, dispensing and loan returns, storage cabinet visualization, and preventive maintenance across all campus academic laboratories.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {onOpenLabModal && (
              <button
                onClick={onOpenLabModal}
                className="px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Manage Labs</span>
              </button>
            )}

            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Reset to 0</span>
              </button>
            )}

            <button
              onClick={onOpenBorrow}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 border border-amber-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Issue / Borrow Item
            </button>
            <button
              onClick={onOpenNewAsset}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              + Add New Asset
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${c.bgColor} transition-all hover:translate-y-[-1px]`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 truncate">{c.title}</span>
                <Icon className={`w-4 h-4 ${c.color} shrink-0 stroke-[2.5]`} />
              </div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-slate-600 mt-1 truncate font-medium">{c.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Dynamic Laboratories Capacity & Status Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">
              Academic Facilities & Labs ({laboratories.length})
            </h2>
          </div>
          {onOpenLabModal && (
            <button
              onClick={onOpenLabModal}
              className="text-xs font-bold text-blue-700 hover:text-blue-950 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add or Manage Laboratory</span>
            </button>
          )}
        </div>

        {laboratories.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
            <h3 className="text-sm font-bold text-slate-900">No laboratories currently configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You can create academic laboratories (e.g. COMLAB, NETLAB, ROBOTICS) to track equipment by room.
            </p>
            {onOpenLabModal && (
              <button
                onClick={onOpenLabModal}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
              >
                + Create First Laboratory
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {laboratories.map((lab) => {
              const isSelected = currentLab === lab.code;
              return (
                <div
                  key={lab.code}
                  className={`bg-white border-2 rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                          <Cpu className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{lab.code}</h3>
                          <span className="text-xs text-slate-500 font-medium">{lab.roomNumber}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                        {lab.activeUnitsCount !== undefined ? `${lab.activeUnitsCount} Units` : `${lab.capacity} Units`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 mb-1">{lab.name}</h4>

                    <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-2">
                      {lab.description || `Target station capacity: ${lab.capacity} units.`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
                    <span className="text-slate-600">
                      Capacity: <strong>{lab.capacity} units</strong>
                    </span>
                    <button
                      onClick={() => {
                        if (onSelectLab) onSelectLab(lab.code);
                        onNavigate('inventory');
                      }}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View Assets <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Bar & System Status */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-700" />
          <span>
            Storage Engine:{' '}
            <strong className="text-slate-950">
              {metrics.isAtlasConnected ? 'MongoDB Atlas (Render Cloud Ready)' : 'Local High-Speed Seed Engine'}
            </strong>
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-medium">High Contrast Light Theme Active</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className="text-blue-800 hover:text-blue-950 font-bold underline underline-offset-4 cursor-pointer"
          >
            Export Formal Laboratory Audit (CSV)
          </button>
          <span className="text-slate-400">·</span>
          <button
            onClick={() => onNavigate('deployment')}
            className="text-amber-800 hover:text-amber-950 font-extrabold cursor-pointer"
          >
            Vercel + Render Instructions
          </button>
        </div>
      </div>
    </div>
  );
};
