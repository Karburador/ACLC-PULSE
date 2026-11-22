import React, { useState } from 'react';
import { Asset, AssetStatus, LabType } from '../../types';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  HandCoins,
  QrCode,
  Plus,
  Package,
  MapPin,
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  Hash,
  Tag,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Info,
  Monitor,
  Copy,
} from 'lucide-react';

interface InventoryTableProps {
  assets: Asset[];
  currentLab: LabType;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedStatus: string;
  onSelectStatus: (st: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEditAsset: (asset: Asset) => void;
  onCloneAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string, name: string) => void;
  onQuickDispense: (asset: Asset) => void;
  onPrintTag: (asset: Asset) => void;
  onAddNewAsset: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  assets,
  currentLab,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onEditAsset,
  onCloneAsset,
  onDeleteAsset,
  onQuickDispense,
  onPrintTag,
  onAddNewAsset,
}) => {
  const categories = ['ALL', 'Computers', 'Routers', 'Tools', 'Projectors', 'Peripherals', 'Consumables'];
  const statuses = ['ALL', 'Available', 'In Use', 'Under Maintenance', 'Damaged', 'Archived'];

  // Row expand state for inspecting full specs in-line
  const [expandedAssetIds, setExpandedAssetIds] = useState<Set<string>>(new Set());
  // Detailed modal inspector
  const [inspectingAsset, setInspectingAsset] = useState<Asset | null>(null);
  // View mode: comfortable (shows wrap specs) vs compact
  const [isComfortableView, setIsComfortableView] = useState(true);

  const toggleRowExpand = (id: string) => {
    setExpandedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (expandedAssetIds.size === assets.length) {
      setExpandedAssetIds(new Set());
    } else {
      setExpandedAssetIds(new Set(assets.map((a) => a.id)));
    }
  };

  const getStatusDisplay = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Available
          </span>
        );
      case 'In Use':
        return (
          <span className="inline-flex items-center gap-1 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            In Use
          </span>
        );
      case 'Under Maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Maintenance
          </span>
        );
      case 'Damaged':
        return (
          <span className="inline-flex items-center gap-1 text-rose-900 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Damaged
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Archived
          </span>
        );
      default:
        return <span className="text-slate-800 font-semibold">{status}</span>;
    }
  };

  const getLabBadge = (lab: string) => {
    switch (lab) {
      case 'COMLAB':
        return 'text-blue-900 font-black bg-blue-100 border border-blue-300 px-2 py-0.5 rounded text-[11px]';
      case 'NETLAB':
        return 'text-indigo-900 font-black bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded text-[11px]';
      case 'TESDA':
        return 'text-amber-950 font-black bg-amber-100 border border-amber-400 px-2 py-0.5 rounded text-[11px]';
      case 'MACLAB':
        return 'text-purple-900 font-black bg-purple-100 border border-purple-300 px-2 py-0.5 rounded text-[11px]';
      case 'CYBERLAB':
        return 'text-emerald-900 font-black bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[11px]';
      case 'IOTLAB':
        return 'text-teal-900 font-black bg-teal-100 border border-teal-300 px-2 py-0.5 rounded text-[11px]';
      default:
        return 'text-slate-900 font-black bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 bg-white border-2 border-slate-200 p-3.5 rounded-xl shadow-xs">
        {/* Top Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by tag, item name, model, serial #, specs..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-700 focus:bg-white font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* View Mode Toggle */}
            <button
              onClick={() => setIsComfortableView((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Toggle full text wrap vs compact table"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>{isComfortableView ? 'Comfortable (Full Specs)' : 'Compact View'}</span>
            </button>

            {/* Expand / Collapse All Specs */}
            <button
              onClick={expandAll}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Expand or collapse details for all visible items"
            >
              <Info className="w-3.5 h-3.5 text-blue-700" />
              <span>{expandedAssetIds.size === assets.length && assets.length > 0 ? 'Collapse All' : 'Expand Details'}</span>
            </button>

            {/* Status Filter */}
            <div className="relative flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-600 mr-2" />
              <select
                value={selectedStatus}
                onChange={(e) => onSelectStatus(e.target.value)}
                className="bg-transparent text-xs text-slate-900 font-bold focus:outline-none cursor-pointer pr-3"
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-white text-slate-900">
                    {s === 'ALL' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Asset Primary Button */}
            <button
              onClick={onAddNewAsset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Asset</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white font-extrabold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold border border-slate-200 bg-white'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Notice & Sticky Actions Guide */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>
            Showing <strong className="text-slate-900 font-bold">{assets.length}</strong> items {currentLab !== 'ALL' && `under ${currentLab}`}.
          </span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline text-slate-500">
            Click on any item name or <ChevronRight className="w-3 h-3 inline text-slate-400" /> to view complete specs and details.
          </span>
        </div>
        <div className="text-blue-900 font-bold hidden md:flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          <span>Actions column is pinned to the right</span>
        </div>
      </div>

      {/* Assets Table Container with custom scrollbar and sticky actions */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-extrabold uppercase tracking-wider select-none">
                <th className="px-3 py-3 w-10 text-center">
                  <span className="sr-only">Expand</span>
                </th>
                <th className="px-3 py-3 min-w-[130px] whitespace-nowrap">Asset Tag</th>
                <th className="px-3 py-3 min-w-[280px]">Item Name & Specifications</th>
                <th className="px-3 py-3 min-w-[100px] whitespace-nowrap">Laboratory</th>
                <th className="px-3 py-3 min-w-[110px] whitespace-nowrap">Category</th>
                <th className="px-3 py-3 min-w-[110px] text-right whitespace-nowrap">Available / Total</th>
                <th className="px-3 py-3 min-w-[160px]">Cabinet / Shelf</th>
                <th className="px-3 py-3 min-w-[110px] whitespace-nowrap">Status</th>
                {/* STICKY ACTIONS HEADER: Always pinned on the right side */}
                <th className="px-3 py-3 text-center sticky right-0 bg-slate-100 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.12)] z-20 w-[178px] min-w-[178px] border-l border-slate-300">
                  <div className="font-black text-slate-900 tracking-wider">ACTIONS</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-600 bg-white">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Package className="w-9 h-9 text-slate-400 mx-auto stroke-1" />
                      <p className="text-sm font-bold text-slate-900">No assets match the current filter</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search query, laboratory filter, or category selection.
                      </p>
                      <button
                        onClick={onAddNewAsset}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700 hover:underline font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register a new asset
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const isAvailable = (asset.availableQuantity || 0) > 0;
                  const isExpanded = expandedAssetIds.has(asset.id);

                  return (
                    <React.Fragment key={asset.id}>
                      <tr
                        className={`transition-colors group ${
                          isExpanded ? 'bg-blue-50/60' : 'hover:bg-blue-50/30'
                        }`}
                      >
                        {/* 1. Expand / Details Chevron */}
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() => toggleRowExpand(asset.id)}
                            className="p-1 text-slate-500 hover:text-blue-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                            title={isExpanded ? 'Hide specs & details' : 'Show full specs & details'}
                            aria-label="Toggle details"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-700 stroke-[2.5]" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* 2. Asset Tag */}
                        <td className="px-3 py-3 font-mono font-bold text-blue-900 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{asset.assetTag}</span>
                            {asset.serialNumber && (
                              <span
                                className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded font-normal"
                                title={`SN: ${asset.serialNumber}`}
                              >
                                SN
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Item Name & Specifications (With comfortable wrapping option) */}
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setInspectingAsset(asset)}
                            className="text-left font-bold text-slate-950 hover:text-blue-700 text-xs transition-colors cursor-pointer block group-hover:underline"
                            title="Click to view full specs & details passport"
                          >
                            {asset.name}
                          </button>

                          <div
                            className={`text-[11px] text-slate-600 font-medium mt-0.5 ${
                              isComfortableView ? 'break-words' : 'truncate max-w-md'
                            }`}
                          >
                            {asset.brandModel && (
                              <span className="font-semibold text-slate-700 mr-1.5">
                                {asset.brandModel}
                              </span>
                            )}
                            {asset.brandModel && asset.specs && (
                              <span className="text-slate-400 mr-1.5" aria-hidden="true">
                                ·
                              </span>
                            )}
                            {asset.specs && <span>{asset.specs}</span>}
                          </div>
                        </td>

                        {/* 4. Laboratory */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={getLabBadge(asset.lab)}>{asset.lab}</span>
                        </td>

                        {/* 5. Category */}
                        <td className="px-3 py-3 text-slate-800 font-semibold whitespace-nowrap">
                          {asset.category}
                        </td>

                        {/* 6. Available / Total Quantities */}
                        <td className="px-3 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                          <span
                            className={`font-black text-sm ${
                              asset.availableQuantity === 0
                                ? 'text-rose-700'
                                : asset.availableQuantity < asset.quantity
                                ? 'text-amber-800'
                                : 'text-emerald-700'
                            }`}
                          >
                            {asset.availableQuantity}
                          </span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-slate-900 font-bold">{asset.quantity}</span>
                          <span className="text-[10px] text-slate-500 font-medium ml-1">
                            {asset.unit || 'units'}
                          </span>
                        </td>

                        {/* 7. Cabinet / Shelf */}
                        <td className="px-3 py-3 text-slate-800">
                          <div className="flex items-center gap-1 font-semibold text-xs">
                            <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                            <span className={isComfortableView ? 'break-words' : 'truncate max-w-[150px]'}>
                              {asset.storageLocation?.rackOrCabinet || 'Depot'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 pl-4">
                            {asset.storageLocation?.shelf}
                            {asset.storageLocation?.slot ? ` · ${asset.storageLocation.slot}` : ''}
                          </div>
                        </td>

                        {/* 8. Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {getStatusDisplay(asset.status)}
                        </td>

                        {/* 9. STICKY ACTIONS COLUMN */}
                        <td
                          className={`px-3 py-2.5 text-center whitespace-nowrap sticky right-0 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.12)] z-10 w-[178px] min-w-[178px] border-l border-slate-200 transition-colors ${
                            isExpanded ? 'bg-blue-50' : 'bg-white group-hover:bg-blue-50/95'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {/* Quick Dispense Action */}
                            <button
                              onClick={() => onQuickDispense(asset)}
                              disabled={!isAvailable}
                              title={isAvailable ? 'Dispense / Issue to Student or Faculty' : 'All units currently issued'}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isAvailable
                                  ? 'text-amber-950 bg-amber-300 hover:bg-amber-400 border border-amber-400 shadow-2xs'
                                  : 'text-slate-300 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <HandCoins className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* Print Asset Tag */}
                            <button
                              onClick={() => onPrintTag(asset)}
                              title="Generate & Print Physical Asset Tag"
                              className="p-1.5 text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                              <QrCode className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* Clone / Duplicate Asset */}
                            <button
                              onClick={() => onCloneAsset(asset)}
                              title="Clone / Duplicate as New Asset"
                              className="p-1.5 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                              <Copy className="w-4 h-4 stroke-[2]" />
                            </button>

                            {/* Edit Asset */}
                            <button
                              onClick={() => onEditAsset(asset)}
                              title="Edit Asset Details"
                              className="p-1.5 text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit2 className="w-4 h-4 stroke-[2]" />
                            </button>

                            {/* Delete Asset */}
                            <button
                              onClick={() => onDeleteAsset(asset.id, asset.name)}
                              title="Delete or Archive Asset"
                              className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2]" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded In-Line Details Accordion (Solves 'marami ng di makita') */}
                      {isExpanded && (
                        <tr className="bg-blue-50/70 border-b border-blue-200">
                          <td colSpan={9} className="px-5 py-4">
                            <div className="bg-white border-2 border-blue-200 rounded-xl p-4 space-y-3 shadow-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-blue-950 bg-blue-100 px-2 py-0.5 rounded text-xs">
                                    {asset.assetTag}
                                  </span>
                                  <h4 className="text-sm font-black text-slate-950">{asset.name}</h4>
                                  <span className={getLabBadge(asset.lab)}>{asset.lab}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setInspectingAsset(asset)}
                                    className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Open Full Passport
                                  </button>
                                  <button
                                    onClick={() => onCloneAsset(asset)}
                                    className="flex items-center gap-1 text-xs font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Clone
                                  </button>
                                  <button
                                    onClick={() => onEditAsset(asset)}
                                    className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-300 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" /> Edit Asset
                                  </button>
                                </div>
                              </div>

                              {/* Detailed Fields Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {/* Col 1: Specs & Hardware Details */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-blue-700" /> Complete Hardware Specifications
                                  </span>
                                  <p className="text-slate-900 font-semibold leading-relaxed">
                                    {asset.specs || 'No extended technical specifications recorded.'}
                                  </p>
                                  {asset.brandModel && (
                                    <p className="text-slate-600 text-[11px] pt-1">
                                      Brand & Model: <strong className="text-slate-900">{asset.brandModel}</strong>
                                    </p>
                                  )}
                                  {asset.serialNumber && (
                                    <p className="text-slate-600 text-[11px] font-mono">
                                      Serial Number: <strong className="text-slate-900">{asset.serialNumber}</strong>
                                    </p>
                                  )}
                                  {asset.monitorInfo &&
                                    (asset.monitorInfo.brandModel ||
                                      asset.monitorInfo.serialNumber ||
                                      asset.monitorInfo.specs) && (
                                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-0.5">
                                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                                          <Monitor className="w-3 h-3" /> Paired Monitor
                                        </p>
                                        <p className="text-[11px] font-semibold text-slate-900">
                                          {[asset.monitorInfo.brandModel, asset.monitorInfo.specs]
                                            .filter(Boolean)
                                            .join(' · ') || 'Monitor attached'}
                                        </p>
                                        {asset.monitorInfo.serialNumber && (
                                          <p className="text-[10px] font-mono text-slate-600">
                                            Monitor S/N: <strong className="text-slate-900">{asset.monitorInfo.serialNumber}</strong>
                                          </p>
                                        )}
                                      </div>
                                    )}
                                </div>

                                {/* Col 2: Storage & Physical Placement */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-blue-700" /> Storage Location in {asset.lab}
                                  </span>
                                  <p className="text-slate-900 font-bold">
                                    {asset.storageLocation?.rackOrCabinet || 'Laboratory Depot'}
                                  </p>
                                  <p className="text-slate-600 text-[11px]">
                                    Position: <strong className="text-slate-900">{asset.storageLocation?.shelf || 'Under Table'}</strong>
                                  </p>
                                  {asset.storageLocation?.slot && (
                                    <p className="text-slate-600 text-[11px]">
                                      Seat / Bay: <strong className="text-slate-900">{asset.storageLocation.slot}</strong>
                                    </p>
                                  )}
                                  <p className="text-slate-600 text-[11px]">
                                    Stock Count: <strong className="text-emerald-700">{asset.availableQuantity} available</strong> of {asset.quantity} total {asset.unit}
                                  </p>
                                </div>

                                {/* Col 3: Maintenance & Custodian Logs */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-blue-700" /> Operational History & Notes
                                  </span>
                                  <p className="text-slate-600 text-[11px]">
                                    Acquisition Date: <strong className="text-slate-900">{asset.acquisitionDate || 'Standard Inventory Batch'}</strong>
                                  </p>
                                  <p className="text-slate-600 text-[11px]">
                                    Last Maintained: <strong className="text-slate-900">{asset.lastMaintained || 'Up to date'}</strong>
                                  </p>
                                  {asset.notes && (
                                    <p className="text-slate-700 text-[11px] bg-white p-2 rounded border border-slate-200 italic mt-1">
                                      "{asset.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
          <div>
            Showing <span className="font-bold text-slate-950">{assets.length}</span> asset entries
            {currentLab !== 'ALL' && ` in ${currentLab}`}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Total Equipment Units:{' '}
              <strong className="text-slate-950 font-mono font-bold tabular-nums">
                {assets.reduce((sum, a) => sum + (a.quantity || 1), 0)}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>
              Available Units:{' '}
              <strong className="text-emerald-700 font-mono font-bold tabular-nums">
                {assets.reduce((sum, a) => sum + (a.availableQuantity || 0), 0)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Asset Specifications & Details Passport Modal */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-300 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm px-2.5 py-1 bg-blue-100 text-blue-950 rounded-lg border border-blue-300">
                    {inspectingAsset.assetTag}
                  </span>
                  <span className={getLabBadge(inspectingAsset.lab)}>{inspectingAsset.lab}</span>
                  {getStatusDisplay(inspectingAsset.status)}
                </div>
                <h3 className="text-lg font-black text-slate-950 tracking-tight">
                  {inspectingAsset.name}
                </h3>
              </div>

              <button
                onClick={() => setInspectingAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications Card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-blue-700" />
                <span>Technical Specifications & Hardware Information</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {inspectingAsset.specs || 'Standard equipment item without extended configuration specs.'}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 font-semibold block">Brand & Model:</span>
                  <span className="font-bold text-slate-900">{inspectingAsset.brandModel || 'ACLC Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Category:</span>
                  <span className="font-bold text-slate-900">{inspectingAsset.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Serial Number:</span>
                  <span className="font-mono font-bold text-slate-900">{inspectingAsset.serialNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Quantity Breakdown:</span>
                  <span className="font-bold text-emerald-700">{inspectingAsset.availableQuantity} Available</span>
                  <span className="text-slate-500"> / {inspectingAsset.quantity} Total {inspectingAsset.unit}</span>
                </div>
                {inspectingAsset.monitorInfo &&
                  (inspectingAsset.monitorInfo.brandModel ||
                    inspectingAsset.monitorInfo.serialNumber ||
                    inspectingAsset.monitorInfo.specs) && (
                    <div className="col-span-2 mt-1 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1 mb-0.5">
                        <Monitor className="w-3.5 h-3.5 text-emerald-700" /> Paired Monitor
                      </span>
                      <div className="font-bold text-slate-900">
                        {[inspectingAsset.monitorInfo.brandModel, inspectingAsset.monitorInfo.specs]
                          .filter(Boolean)
                          .join(' · ') || 'Paired Monitor'}
                      </div>
                      {inspectingAsset.monitorInfo.serialNumber && (
                        <div className="text-[11px] font-mono text-slate-700 mt-0.5">
                          Serial / Tag: <strong>{inspectingAsset.monitorInfo.serialNumber}</strong>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Location & Custodian Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <span>Physical Storage Placement</span>
                </div>
                <p className="text-slate-900 font-bold text-sm">
                  {inspectingAsset.storageLocation?.rackOrCabinet}
                </p>
                <p className="text-slate-600">
                  Position: <strong className="text-slate-900">{inspectingAsset.storageLocation?.shelf}</strong>
                </p>
                {inspectingAsset.storageLocation?.slot && (
                  <p className="text-slate-600">
                    Seat / Bay: <strong className="text-slate-900">{inspectingAsset.storageLocation.slot}</strong>
                  </p>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>Procurement & Maintenance</span>
                </div>
                <p className="text-slate-600">
                  Acquired: <strong className="text-slate-900">{inspectingAsset.acquisitionDate || 'Standard Term Batch'}</strong>
                </p>
                <p className="text-slate-600">
                  Last Serviced: <strong className="text-slate-900">{inspectingAsset.lastMaintained || 'Current'}</strong>
                </p>
                {inspectingAsset.notes && (
                  <p className="text-slate-700 italic text-[11px] pt-1">
                    "{inspectingAsset.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setInspectingAsset(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const a = inspectingAsset;
                    setInspectingAsset(null);
                    onCloneAsset(a);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" /> Clone
                </button>
                <button
                  onClick={() => {
                    const a = inspectingAsset;
                    setInspectingAsset(null);
                    onPrintTag(a);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" /> Print Tag
                </button>
                <button
                  onClick={() => {
                    const a = inspectingAsset;
                    setInspectingAsset(null);
                    onQuickDispense(a);
                  }}
                  disabled={inspectingAsset.availableQuantity <= 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer shadow-xs"
                >
                  <HandCoins className="w-3.5 h-3.5 stroke-[2.5]" /> Issue / Borrow
                </button>
                <button
                  onClick={() => {
                    const a = inspectingAsset;
                    setInspectingAsset(null);
                    onEditAsset(a);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
