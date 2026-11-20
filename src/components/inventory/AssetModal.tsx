import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetCategory, AssetStatus, Laboratory } from '../../types';
import { DEFAULT_STORAGE_LAYOUTS } from '../../data/storageLayouts';
import { X, Save, AlertCircle, MapPin, Sparkles } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<void>;
  assetToEdit?: Asset | null;
  defaultLab?: string;
  laboratories?: Laboratory[];
  existingAssets?: Asset[];
}

const CATEGORY_TAG_CODES: Record<AssetCategory, string> = {
  Computers: 'PC',
  Routers: 'RT',
  Tools: 'TL',
  Projectors: 'PJ',
  Peripherals: 'PR',
  Consumables: 'CS',
};

function generateSequentialTag(
  labCode: string,
  category: AssetCategory,
  existingAssets: Asset[]
): string {
  const labPrefix = (labCode || 'COM').replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase() || 'COM';
  const catCode = CATEGORY_TAG_CODES[category] || 'AS';
  const basePrefix = `ACLC-${labPrefix}-${catCode}`;
  const regex = new RegExp(`^${basePrefix}(\\d+)$`, 'i');

  let maxNum = 0;
  for (const item of existingAssets) {
    const match = (item.assetTag || '').trim().match(regex);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxNum) maxNum = n;
    }
  }

  let next = maxNum + 1;
  const usedTags = new Set(existingAssets.map((a) => (a.assetTag || '').trim().toUpperCase()));
  while (usedTags.has(`${basePrefix}${String(next).padStart(2, '0')}`)) {
    next += 1;
  }

  return `${basePrefix}${String(next).padStart(2, '0')}`;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  defaultLab = 'COMLAB',
  laboratories = [],
  existingAssets = [],
}) => {
  const [formData, setFormData] = useState<Partial<Asset>>({
    assetTag: '',
    name: '',
    category: 'Computers',
    lab: defaultLab,
    status: 'Available',
    quantity: 1,
    availableQuantity: 1,
    unit: 'units',
    brandModel: '',
    serialNumber: '',
    specs: '',
    storageLocation: {
      rackOrCabinet: 'Cabinet COM-A',
      shelf: 'Shelf 1',
      slot: 'Bay 1',
    },
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTagManual, setIsTagManual] = useState(false);

  useEffect(() => {
    if (assetToEdit) {
      setIsTagManual(true);
      setFormData({
        ...assetToEdit,
        storageLocation: assetToEdit.storageLocation || {
          rackOrCabinet: '',
          shelf: '',
          slot: '',
        },
      });
    } else {
      setIsTagManual(false);
      const targetLab = defaultLab === 'ALL' ? (laboratories[0]?.code || 'COMLAB') : defaultLab;
      const initialCategory: AssetCategory = 'Computers';
      const generatedTag = generateSequentialTag(targetLab, initialCategory, existingAssets);
      const labLayout = DEFAULT_STORAGE_LAYOUTS.find(
        (l) => l.lab.toUpperCase() === targetLab.toUpperCase()
      );
      setFormData({
        assetTag: generatedTag,
        name: '',
        category: initialCategory,
        lab: targetLab,
        status: 'Available',
        quantity: 1,
        availableQuantity: 1,
        unit: 'units',
        brandModel: '',
        serialNumber: '',
        specs: '',
        storageLocation: {
          rackOrCabinet: labLayout?.cabinets[0]?.name.split(' (')[0] || `Long Table 1`,
          shelf: targetLab.toUpperCase() === 'COMLAB' ? 'Under Table (CPU Bay)' : 'Under Table / Direct',
          slot: targetLab.toUpperCase() === 'COMLAB' ? 'Set 1 of 7' : 'Bay 1',
        },
        notes: '',
      });
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetToEdit, defaultLab, isOpen]);

  const activeLabLayout = useMemo(() => {
    const code = (formData.lab || defaultLab || 'COMLAB').toUpperCase();
    return DEFAULT_STORAGE_LAYOUTS.find((l) => l.lab.toUpperCase() === code);
  }, [formData.lab, defaultLab]);

  const cabinetSuggestions = useMemo(() => {
    if (!activeLabLayout) return [`Cabinet ${(formData.lab || 'LAB').toUpperCase()}-A`];
    return activeLabLayout.cabinets.map((c) => c.name);
  }, [activeLabLayout, formData.lab]);

  const shelfSuggestions = useMemo(() => {
    const commonPositions = [
      'Under Table (CPU Bay)',
      'Tabletop (Monitor & Peripherals)',
      'No Shelf / Floor Level',
    ];
    if (!activeLabLayout) return commonPositions;
    const layoutLevels = activeLabLayout.cabinets.flatMap((c) => c.shelves.map((s) => s.label));
    return Array.from(new Set([...commonPositions, ...layoutLevels]));
  }, [activeLabLayout]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Item name is required');
      return;
    }
    if (!formData.assetTag?.trim()) {
      setError('Asset tag identifier is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const normalizedData: Partial<Asset> = {
        ...formData,
        storageLocation: {
          rackOrCabinet: formData.storageLocation?.rackOrCabinet?.trim() || 'Long Table 1',
          shelf: formData.storageLocation?.shelf?.trim() || 'Under Table (No Shelf)',
          slot: formData.storageLocation?.slot?.trim() || '',
        },
      };
      await onSave(normalizedData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50 border-b-2 border-slate-200 text-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC Seal"
              className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border-2 border-blue-900 shrink-0 shadow-2xs"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-blue-950 leading-tight">
                {assetToEdit ? 'Edit Laboratory Asset' : 'Add New Laboratory Asset'}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                ACLC College of Manila · ACLC-Pulse Inventory Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-5 mt-2.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-3.5 space-y-2.5 overflow-y-auto text-slate-900 flex-1">
          {/* Row 1: Asset Tag, Item Name, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-4">
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Asset Tag *
                </label>
                {!assetToEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTagManual(false);
                      const nextTag = generateSequentialTag(
                        formData.lab || 'COMLAB',
                        (formData.category as AssetCategory) || 'Computers',
                        existingAssets
                      );
                      setFormData((prev) => ({ ...prev, assetTag: nextTag }));
                    }}
                    title="Auto-generate next sequential tag"
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 hover:text-blue-950 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Auto
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={formData.assetTag || ''}
                onChange={(e) => {
                  setIsTagManual(true);
                  setFormData({ ...formData, assetTag: e.target.value.toUpperCase() });
                }}
                placeholder="ACLC-COM-PC01"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Asset / Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dell OptiPlex 7090 Desktop Workstation"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Row 2: Lab, Category, Quantity/Available/Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Laboratory *
              </label>
              <select
                value={formData.lab}
                onChange={(e) => {
                  const nextLab = e.target.value;
                  const nextLayout = DEFAULT_STORAGE_LAYOUTS.find(
                    (l) => l.lab.toUpperCase() === nextLab.toUpperCase()
                  );
                  const nextTag =
                    !assetToEdit && !isTagManual
                      ? generateSequentialTag(
                          nextLab,
                          (formData.category as AssetCategory) || 'Computers',
                          existingAssets
                        )
                      : formData.assetTag;
                  setFormData((prev) => ({
                    ...prev,
                    lab: nextLab,
                    assetTag: nextTag,
                    storageLocation: !assetToEdit
                      ? {
                          rackOrCabinet:
                            nextLayout?.cabinets[0]?.name.split(' (')[0] ||
                            `Cabinet ${nextLab}-A`,
                          shelf:
                            nextLab.toUpperCase() === 'COMLAB'
                              ? 'Under Table (CPU Bay)'
                              : 'Under Table / Direct',
                          slot:
                            nextLab.toUpperCase() === 'COMLAB' ? 'Set 1 of 7' : 'Bay 1',
                        }
                      : prev.storageLocation,
                  }));
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                {laboratories.length > 0 ? (
                  laboratories.map((lab) => (
                    <option key={lab.code} value={lab.code}>
                      {lab.code} ({lab.roomNumber})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="COMLAB">COMLAB (Room 304)</option>
                    <option value="NETLAB">NETLAB (Room 306)</option>
                    <option value="TESDA">TESDA (Room 208)</option>
                  </>
                )}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const nextCat = e.target.value as AssetCategory;
                  const nextTag =
                    !assetToEdit && !isTagManual
                      ? generateSequentialTag(
                          formData.lab || 'COMLAB',
                          nextCat,
                          existingAssets
                        )
                      : formData.assetTag;
                  setFormData((prev) => ({
                    ...prev,
                    category: nextCat,
                    assetTag: nextTag,
                  }));
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Computers">Computers & Servers</option>
                <option value="Routers">Routers & Switches</option>
                <option value="Tools">Tools & Meters</option>
                <option value="Projectors">Projectors & Displays</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Consumables">Consumables</option>
              </select>
            </div>

            <div className="sm:col-span-4 grid grid-cols-3 gap-1.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Qty *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      quantity: val,
                      availableQuantity: Math.min(val, formData.availableQuantity || val),
                    });
                  }}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Stock</label>
                <input
                  type="number"
                  min="0"
                  max={formData.quantity || 0}
                  value={formData.availableQuantity || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Unit</label>
                <input
                  type="text"
                  value={formData.unit || 'units'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="units"
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Brand & Model + Serial Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Brand & Model
              </label>
              <input
                type="text"
                value={formData.brandModel || ''}
                onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                placeholder="e.g. Cisco ISR 2911 / Hakko FX-888D"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Serial Number / Service Tag
              </label>
              <input
                type="text"
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Manufacturer serial / Service Tag"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 4: Compact Placement / Storage Mapping */}
          <div className="px-3 py-2 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-900 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                Table / Placement Location
              </span>
              <span className="text-[10px] font-medium text-slate-600">
                Works for long lab tables (no shelf) or cabinets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Table / Row / Cabinet *</label>
                <input
                  type="text"
                  required
                  list="asset-cabinet-suggestions"
                  value={formData.storageLocation?.rackOrCabinet || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageLocation: {
                        ...formData.storageLocation!,
                        rackOrCabinet: e.target.value,
                      },
                    })
                  }
                  placeholder="Long Table 1 (7 Computer Sets)"
                  className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
                <datalist id="asset-cabinet-suggestions">
                  {cabinetSuggestions.map((cab) => (
                    <option key={cab} value={cab} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Position (Optional)</label>
                <input
                  type="text"
                  list="asset-shelf-suggestions"
                  value={formData.storageLocation?.shelf || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageLocation: {
                        ...formData.storageLocation!,
                        shelf: e.target.value,
                      },
                    })
                  }
                  placeholder="Under Table / Tabletop / No Shelf"
                  className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
                <datalist id="asset-shelf-suggestions">
                  {shelfSuggestions.map((shelf) => (
                    <option key={shelf} value={shelf} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">PC Seat / Bay (Optional)</label>
                <input
                  type="text"
                  value={formData.storageLocation?.slot || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageLocation: {
                        ...formData.storageLocation!,
                        slot: e.target.value,
                      },
                    })
                  }
                  placeholder="Set 1 of 7 / PC-03"
                  className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Technical Specs & Notes side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Technical Specifications
              </label>
              <input
                type="text"
                value={formData.specs || ''}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                placeholder="e.g. Core i7, 16GB RAM, 512GB SSD"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Custodian Remarks / Notes
              </label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Inspection notes or loan conditions..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Compact Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : assetToEdit ? 'Save Changes' : 'Create Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
