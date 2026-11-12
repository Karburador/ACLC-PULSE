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
                  ? 'All Laboratory Facilities (160 Units Scope)'
                  : currentLab === 'COMLAB'
                  ? 'COMLAB - Computer Programming Lab (40 Units Scope)'
                  : currentLab === 'NETLAB'
                  ? 'NETLAB - Cisco CCNA Networking Lab (25 Units Scope)'
                  : currentLab === 'TESDA'
                  ? 'TESDA - Hardware Servicing NC II Lab (20 Units Scope)'
                  : currentLab === 'MACLAB'
                  ? 'MACLAB - Multimedia & Graphics Design Lab (30 Units Scope)'
                  : currentLab === 'CYBERLAB'
                  ? 'CYBERLAB - Cybersecurity & Cloud Server Lab (20 Units Scope)'
                  : 'IOTLAB - IoT, Robotics & Embedded Lab (25 Units Scope)'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium leading-relaxed">
                Real-time asset tracking, dispensing and loan returns, storage cabinet visualization, and preventive maintenance for student and faculty equipment across all 6 specialized facilities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBorrow}
              className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 border border-amber-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Issue / Borrow Item
            </button>
            <button
              onClick={onOpenNewAsset}
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg transition-colors shadow-xs cursor-pointer"
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

      {/* Target Labs Capacity & Status Section (6 Laboratories) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. COMLAB Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                <Cpu className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">COMLAB (Room 304)</h3>
                <span className="text-xs text-slate-500 font-medium">Programming & Software Lab</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
              40 Units
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Dell OptiPlex Core i7 Workstations, 24" UltraSharp monitors, classroom projector, and network cabling tools.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
            <span className="text-slate-600">Station Allocation: 100% Deployed</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              View Assets <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 2. NETLAB Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                <Network className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">NETLAB (Room 306)</h3>
                <span className="text-xs text-slate-500 font-medium">Cisco CCNA Networking Lab</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
              25 Units
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Cisco 2911 ISR routers, Catalyst 2960-X 24-port switches, Fluke MicroScanner2 verifiers, and 42U rack units.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
            <span className="text-slate-600">Racks Alpha & Beta: Online</span>
            <button
              onClick={() => onNavigate('storage')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              Inspect Racks <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 3. TESDA Hardware Lab Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                <Wrench className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">TESDA Hardware Lab</h3>
                <span className="text-xs text-slate-500 font-medium">Room 208 · CSS NC II</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
              20 Units
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Modular assembly test beds, Hakko digital soldering stations, Uni-T multimeters, and component diagnosis benches.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
            <span className="text-slate-600">NC II Assessment Ready</span>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              Open Kanban <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 4. MACLAB Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-900 border border-purple-200">
                <Boxes className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">MACLAB (Room 302)</h3>
                <span className="text-xs text-slate-500 font-medium">Multimedia & Design Studio</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
              30 Units
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Apple iMac 24" 4.5K Retina M3, Wacom Cintiq 16 Pro pen displays, ViewSonic 4K laser projector, and studio gear.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
            <span className="text-slate-600">Creative Production Ready</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              View Assets <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 5. CYBERLAB Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">CYBERLAB (Room 308)</h3>
                <span className="text-xs text-slate-500 font-medium">Cybersecurity & Cloud Servers</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              20 Units
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Dell PowerEdge R750 dual Xeon servers, Fortinet FortiGate firewalls, MikroTik 10G routers, and fiber diagnostics.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
            <span className="text-slate-600">Isolated Sandbox Network</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              View Assets <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 6. IOTLAB Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-900 border border-teal-200">
                <Server className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">IOTLAB (Room 204)</h3>
                <span className="text-xs text-slate-500 font-medium">Robotics & Embedded Systems</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
              25 Units
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Raspberry Pi 5 Developer Stations, Arduino Mega kits, Rigol digital oscilloscopes, and smart sensor kits.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-medium">
            <span className="text-slate-600">Hardware Prototyping Ready</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              View Assets <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
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
