import React, { useState, useEffect } from 'react';
import { Asset, AssetCategory, AssetStatus, Laboratory } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<void>;
  assetToEdit?: Asset | null;
  defaultLab?: string;
  laboratories?: Laboratory[];
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  defaultLab = 'COMLAB',
  laboratories = [],
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
      slot: '',
    },
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        ...assetToEdit,
        storageLocation: assetToEdit.storageLocation || {
          rackOrCabinet: '',
          shelf: '',
          slot: '',
        },
      });
    } else {
      const tagPrefix =
        defaultLab === 'TESDA' ? 'TES' :
        defaultLab === 'NETLAB' ? 'NET' :
        defaultLab === 'MACLAB' ? 'MAC' :
        defaultLab === 'CYBERLAB' ? 'CYB' :
        defaultLab === 'IOTLAB' ? 'IOT' : 'COM';
      const generatedTag = `ACLC-${tagPrefix}-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        assetTag: generatedTag,
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
          rackOrCabinet:
            defaultLab === 'NETLAB' ? 'Server Rack 1' :
            defaultLab === 'TESDA' ? 'Cabinet TESDA-Tools' :
            defaultLab === 'MACLAB' ? 'Cabinet MAC-Secure' :
            defaultLab === 'CYBERLAB' ? 'Cyber Server Rack Alpha' :
            defaultLab === 'IOTLAB' ? 'Robotics Station A' : 'Cabinet COM-A',
          shelf: 'Shelf 1',
          slot: 'Bay 1',
        },
        notes: '',
      });
    }
    setError(null);
  }, [assetToEdit, defaultLab, isOpen]);

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
      await onSave(formData);
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b-2 border-slate-300 text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC Seal"
              className="w-9 sm:w-10 h-9 sm:h-10 object-contain rounded-full bg-white p-0.5 border-2 border-blue-900 shrink-0 shadow-xs"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold font-kabel tracking-tight text-blue-950">
                {assetToEdit ? 'Edit Laboratory Asset' : 'Add New Laboratory Asset'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 font-kabel tracking-wide font-medium">
                ACLC College of Manila · ACLC-Pulse Inventory Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-slate-900 flex-1">
          {/* Row 1: Asset Tag & Item Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asset Tag Code *
              </label>
              <input
                type="text"
                required
                value={formData.assetTag || ''}
                onChange={(e) => setFormData({ ...formData, assetTag: e.target.value.toUpperCase() })}
                placeholder="e.g. ACLC-COM-WS01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asset / Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dell OptiPlex 7090 Desktop Workstation"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Lab & Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Laboratory *
              </label>
              <select
                value={formData.lab}
                onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                {laboratories.length > 0 ? (
                  laboratories.map((lab) => (
                    <option key={lab.code} value={lab.code}>
                      {lab.code} ({lab.name} - {lab.roomNumber})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="COMLAB">COMLAB (Room 304)</option>
                    <option value="NETLAB">NETLAB (Room 306)</option>
                    <option value="TESDA">TESDA Hardware (Room 208)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asset Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Computers">Computers (Desktops, iMacs, Servers)</option>
                <option value="Routers">Routers & Switches (Cisco, Fortinet, MikroTik)</option>
                <option value="Tools">Tools (Fluke, Hakko, Multimeters, Toolkits)</option>
                <option value="Projectors">Projectors & Displays (Epson, ViewSonic)</option>
                <option value="Peripherals">Peripherals (Keyboards, Mice, Monitors, Cintiq)</option>
                <option value="Consumables">Consumables (Cables, Plugs, Solder, Thermal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operational Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Row 3: Quantities and Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Quantity *
              </label>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Available In Stock
              </label>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                value={formData.unit || 'units'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="units, pcs, boxes, reels"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 4: Hardware Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand & Model
              </label>
              <input
                type="text"
                value={formData.brandModel || ''}
                onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                placeholder="e.g. Cisco ISR 2911 / Hakko FX-888D"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Manufacturer serial / Service Tag"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 5: Storage Rack/Cabinet & Shelf Mapping */}
          <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-3">
            <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">
              Storage Mapping (Phase 3 Visualizer Ready)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rack / Cabinet</label>
                <input
                  type="text"
                  required
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
                  placeholder="e.g. Server Rack 1, Cabinet COM-B"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Shelf Tier</label>
                <input
                  type="text"
                  required
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
                  placeholder="e.g. Shelf 2, RU 14-24"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Slot / Bin</label>
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
                  placeholder="e.g. Bin 4, Station Desk"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Specs & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Technical Specifications
            </label>
            <input
              type="text"
              value={formData.specs || ''}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              placeholder="e.g. Intel Core i7, 16GB RAM, 512GB SSD, 1080p"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custodian Remarks / Maintenance Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Operational notes, inspection logs, or loan conditions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : assetToEdit ? 'Save Changes' : 'Create Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
