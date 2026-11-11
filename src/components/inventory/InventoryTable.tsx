import React, { useState } from 'react';
import { Asset, AssetCategory, AssetStatus, LabType } from '../../types';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  HandCoins,
  QrCode,
  Plus,
  Package,
  Layers,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Archive
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
  onDeleteAsset,
  onQuickDispense,
  onPrintTag,
  onAddNewAsset,
}) => {
  const categories = ['ALL', 'Equipment', 'Tools', 'Consumable Materials'];
  const statuses = ['ALL', 'Available', 'In Use', 'Under Maintenance', 'Damaged', 'Archived'];

  const getStatusDisplay = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return <span className="text-emerald-400 font-medium">Available</span>;
      case 'In Use':
        return <span className="text-amber-400 font-medium">In Use</span>;
      case 'Under Maintenance':
        return <span className="text-blue-400 font-medium">Maintenance</span>;
      case 'Damaged':
        return <span className="text-rose-400 font-medium">Damaged</span>;
      case 'Archived':
        return <span className="text-slate-400 font-medium">Archived</span>;
      default:
        return <span className="text-slate-300 font-medium">{status}</span>;
    }
  };

  const getLabColor = (lab: string) => {
    switch (lab) {
      case 'COMLAB':
        return 'text-blue-300';
      case 'NETLAB':
        return 'text-indigo-300';
      case 'TESDA':
        return 'text-amber-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by tag, item name, model, serial #..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Category Segmented Controls (interactive functional buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-900/60 text-amber-300 border border-blue-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter & Add Asset Action */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={selectedStatus}
              onChange={(e) => onSelectStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-3"
            >
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s === 'ALL' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onAddNewAsset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Asset</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Asset Tag</th>
                <th className="px-4 py-3">Item Name & Specs</th>
                <th className="px-3 py-3">Laboratory</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3 text-right">Available / Total</th>
                <th className="px-3 py-3">Cabinet / Shelf</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Package className="w-8 h-8 text-slate-500 mx-auto stroke-1" />
                      <p className="text-sm font-medium text-slate-300">No assets match criteria</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query, laboratory switch, or category filter.
                      </p>
                      <button
                        onClick={onAddNewAsset}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Register new asset
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const isAvailable = (asset.availableQuantity || 0) > 0;
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Asset Tag */}
                      <td className="px-4 py-3 font-mono font-semibold text-amber-400 whitespace-nowrap">
                        {asset.assetTag}
                      </td>

                      {/* Item Name & Specs */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100 max-w-sm truncate">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 max-w-sm truncate">
                          {asset.brandModel && <span>{asset.brandModel}</span>}
                          {asset.brandModel && asset.specs && <span aria-hidden="true">·</span>}
                          {asset.specs && <span className="truncate">{asset.specs}</span>}
                        </div>
                      </td>

                      {/* Laboratory */}
                      <td className="px-3 py-3 font-medium whitespace-nowrap">
                        <span className={getLabColor(asset.lab)}>{asset.lab}</span>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                        {asset.category}
                      </td>

                      {/* Available / Total Quantities */}
                      <td className="px-3 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            asset.availableQuantity === 0
                              ? 'text-rose-400'
                              : asset.availableQuantity < asset.quantity
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {asset.availableQuantity}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-200">{asset.quantity}</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {asset.unit || 'units'}
                        </span>
                      </td>

                      {/* Cabinet / Shelf */}
                      <td className="px-3 py-3 text-slate-300">
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate" title={`${asset.storageLocation?.rackOrCabinet} - ${asset.storageLocation?.shelf}`}>
                            {asset.storageLocation?.rackOrCabinet || 'Depot'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate pl-4">
                          {asset.storageLocation?.shelf}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {getStatusDisplay(asset.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Dispense Action (Phase 2 Link) */}
                          <button
                            onClick={() => onQuickDispense(asset)}
                            disabled={!isAvailable}
                            title={isAvailable ? 'Dispense / Issue to Borrower' : 'All units currently issued'}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isAvailable
                                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            <HandCoins className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Asset Tag (Phase 3 Link) */}
                          <button
                            onClick={() => onPrintTag(asset)}
                            title="Generate & Print Physical Asset Tag"
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Asset */}
                          <button
                            onClick={() => onEditAsset(asset)}
                            title="Edit Asset Details"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Asset */}
                          <button
                            onClick={() => onDeleteAsset(asset.id, asset.name)}
                            title="Delete or Archive Asset"
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{assets.length}</span> asset entries
            {currentLab !== 'ALL' && ` in ${currentLab}`}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Total Units:{' '}
              <strong className="text-slate-200 font-mono tabular-nums">
                {assets.reduce((sum, a) => sum + (a.quantity || 1), 0)}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Available Units:{' '}
              <strong className="text-emerald-400 font-mono tabular-nums">
                {assets.reduce((sum, a) => sum + (a.availableQuantity || 0), 0)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
