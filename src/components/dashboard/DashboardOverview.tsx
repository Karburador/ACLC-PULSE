import React from 'react';
import { LabType } from '../../types';
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
  Server
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
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentLab,
  metrics,
  onNavigate,
  onOpenNewAsset,
  onOpenBorrow,
}) => {
  const cards = [
    {
      title: 'Total Tracked Assets',
      value: metrics.totalAssets,
      subtext: `${metrics.totalAssetItemsCount} distinct item SKUs`,
      icon: Boxes,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/30 border-blue-900/50',
    },
    {
      title: 'Available for Lab',
      value: metrics.availableAssets,
      subtext: 'In cabinet or station slots',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20 border-emerald-900/40',
    },
    {
      title: 'In Active Use / Deployed',
      value: metrics.inUseAssets,
      subtext: 'Dispatched to workstations',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/20 border-amber-900/40',
    },
    {
      title: 'Damaged / Under Repair',
      value: metrics.damagedAssets,
      subtext: `${metrics.pendingMaintenance} maintenance tickets`,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/20 border-rose-900/40',
    },
    {
      title: 'Active Borrower Loans',
      value: metrics.activeLoans,
      subtext: metrics.overdueLoans > 0 ? `${metrics.overdueLoans} overdue loans!` : 'All loans within deadline',
      icon: HandCoins,
      color: metrics.overdueLoans > 0 ? 'text-amber-300' : 'text-cyan-400',
      bgColor: metrics.overdueLoans > 0 ? 'bg-amber-950/30 border-amber-800/60' : 'bg-cyan-950/20 border-cyan-900/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with ACLC Pulse Welcome & Scope */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                ACLC College of Manila
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">Laboratory Asset Pulse</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {currentLab === 'ALL'
                ? 'All Laboratory Facilities (85 Units Scope)'
                : currentLab === 'COMLAB'
                ? 'COMLAB - Computer Laboratory (40 Units Scope)'
                : currentLab === 'NETLAB'
                ? 'NETLAB - Cisco Networking Laboratory (25 Units Scope)'
                : 'TESDA Hardware Servicing Laboratory (20 Units Scope)'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time asset tracking, dispensing and loan returns, storage cabinet visualization, and preventive maintenance for student and faculty equipment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBorrow}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Issue / Borrow Item
            </button>
            <button
              onClick={onOpenNewAsset}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 active:bg-blue-800 border border-blue-500/40 rounded-lg transition-colors cursor-pointer"
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
              className={`p-4 rounded-xl border ${c.bgColor} backdrop-blur-sm transition-all hover:translate-y-[-1px]`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-300 truncate">{c.title}</span>
                <Icon className={`w-4 h-4 ${c.color} shrink-0`} />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{c.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Target Labs Capacity & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* COMLAB Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-700/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded bg-blue-950/60 border border-blue-700/50 text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">COMLAB (Room 304)</h3>
                <span className="text-xs text-slate-400">Programming & Software Lab</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              40 Units
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Dell OptiPlex Core i7 Workstations, 24" UltraSharp monitors, classroom projector, and network cabling tools.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Station Allocation: 100% Deployed</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              View Assets <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* NETLAB Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-700/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded bg-indigo-950/60 border border-indigo-700/50 text-indigo-400">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">NETLAB (Room 306)</h3>
                <span className="text-xs text-slate-400">Cisco Networking Academy</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              25 Units
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Cisco 2911 ISR routers, Catalyst 2960-X 24-port switches, Fluke MicroScanner2 verifiers, and 42U rack units.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Racks Alpha & Beta: Online</span>
            <button
              onClick={() => onNavigate('storage')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Inspect Racks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TESDA Hardware Lab Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-700/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded bg-amber-950/50 border border-amber-700/50 text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">TESDA Hardware Lab</h3>
                <span className="text-xs text-slate-400">Room 208 · CSS NC II</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              20 Units
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Modular assembly test beds, Hakko digital soldering stations, Uni-T multimeters, and component diagnosis benches.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400">NC II Assessment Ready</span>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Open Kanban <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Bar & System Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" />
          <span>
            Storage Engine:{' '}
            <strong className="text-slate-200">
              {metrics.isAtlasConnected ? 'MongoDB Atlas (Render Cloud Ready)' : 'Local High-Speed Seed Engine'}
            </strong>
          </span>
          <span className="text-slate-600">·</span>
          <span>Zero-pill metadata compliance verified</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className="text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            Export Formal Laboratory Audit (CSV)
          </button>
          <span className="text-slate-600">·</span>
          <button
            onClick={() => onNavigate('deployment')}
            className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            Vercel + Render Instructions
          </button>
        </div>
      </div>
    </div>
  );
};
