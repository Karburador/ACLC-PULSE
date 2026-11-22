import React, { useState, useEffect, useRef } from 'react';
import { Asset, AssetCategory, AssetStatus, Laboratory } from '../../types';
import { DEFAULT_STORAGE_LAYOUTS } from '../../data/storageLayouts';
import {
  X,
  Save,
  AlertCircle,
  Sparkles,
  Monitor,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<void>;
  assetToEdit?: Asset | null;
  assetToClone?: Asset | null;
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

function defaultStorageForLab(labCode: string) {
  const labLayout = DEFAULT_STORAGE_LAYOUTS.find(
    (l) => l.lab.toUpperCase() === labCode.toUpperCase()
  );
  return {
    rackOrCabinet: labLayout?.cabinets[0]?.name.split(' (')[0] || 'Long Table 1',
    shelf: labCode.toUpperCase() === 'COMLAB' ? 'Under Table (CPU Bay)' : 'Under Table / Direct',
    slot: labCode.toUpperCase() === 'COMLAB' ? 'Set 1 of 7' : 'Bay 1',
  };
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  assetToClone,
  defaultLab = 'COMLAB',
  laboratories = [],
  existingAssets = [],
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

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
    storageLocation: defaultStorageForLab(defaultLab),
    monitorInfo: { brandModel: '', serialNumber: '', specs: '' },
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTagManual, setIsTagManual] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [customStockEdited, setCustomStockEdited] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (assetToEdit) {
      setIsTagManual(true);
      const hasMonitorData = Boolean(
        assetToEdit.monitorInfo?.brandModel ||
          assetToEdit.monitorInfo?.serialNumber ||
          assetToEdit.monitorInfo?.specs
      );
      const hasExtraDetails = Boolean(
        assetToEdit.brandModel ||
          assetToEdit.serialNumber ||
          assetToEdit.specs ||
          assetToEdit.notes ||
          (assetToEdit.unit && assetToEdit.unit !== 'units') ||
          assetToEdit.availableQuantity !== assetToEdit.quantity
      );
      setShowMonitor(assetToEdit.category === 'Computers' && hasMonitorData);
      setShowDetails(hasExtraDetails);
      setCustomStockEdited(assetToEdit.availableQuantity !== assetToEdit.quantity);
      setFormData({
        ...assetToEdit,
        storageLocation: assetToEdit.storageLocation || defaultStorageForLab(assetToEdit.lab || 'COMLAB'),
        monitorInfo: assetToEdit.monitorInfo || {
          brandModel: '',
          serialNumber: '',
          specs: '',
        },
      });
    } else if (assetToClone) {
      setIsTagManual(false);
      const targetLab = assetToClone.lab || defaultLab || 'COMLAB';
      const targetCategory = assetToClone.category || 'Computers';
      const generatedTag = generateSequentialTag(targetLab, targetCategory, existingAssets);
      const hasMonitorData = Boolean(
        assetToClone.monitorInfo?.brandModel ||
          assetToClone.monitorInfo?.specs
      );
      const hasExtraDetails = Boolean(
        assetToClone.brandModel ||
          assetToClone.specs ||
          assetToClone.notes ||
          (assetToClone.unit && assetToClone.unit !== 'units')
      );
      setShowMonitor(targetCategory === 'Computers' && hasMonitorData);
      setShowDetails(hasExtraDetails);
      setCustomStockEdited(false);
      const qty = Math.max(1, assetToClone.quantity || 1);
      setFormData({
        assetTag: generatedTag,
        name: assetToClone.name || '',
        category: targetCategory,
        lab: targetLab,
        status: 'Available',
        quantity: qty,
        availableQuantity: qty,
        unit: assetToClone.unit || 'units',
        brandModel: assetToClone.brandModel || '',
        serialNumber: '',
        specs: assetToClone.specs || '',
        storageLocation: assetToClone.storageLocation || defaultStorageForLab(targetLab),
        monitorInfo: {
          brandModel: assetToClone.monitorInfo?.brandModel || '',
          serialNumber: '',
          specs: assetToClone.monitorInfo?.specs || '',
        },
        notes: assetToClone.notes || '',
      });
    } else {
      setIsTagManual(false);
      setShowMonitor(false);
      setShowDetails(false);
      setCustomStockEdited(false);
      const targetLab = defaultLab === 'ALL' ? (laboratories[0]?.code || 'COMLAB') : defaultLab;
      const initialCategory: AssetCategory = 'Computers';
      const generatedTag = generateSequentialTag(targetLab, initialCategory, existingAssets);
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
        storageLocation: defaultStorageForLab(targetLab),
        monitorInfo: {
          brandModel: '',
          serialNumber: '',
          specs: '',
        },
        notes: '',
      });
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetToEdit, assetToClone, defaultLab, isOpen]);

  if (!isOpen) return null;

  const saveAsset = async (keepOpenForNext: boolean) => {
    if (!formData.name?.trim()) {
      setError('Asset / Item Name is required.');
      nameInputRef.current?.focus();
      return;
    }
    if (!formData.assetTag?.trim()) {
      setError('Asset Tag is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const qty = Math.max(0, Number(formData.quantity) || 0);
      const avail = customStockEdited
        ? Math.max(0, Math.min(qty, Number(formData.availableQuantity) || 0))
        : qty;

      const monBrand = formData.monitorInfo?.brandModel?.trim() || '';
      const monSerial = formData.monitorInfo?.serialNumber?.trim() || '';
      const monSpecs = formData.monitorInfo?.specs?.trim() || '';
      const hasMonitor =
        formData.category === 'Computers' &&
        showMonitor &&
        Boolean(monBrand || monSerial || monSpecs);

      const cleanTag = formData.assetTag.trim().toUpperCase();
      const targetLab = formData.lab || 'COMLAB';
      const targetCategory = (formData.category as AssetCategory) || 'Computers';

      const normalizedData: Partial<Asset> = {
        ...formData,
        assetTag: cleanTag,
        name: formData.name.trim(),
        quantity: qty,
        availableQuantity: avail,
        unit: formData.unit?.trim() || 'units',
        storageLocation: {
          rackOrCabinet: formData.storageLocation?.rackOrCabinet?.trim() || 'Long Table 1',
          shelf: formData.storageLocation?.shelf?.trim() || 'Under Table (No Shelf)',
          slot: formData.storageLocation?.slot?.trim() || '',
        },
        monitorInfo: hasMonitor
          ? {
              brandModel: monBrand,
              serialNumber: monSerial,
              specs: monSpecs,
            }
          : assetToEdit
          ? {}
          : undefined,
      };

      await onSave(normalizedData);

      if (keepOpenForNext && !assetToEdit) {
        const updatedAssetList = [...existingAssets, { assetTag: cleanTag } as Asset];
        const nextTag = generateSequentialTag(targetLab, targetCategory, updatedAssetList);
        setIsTagManual(false);
        setCustomStockEdited(false);
        setFormData((prev) => ({
          ...prev,
          assetTag: nextTag,
          name: '',
          quantity: 1,
          availableQuantity: 1,
          serialNumber: '',
          monitorInfo: {
            brandModel: prev.monitorInfo?.brandModel || '',
            serialNumber: '',
            specs: prev.monitorInfo?.specs || '',
          },
          notes: '',
        }));
        setTimeout(() => nameInputRef.current?.focus(), 40);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAsset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 border-b-2 border-slate-200 text-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC Seal"
              className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border-2 border-blue-900 shrink-0 shadow-2xs"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-blue-950 leading-tight">
                {assetToEdit
                  ? 'Edit Laboratory Asset'
                  : assetToClone
                  ? 'Duplicate Asset'
                  : 'Quick Add Asset'}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                {assetToEdit
                  ? 'Update item details below'
                  : assetToClone
                  ? `Cloned from ${assetToClone.assetTag} with next auto-tag ready`
                  : 'Enter item name, lab & category — extra details are optional'}
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
          <div className="mx-4 sm:mx-5 mt-3 px-3 py-2 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-4 space-y-3 overflow-y-auto text-slate-900 flex-1">
          {/* Essential Row 1: Item Name + Auto Asset Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-8">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Asset / Item Name *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                autoFocus={!assetToEdit}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dell OptiPlex PC 01, Cisco Router, Crimping Tool"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-4">
              <div className="flex items-center justify-between mb-1">
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
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Essential Row 2: Lab, Category, Qty, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
            <div className="col-span-1 sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Laboratory *
              </label>
              <select
                value={formData.lab}
                onChange={(e) => {
                  const nextLab = e.target.value;
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
                      ? defaultStorageForLab(nextLab)
                      : prev.storageLocation,
                  }));
                }}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                {laboratories.length > 0 ? (
                  laboratories.map((lab) => (
                    <option key={lab.code} value={lab.code}>
                      {lab.code}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="COMLAB">COMLAB</option>
                    <option value="NETLAB">NETLAB</option>
                    <option value="TESDA">TESDA</option>
                  </>
                )}
              </select>
            </div>

            <div className="col-span-1 sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Computers">Computers &amp; Servers</option>
                <option value="Routers">Routers &amp; Switches</option>
                <option value="Tools">Tools &amp; Meters</option>
                <option value="Projectors">Projectors &amp; Displays</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Consumables">Consumables</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Qty *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity ?? 1}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setFormData((prev) => ({
                    ...prev,
                    quantity: val,
                    availableQuantity: customStockEdited
                      ? Math.min(val, prev.availableQuantity ?? val)
                      : val,
                  }));
                }}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="col-span-1 sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Optional Toggles Bar (Monitor for Computers + More Details) */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {formData.category === 'Computers' && (
              <button
                type="button"
                onClick={() => setShowMonitor((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                  showMonitor
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 hover:bg-emerald-50/70 border-slate-300 text-slate-700'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                <span>{showMonitor ? 'Paired Monitor Included' : '+ Add Paired Monitor'}</span>
                {showMonitor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                showDetails
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <span>{showDetails ? 'Hide Extra Details' : '+ Brand, Serial, Specs & Notes'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expandable Paired Monitor Section (Computers only) */}
          {formData.category === 'Computers' && showMonitor && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide">
                  <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                  Paired Monitor (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => setShowMonitor(false)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Collapse
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.monitorInfo?.brandModel || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monitorInfo: { ...formData.monitorInfo, brandModel: e.target.value },
                    })
                  }
                  placeholder="Monitor Brand (e.g. Dell 24&quot;)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="text"
                  value={formData.monitorInfo?.serialNumber || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monitorInfo: { ...formData.monitorInfo, serialNumber: e.target.value },
                    })
                  }
                  placeholder="Monitor Serial (MON-SN-001)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="text"
                  value={formData.monitorInfo?.specs || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monitorInfo: { ...formData.monitorInfo, specs: e.target.value },
                    })
                  }
                  placeholder="Size / Specs (24&quot; 1080p)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Expandable Optional Details Section */}
          {showDetails && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Brand &amp; Model
                  </label>
                  <input
                    type="text"
                    value={formData.brandModel || ''}
                    onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                    placeholder="e.g. Dell OptiPlex 7090"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Serial Number / Service Tag
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Manufacturer serial"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Technical Specs
                  </label>
                  <input
                    type="text"
                    value={formData.specs || ''}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    placeholder="e.g. Core i7, 16GB RAM, 512GB SSD"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.quantity ?? 0}
                    value={formData.availableQuantity ?? 1}
                    onChange={(e) => {
                      setCustomStockEdited(true);
                      setFormData({
                        ...formData,
                        availableQuantity: parseInt(e.target.value, 10) || 0,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit || 'units'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="units"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional inspection notes..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {!assetToEdit && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => saveAsset(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Save &amp; Add Next</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : assetToEdit ? 'Save Changes' : 'Save Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
