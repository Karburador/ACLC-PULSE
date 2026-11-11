import React from 'react';
import { LabType } from '../../types';
import {
  Layers,
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
}

export const Header: React.FC<HeaderProps> = ({
  currentLab,
  onLabChange,
  onOpenNewAssetModal,
  onRefresh,
  isAtlasConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Zone 1: Brand title & Institution */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex items-center justify-center border border-amber-400/40 shadow-inner">
            <span className="font-bold text-amber-400 text-base tracking-tighter">AP</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                ACLC-Pulse
              </span>
              <span className="text-[11px] font-semibold text-amber-400 tracking-wide bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                MANILA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none hidden sm:block">
              Laboratory Asset & Inventory Pulse
            </p>
          </div>
        </div>

        {/* Database state indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-slate-800">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isAtlasConnected ? 'MongoDB Atlas (Live)' : 'Local Storage Engine (Active)'}
          </span>
        </div>
      </div>

      {/* Zone 2: Lab Switcher Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 focus-within:border-amber-400 transition-colors shadow-inner">
          <Building2 className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
          <span className="text-xs text-slate-400 mr-2 hidden md:inline">Active Scope:</span>
          <select
            value={currentLab}
            onChange={(e) => onLabChange(e.target.value as LabType)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
            aria-label="Filter laboratory context"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Labs (85 Units)</option>
            <option value="COMLAB" className="bg-slate-900 text-white">COMLAB (40 Units)</option>
            <option value="NETLAB" className="bg-slate-900 text-white">NETLAB (25 Units)</option>
            <option value="TESDA" className="bg-slate-900 text-white">TESDA Hardware Lab (20 Units)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
        </div>

        <button
          onClick={onRefresh}
          title="Refresh Data from Server"
          className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          aria-label="Sync catalog"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: Primary CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenNewAssetModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Asset</span>
        </button>
      </div>
    </header>
  );
};
