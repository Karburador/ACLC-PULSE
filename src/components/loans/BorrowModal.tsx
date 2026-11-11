import React, { useState, useEffect } from 'react';
import { Asset, LoanRecord } from '../../types';
import { X, HandCoins, AlertCircle } from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueLoan: (loanData: Partial<LoanRecord>) => Promise<void>;
  availableAssets: Asset[];
  preselectedAsset?: Asset | null;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  isOpen,
  onClose,
  onIssueLoan,
  availableAssets,
  preselectedAsset,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerIdNumber, setBorrowerIdNumber] = useState('');
  const [borrowerRole, setBorrowerRole] = useState<'Student' | 'Faculty' | 'Staff' | 'TESDA Scholar'>('Student');
  const [departmentSection, setDepartmentSection] = useState('BSCS-3A');
  const [quantity, setQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [issuedBy, setIssuedBy] = useState('Lab Custodian');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedAsset) {
      setSelectedAssetId(preselectedAsset.id);
    } else if (availableAssets.length > 0 && !selectedAssetId) {
      const firstAvail = availableAssets.find((a) => (a.availableQuantity || 0) > 0) || availableAssets[0];
      setSelectedAssetId(firstAvail.id);
    }

    const d = new Date();
    d.setDate(d.getDate() + 1);
    setExpectedReturnDate(d.toISOString().split('T')[0]);
    setError(null);
  }, [preselectedAsset, availableAssets, isOpen]);

  if (!isOpen) return null;

  const currentAsset = availableAssets.find((a) => a.id === selectedAssetId);
  const maxAvailable = currentAsset ? currentAsset.availableQuantity || 0 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError('Please select an item to issue');
      return;
    }
    if (!borrowerName.trim()) {
      setError('Borrower name is required');
      return;
    }
    if (!borrowerIdNumber.trim()) {
      setError('Student or Employee ID is required');
      return;
    }
    if (quantity > maxAvailable) {
      setError(`Cannot issue ${quantity} units. Only ${maxAvailable} available in stock.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onIssueLoan({
        assetId: selectedAssetId,
        borrowerName: borrowerName.trim(),
        borrowerIdNumber: borrowerIdNumber.trim(),
        borrowerRole,
        departmentSection: departmentSection.trim(),
        quantity,
        dateBorrowed: new Date().toISOString().split('T')[0],
        expectedReturnDate,
        purpose: purpose.trim() || 'Laboratory Practical Coursework',
        issuedBy: issuedBy.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b-2 border-slate-300 text-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC Seal"
              className="w-9 sm:w-10 h-9 sm:h-10 object-contain rounded-full bg-white p-0.5 border-2 border-blue-900 shrink-0 shadow-xs"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold font-kabel tracking-tight text-blue-950">Issue & Dispense Asset</h2>
              <p className="text-[11px] sm:text-xs text-slate-600 font-kabel tracking-wide font-medium">ACLC College of Manila · ACLC-Pulse Dispensing</p>
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
          {/* Target Asset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Item / Equipment to Issue *
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                setQuantity(1);
              }}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              {availableAssets.map((asset) => {
                const avail = asset.availableQuantity || 0;
                return (
                  <option
                    key={asset.id}
                    value={asset.id}
                    disabled={avail <= 0}
                    className="bg-white text-slate-900"
                  >
                    [{asset.lab}] {asset.assetTag} - {asset.name} ({avail} of {asset.quantity} {asset.unit || 'units'} available)
                  </option>
                );
              })}
            </select>
          </div>

          {currentAsset && (
            <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-medium">Location: <strong>{currentAsset.storageLocation?.rackOrCabinet} ({currentAsset.storageLocation?.shelf})</strong></span>
                <span className="font-mono text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {maxAvailable} {currentAsset.unit || 'units'} In Stock
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Category: {currentAsset.category} · Lab: {currentAsset.lab}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity to Dispense *
            </label>
            <input
              type="number"
              min="1"
              max={Math.max(1, maxAvailable)}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Borrower Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Borrower Full Name *
              </label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student / Employee ID # *
              </label>
              <input
                type="text"
                required
                value={borrowerIdNumber}
                onChange={(e) => setBorrowerIdNumber(e.target.value)}
                placeholder="e.g. 2024-MNL-0198"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Role & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Borrower Role *
              </label>
              <select
                value={borrowerRole}
                onChange={(e) => setBorrowerRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="Student">Student</option>
                <option value="TESDA Scholar">TESDA Scholar (NC II)</option>
                <option value="Faculty">Faculty Instructor</option>
                <option value="Staff">Lab Assistant / Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department / Section *
              </label>
              <input
                type="text"
                required
                value={departmentSection}
                onChange={(e) => setDepartmentSection(e.target.value)}
                placeholder="e.g. BSCS-3A, ACT-2B, TVET-CSS"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Return Date & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Return Date *
              </label>
              <input
                type="date"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorizing Custodian
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="Lab Custodian Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purpose / Course Subject *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Networking Lab Practicum #3 / Capstone Defense"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
            />
          </div>

          {/* Submit */}
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
              disabled={isSubmitting || maxAvailable <= 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <HandCoins className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Recording Loan...' : 'Authorize & Dispense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
