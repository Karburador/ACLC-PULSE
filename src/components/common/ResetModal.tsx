import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Package,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToZero: () => Promise<void>;
  onRestoreDefaults: () => Promise<void>;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onResetToZero,
  onRestoreDefaults,
}) => {
  const [selectedMode, setSelectedMode] = useState<'zero' | 'default'>('zero');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedMode === 'zero') {
        if (confirmText.trim().toLowerCase() !== 'delete') {
          setError('Please type "delete" to confirm wiping all records to 0.');
          setLoading(false);
          return;
        }
        await onResetToZero();
      } else {
        await onRestoreDefaults();
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b-2 border-slate-300 text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-800 border border-rose-300">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-kabel tracking-tight text-slate-950">
                System Reset & Database Purge
              </h2>
              <p className="text-xs text-slate-600 font-kabel tracking-wide font-medium">
                ACLC College of Manila · Database Operations
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

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 space-y-4 text-slate-900">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Piliin kung nais mong i-delete ang lahat ng records pabalik sa <strong>0</strong> (malinis na sistema para sa totoong gamit ng eskwelahan), o i-restore ang opisyal na ACLC demo catalog:
          </p>

          <div className="space-y-3">
            {/* Option 1: Back to 0 */}
            <div
              onClick={() => setSelectedMode('zero')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedMode === 'zero'
                  ? 'border-rose-600 bg-rose-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="resetMode"
                  checked={selectedMode === 'zero'}
                  onChange={() => setSelectedMode('zero')}
                  className="mt-1 text-rose-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-700 stroke-[2.5]" />
                    <span className="text-sm font-bold text-slate-950">
                      Delete Lahat ng Data (Back to 0)
                    </span>
                    <span className="text-[10px] font-mono font-black uppercase text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                      Clean Slate
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Burahin ang lahat ng assets, active loans, at maintenance tickets. Magiging <strong>0 items</strong> ang database para makapag-input ka ng sariling mga totoong equipment ng ACLC.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Restore Default Demo Catalog */}
            <div
              onClick={() => setSelectedMode('default')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedMode === 'default'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="resetMode"
                  checked={selectedMode === 'default'}
                  onChange={() => setSelectedMode('default')}
                  className="mt-1 text-blue-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-700 stroke-[2.5]" />
                    <span className="text-sm font-bold text-slate-950">
                      Restore ACLC Default Catalog (160 Units)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    I-load muli ang sample 6 laboratories na may 160 core equipment units (Dell workstations, Cisco routers, iMacs, servers, at tools) para sa demonstration at testing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Input for Zero Wipe */}
          {selectedMode === 'zero' && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-lg space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-rose-950">
                Kumpirmahin ang pagbura: I-type ang salitang <strong className="underline font-mono">delete</strong> sa ibaba:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Type "delete" to confirm'
                className="w-full px-3 py-1.5 bg-white border border-rose-400 rounded text-xs font-mono font-bold text-rose-950 focus:outline-none focus:border-rose-600"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50 ${
              selectedMode === 'zero'
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white'
                : 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white'
            }`}
          >
            {loading
              ? 'Processing...'
              : selectedMode === 'zero'
              ? 'Yes, Delete All Data (Back to 0)'
              : 'Restore Demo Catalog'}
          </button>
        </div>
      </div>
    </div>
  );
};
