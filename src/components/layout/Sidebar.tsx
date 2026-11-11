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
  GraduationCap,
  X,
  Menu
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeLoansCount = 0,
  maintenanceCount = 0,
  isMobileOpen = false,
  onCloseMobile,
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

  const handleNavClick = (tab: NavigationTab) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <>
      {/* College Info Card */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/assets/aistudio/ACLC_3c4418b0.png"
            alt="ACLC College of Manila Logo"
            className="w-9 h-9 object-contain rounded-full shadow-xs bg-white p-0.5 border-2 border-blue-900 shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-xs font-bold font-kabel tracking-wide text-slate-900 truncate">
              ACLC College of Manila
            </h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Laboratory Operations Hub</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-200 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 bg-white overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
          System Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-medium border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-700 stroke-[2.5]' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.id === 'loans'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
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
      <div className="p-3 m-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-2 shrink-0">
        <div className="flex items-center justify-between text-slate-800 font-bold">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-700" />
            Target Labs
          </span>
          <span className="text-[11px] text-blue-800 font-mono font-extrabold bg-blue-100 px-1.5 py-0.2 rounded">
            85 Total Units
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-700">
          <div className="flex justify-between items-center">
            <span className="font-medium">COMLAB (Room 304)</span>
            <span className="font-mono font-bold text-slate-900">40 units</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">NETLAB (Room 306)</span>
            <span className="font-mono font-bold text-slate-900">25 units</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">TESDA Hardware (Room 208)</span>
            <span className="font-mono font-bold text-slate-900">20 units</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Permanent on lg screens) */}
      <aside className="w-64 bg-white border-r border-slate-300 hidden lg:flex flex-col shrink-0 select-none shadow-xs">
        {navContent}
      </aside>

      {/* 2. Mobile / Tablet Off-Canvas Drawer (When user taps hamburger menu) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative w-72 max-w-[85vw] bg-white border-r-2 border-slate-300 flex flex-col z-50 shadow-2xl h-full animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};

interface MobileBottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenMore: () => void;
  activeLoansCount?: number;
  maintenanceCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMore,
  activeLoansCount = 0,
  maintenanceCount = 0,
}) => {
  const quickTabs: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'loans', label: 'Loans', icon: HandCoins, badge: activeLoansCount },
    { id: 'storage', label: 'Storage', icon: QrCode },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-slate-300 flex items-center justify-around px-2 py-1.5 lg:hidden shadow-lg select-none">
      {quickTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer relative min-h-[44px] ${
              isActive
                ? 'text-blue-700 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* More / Full Menu button */}
      <button
        onClick={onOpenMore}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer relative min-h-[44px] ${
          activeTab === 'maintenance' || activeTab === 'reports' || activeTab === 'deployment'
            ? 'text-blue-700 font-extrabold'
            : 'text-slate-600 hover:text-slate-900 font-semibold'
        }`}
      >
        <div className="relative">
          <Menu className="w-5 h-5" />
          {maintenanceCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full border border-white">
              {maintenanceCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">
          {activeTab === 'maintenance' ? 'Kanban' : activeTab === 'reports' ? 'Reports' : 'More'}
        </span>
      </button>
    </nav>
  );
};
