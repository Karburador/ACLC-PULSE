import React from 'react';
import { LabType } from '../../types';
import {
  Menu,
  X,
  Plus,
  RefreshCw,
  Database,
  Building2,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentLab: LabType;
  onLabChange: (lab: LabType) => void;
  onOpenNewAssetModal: () => void;
  onRefresh: () => void;
  isAtlasConnected?: boolean;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLab,
  onLabChange,
  onOpenNewAssetModal,
  onRefresh,
  isAtlasConnected,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-white border-b-2 border-slate-300 text-slate-900 shadow-xs">
      {/* Zone 1: Mobile Hamburger & Brand title */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close Navigation Drawer' : 'Open Navigation Drawer'}
          className="p-2 -ml-1 text-slate-800 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 rounded-lg lg:hidden transition-colors cursor-pointer border border-slate-300"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/assets/aistudio/ACLC_3c4418b0.png"
            alt="ACLC College of Manila Seal"
            className="w-10 sm:w-11 h-10 sm:h-11 object-contain rounded-full shadow-xs bg-white p-0.5 border-2 border-blue-900 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-bold font-kabel tracking-tight text-blue-950 whitespace-nowrap">
                ACLC-Pulse
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 font-kabel tracking-wider bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded border border-amber-400">
                MANILA
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-kabel tracking-wide leading-none hidden md:block mt-0.5 font-medium">
              ACLC College of Manila · Laboratory Operations Hub
            </p>
          </div>
        </div>

        {/* Database state indicator (desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-700 pl-3 border-l border-slate-300">
          <Database className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-semibold">
            {isAtlasConnected ? 'MongoDB Atlas (Live)' : 'Local Storage Engine (Active)'}
          </span>
        </div>
      </div>

      {/* Zone 2: Lab Switcher Dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <div className="relative flex items-center bg-white border-2 border-slate-300 hover:border-blue-700 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 shadow-xs max-w-[170px] sm:max-w-none transition-colors">
          <Building2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-800 mr-1 sm:mr-2 shrink-0" />
          <span className="text-xs text-slate-600 font-bold mr-2 hidden lg:inline">Active Scope:</span>
          <select
            value={currentLab}
            onChange={(e) => onLabChange(e.target.value as LabType)}
            className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer pr-4 appearance-none truncate"
            aria-label="Filter laboratory context"
          >
            <option value="ALL" className="bg-white text-slate-900">All Labs (85 Units)</option>
            <option value="COMLAB" className="bg-white text-slate-900">COMLAB (40 Units)</option>
            <option value="NETLAB" className="bg-white text-slate-900">NETLAB (25 Units)</option>
            <option value="TESDA" className="bg-white text-slate-900">TESDA Hardware (20 Units)</option>
          </select>
          <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-600 pointer-events-none absolute right-1.5 sm:right-2.5" />
        </div>

        <button
          onClick={onRefresh}
          title="Refresh Data from Server"
          className="p-1.5 sm:p-2 text-slate-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
          aria-label="Sync catalog"
        >
          <RefreshCw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>
      </div>

      {/* Zone 3: Primary CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenNewAssetModal}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 border border-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline font-extrabold">Add Asset</span>
          <span className="sm:hidden text-[11px] font-extrabold">Add</span>
        </button>
      </div>
    </header>
  );
};
