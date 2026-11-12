import React from 'react';
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
  const categories = ['ALL', 'Computers', 'Routers', 'Tools', 'Projectors', 'Peripherals', 'Consumables'];
  const statuses = ['ALL', 'Available', 'In Use', 'Under Maintenance', 'Damaged', 'Archived'];

  const getStatusDisplay = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
            Available
          </span>
        );
      case 'In Use':
        return (
          <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
            In Use
          </span>
        );
      case 'Under Maintenance':
        return (
          <span className="text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
            Maintenance
          </span>
        );
      case 'Damaged':
        return (
          <span className="text-rose-900 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
            Damaged
          </span>
        );
      case 'Archived':
        return (
          <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
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
        return 'text-blue-900 font-bold bg-blue-100 border border-blue-300 px-2 py-0.5 rounded';
      case 'NETLAB':
        return 'text-indigo-900 font-bold bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded';
      case 'TESDA':
        return 'text-amber-950 font-bold bg-amber-100 border border-amber-400 px-2 py-0.5 rounded';
      case 'MACLAB':
        return 'text-purple-900 font-bold bg-purple-100 border border-purple-300 px-2 py-0.5 rounded';
      case 'CYBERLAB':
        return 'text-emerald-900 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded';
      case 'IOTLAB':
        return 'text-teal-900 font-bold bg-teal-100 border border-teal-300 px-2 py-0.5 rounded';
      default:
        return 'text-slate-800 font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border-2 border-slate-200 p-3.5 rounded-xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by tag, item name, model, serial #..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-700 focus:bg-white font-medium"
          />
        </div>

        {/* Category Segmented Controls (interactive functional buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg border border-slate-300">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white font-extrabold shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-semibold'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter & Add Asset Action */}
        <div className="flex items-center gap-2">
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

          <button
            onClick={onAddNewAsset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Asset</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-extrabold uppercase tracking-wider">
                <th className="px-4 py-3.5">Asset Tag</th>
                <th className="px-4 py-3.5">Item Name & Specs</th>
                <th className="px-3 py-3.5">Laboratory</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5 text-right">Available / Total</th>
                <th className="px-3 py-3.5">Cabinet / Shelf</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-600 bg-white">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Package className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                      <p className="text-sm font-bold text-slate-900">No assets match criteria</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search query, laboratory switch, or category filter.
                      </p>
                      <button
                        onClick={onAddNewAsset}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700 hover:underline font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register new asset
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
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Asset Tag */}
                      <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap text-xs">
                        {asset.assetTag}
                      </td>

                      {/* Item Name & Specs */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 max-w-sm truncate text-xs">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium flex items-center gap-2 mt-0.5 max-w-sm truncate">
                          {asset.brandModel && <span>{asset.brandModel}</span>}
                          {asset.brandModel && asset.specs && <span aria-hidden="true">·</span>}
                          {asset.specs && <span className="truncate">{asset.specs}</span>}
                        </div>
                      </td>

                      {/* Laboratory */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={getLabBadge(asset.lab)}>{asset.lab}</span>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 text-slate-700 font-semibold whitespace-nowrap">
                        {asset.category}
                      </td>

                      {/* Available / Total Quantities */}
                      <td className="px-3 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={`font-black ${
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

                      {/* Cabinet / Shelf */}
                      <td className="px-3 py-3 text-slate-800">
                        <div className="flex items-center gap-1 truncate max-w-[150px] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span className="truncate font-semibold" title={`${asset.storageLocation?.rackOrCabinet} - ${asset.storageLocation?.shelf}`}>
                            {asset.storageLocation?.rackOrCabinet || 'Depot'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate pl-4">
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
                          {/* Quick Dispense Action */}
                          <button
                            onClick={() => onQuickDispense(asset)}
                            disabled={!isAvailable}
                            title={isAvailable ? 'Dispense / Issue to Borrower' : 'All units currently issued'}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isAvailable
                                ? 'text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <HandCoins className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Print Asset Tag */}
                          <button
                            onClick={() => onPrintTag(asset)}
                            title="Generate & Print Physical Asset Tag"
                            className="p-1.5 text-blue-800 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Edit Asset */}
                          <button
                            onClick={() => onEditAsset(asset)}
                            title="Edit Asset Details"
                            className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Asset */}
                          <button
                            onClick={() => onDeleteAsset(asset.id, asset.name)}
                            title="Delete or Archive Asset"
                            className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
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
        <div className="px-4 py-3 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div>
            Showing <span className="font-bold text-slate-950">{assets.length}</span> asset entries
            {currentLab !== 'ALL' && ` in ${currentLab}`}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Total Units:{' '}
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
    </div>
  );
};
