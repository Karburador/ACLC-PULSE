import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  HandCoins,
  QrCode,
  Wrench,
  FileSpreadsheet,
  Server,
  Building,
  GraduationCap
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'inventory'
  | 'loans'
  | 'storage'
  | 'maintenance'
  | 'reports'
  | 'deployment';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  activeLoansCount?: number;
  maintenanceCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeLoansCount = 0,
  maintenanceCount = 0,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number; phaseTag: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, phaseTag: 'Overview' },
    { id: 'inventory', label: 'Core Inventory', icon: Boxes, phaseTag: 'Phase 1' },
    { id: 'loans', label: 'Dispensing & Loans', icon: HandCoins, badge: activeLoansCount, phaseTag: 'Phase 2' },
    { id: 'storage', label: 'Storage & Tags', icon: QrCode, phaseTag: 'Phase 3' },
    { id: 'maintenance', label: 'Maintenance Kanban', icon: Wrench, badge: maintenanceCount, phaseTag: 'Phase 4' },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet, phaseTag: 'Phase 5' },
    { id: 'deployment', label: 'Vercel + Render + Atlas', icon: Server, phaseTag: 'DevOps' },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* College Info Card */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-950 border border-blue-700/60 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-slate-200 tracking-wide truncate">
              ACLC College of Manila
            </h2>
            <p className="text-[11px] text-slate-400 truncate">Laboratory Operations Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          System Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900/40 text-amber-300 border border-blue-700/60 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.2 rounded ${
                      item.id === 'loans'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
                  {item.phaseTag}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Target Labs Quick Status Indicator */}
      <div className="p-3 m-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            Target Labs
          </span>
          <span className="text-[11px] text-amber-400 font-mono">85 Total Units</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between items-center">
            <span>COMLAB (Room 304)</span>
            <span className="font-mono text-slate-300">40 units</span>
          </div>
          <div className="flex justify-between items-center">
            <span>NETLAB (Room 306)</span>
            <span className="font-mono text-slate-300">25 units</span>
          </div>
          <div className="flex justify-between items-center">
            <span>TESDA Hardware (Room 208)</span>
            <span className="font-mono text-slate-300">20 units</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
