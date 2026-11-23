import React, { useState } from 'react';
import { Laboratory } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Building,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ShieldAlert,
  Lock,
} from 'lucide-react';

interface LaboratoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  laboratories: Laboratory[];
  onAddLaboratory: (lab: { code: string; name: string; roomNumber: string; capacity: number; description?: string }) => Promise<void>;
  onUpdateLaboratory: (code: string, updates: Partial<Laboratory>) => Promise<void>;
  onDeleteLaboratory: (code: string) => Promise<{
    success: boolean;
    blocked?: boolean;
    assetCount?: number;
    loanCount?: number;
    maintenanceCount?: number;
    message?: string;
  }>;
  currentLab: string;
  onSelectLab: (code: string) => void;
  canDelete?: boolean;
}

export const LaboratoryModal: React.FC<LaboratoryModalProps> = ({
  isOpen,
  onClose,
  laboratories,
  onAddLaboratory,
  onUpdateLaboratory,
  onDeleteLaboratory,
  currentLab,
  onSelectLab,
  canDelete = true,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion confirmation & security block state
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);
  const [blockedInfo, setBlockedInfo] = useState<{
    code: string;
    assetCount: number;
    loanCount: number;
    maintenanceCount: number;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setCode('');
    setName('');
    setRoomNumber('');
    setCapacity(30);
    setDescription('');
    setIsAdding(false);
    setEditingCode(null);
    setError(null);
  };

  const handleStartEdit = (lab: Laboratory) => {
    setEditingCode(lab.code);
    setCode(lab.code);
    setName(lab.name);
    setRoomNumber(lab.roomNumber);
    setCapacity(lab.capacity);
    setDescription(lab.description || '');
    setIsAdding(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Laboratory code and full name are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingCode) {
        await onUpdateLaboratory(editingCode, {
          name: name.trim(),
          roomNumber: roomNumber.trim() || 'Campus Lab',
          capacity: Number(capacity) || 30,
          description: description.trim(),
        });
        setSuccessMessage(`Laboratory ${editingCode} updated successfully.`);
      } else {
        await onAddLaboratory({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          roomNumber: 'Campus Lab',
          capacity: Number(capacity) || 30,
          description: description.trim(),
        });
        setSuccessMessage(`Laboratory ${code.trim().toUpperCase()} added successfully.`);
      }

      resetForm();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to save laboratory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (labCode: string) => {
    try {
      setLoading(true);
      setError(null);
      setBlockedInfo(null);
      const res = await onDeleteLaboratory(labCode);

      if (!res.success && res.blocked) {
        setBlockedInfo({
          code: labCode,
          assetCount: res.assetCount || 0,
          loanCount: res.loanCount || 0,
          maintenanceCount: res.maintenanceCount || 0,
          message: res.message,
        });
        setConfirmDeleteCode(null);
        return;
      }

      if (!res.success) {
        setError(res.message || `Failed to delete laboratory ${labCode}.`);
        return;
      }

      setBlockedInfo(null);
      setConfirmDeleteCode(null);
      setSuccessMessage(res.message || `Laboratory ${labCode} removed.`);
      if (currentLab === labCode) {
        onSelectLab('ALL');
      }
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to delete laboratory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b-2 border-slate-300 text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-900 border border-blue-300">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-blue-950">
                Facility & Laboratory Management
              </h2>
              <p className="text-xs text-slate-600 tracking-wide font-medium">
                ACLC College of Manila · Add, configure, or delete academic laboratories
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

        {/* Alerts */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-emerald-900 text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Security Protection Block Alert */}
        {blockedInfo && (
          <div className="mx-5 mt-3 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-700 stroke-[2.5] shrink-0" />
                <span>Deletion Blocked: {blockedInfo.code} Contains Active Data</span>
              </div>
              <button
                onClick={() => setBlockedInfo(null)}
                className="text-xs font-bold text-rose-700 hover:text-rose-950 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-medium">
              For security and record protection, <strong>{blockedInfo.code}</strong> cannot be deleted while it still contains active records:{' '}
              <strong>
                {[
                  blockedInfo.assetCount > 0 ? `${blockedInfo.assetCount} asset(s)` : null,
                  blockedInfo.loanCount > 0 ? `${blockedInfo.loanCount} loan record(s)` : null,
                  blockedInfo.maintenanceCount > 0 ? `${blockedInfo.maintenanceCount} maintenance ticket(s)` : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </strong>.
            </p>
            <p className="text-[11px] text-rose-800">
              Please transfer the equipment to another laboratory or remove all associated records before deleting this facility.
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-900">
          {/* Action Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                Current Laboratories ({laboratories.length})
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                All facilities available across Inventory filters, storage maps, and loan issuance.
              </p>
            </div>

            {!isAdding && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Laboratory</span>
              </button>
            )}
          </div>

          {/* Add / Edit Laboratory Form */}
          {isAdding && (
            <form onSubmit={handleSave} className="p-4 bg-slate-50 border-2 border-blue-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  {editingCode ? `Edit Laboratory: ${editingCode}` : 'Create New Academic Laboratory'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lab Code ID *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCode}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="e.g. ROBOTICS, CHEMLAB"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-blue-950 focus:outline-none focus:border-blue-600 disabled:bg-slate-100"
                  />
                  <span className="text-[10px] text-slate-500">Short uppercase tag</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Laboratory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Advanced Robotics & Automation Lab"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Target Station Capacity (Units) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description / Primary Course Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Focus areas, workstation types, primary academic program (e.g. BSCS, BSIT)..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCode ? 'Update Laboratory' : 'Add Laboratory'}
                </button>
              </div>
            </form>
          )}

          {/* Laboratories List */}
          <div className="space-y-3">
            {laboratories.map((lab) => {
              const isSelected = currentLab === lab.code;
              const isConfirmingDelete = confirmDeleteCode === lab.code;
              const assetCount = lab.totalAssets || 0;
              const loanCount = lab.loanCount || 0;
              const maintenanceCount = lab.maintenanceCount || 0;
              const hasRecords = assetCount > 0 || loanCount > 0 || maintenanceCount > 0;

              return (
                <div
                  key={lab.code}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                        {lab.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-950 truncate">{lab.name}</h4>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                          Active Scope
                        </span>
                      )}
                      {hasRecords ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300"
                          title="Protected: Clear assets, loans, and repair tickets before deleting this lab"
                        >
                          <Lock className="w-2.5 h-2.5" /> Protected (Has Data)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Empty (Deletable)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
                      <span>Target Capacity: <strong className="text-slate-900">{lab.capacity} units</strong></span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono font-bold text-blue-900">
                        {assetCount} Asset SKUs ({lab.activeUnitsCount || 0} units)
                        {loanCount > 0 ? ` · ${loanCount} loans` : ''}
                        {maintenanceCount > 0 ? ` · ${maintenanceCount} tickets` : ''}
                      </span>
                    </div>

                    {lab.description && (
                      <p className="text-[11px] text-slate-500 font-normal line-clamp-1">{lab.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectLab(lab.code)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Set as Scope'}
                    </button>

                    <button
                      onClick={() => handleStartEdit(lab)}
                      title="Edit laboratory parameters"
                      className="p-1.5 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {hasRecords ? (
                      <button
                        onClick={() =>
                          setBlockedInfo({
                            code: lab.code,
                            assetCount,
                            loanCount,
                            maintenanceCount,
                          })
                        }
                        title={`Protected: Remove all ${assetCount} assets, ${loanCount} loans, and ${maintenanceCount} tickets first before deleting ${lab.code}`}
                        className="p-1.5 text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    ) : !canDelete ? (
                      <button
                        type="button"
                        disabled
                        title="Admin only: only Admins can remove laboratories"
                        className="p-1.5 text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed opacity-70"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    ) : isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-300">
                        <button
                          onClick={() => handleDelete(lab.code)}
                          disabled={loading}
                          className="px-2 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded cursor-pointer"
                        >
                          {loading ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteCode(null)}
                          disabled={loading}
                          className="px-1.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setBlockedInfo(null);
                          setError(null);
                          setConfirmDeleteCode(lab.code);
                        }}
                        title={`Delete empty laboratory ${lab.code}`}
                        className="p-1.5 text-rose-700 hover:text-rose-950 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>ACLC College of Manila Facilities Hub</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
