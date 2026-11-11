import React, { useState, useEffect } from 'react';
import { Asset, LoanRecord } from '../../types';
import { X, HandCoins, AlertCircle, Calendar, User, Hash, FileText } from 'lucide-react';

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

    // Default expected return date: tomorrow
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Issue & Dispense Asset</h2>
              <p className="text-xs text-slate-400">ACLC College of Manila · Laboratory Dispensing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Asset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Item / Equipment to Issue *
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                setQuantity(1);
              }}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {availableAssets.map((asset) => {
                const avail = asset.availableQuantity || 0;
                return (
                  <option
                    key={asset.id}
                    value={asset.id}
                    disabled={avail <= 0}
                    className="bg-slate-900 text-white"
                  >
                    [{asset.lab}] {asset.assetTag} - {asset.name} ({avail} of {asset.quantity} {asset.unit || 'units'} available)
                  </option>
                );
              })}
            </select>
          </div>

          {currentAsset && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Location: {currentAsset.storageLocation?.rackOrCabinet} ({currentAsset.storageLocation?.shelf})</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {maxAvailable} {currentAsset.unit || 'units'} In Stock
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Category: {currentAsset.category} · Lab: {currentAsset.lab}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity to Dispense *
            </label>
            <input
              type="number"
              min="1"
              max={Math.max(1, maxAvailable)}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Borrower Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Borrower Full Name *
              </label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student / Employee ID # *
              </label>
              <input
                type="text"
                required
                value={borrowerIdNumber}
                onChange={(e) => setBorrowerIdNumber(e.target.value)}
                placeholder="e.g. 2024-MNL-0198"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Role & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Borrower Role *
              </label>
              <select
                value={borrowerRole}
                onChange={(e) => setBorrowerRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Student">Student</option>
                <option value="TESDA Scholar">TESDA Scholar (NC II)</option>
                <option value="Faculty">Faculty Instructor</option>
                <option value="Staff">Lab Assistant / Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department / Section *
              </label>
              <input
                type="text"
                required
                value={departmentSection}
                onChange={(e) => setDepartmentSection(e.target.value)}
                placeholder="e.g. BSCS-3A, ACT-2B, TVET-CSS"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Return Date & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expected Return Date *
              </label>
              <input
                type="date"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorizing Custodian
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="Lab Custodian Name"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Purpose / Course Subject *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Networking Lab Practicum #3 / Capstone Defense"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || maxAvailable <= 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
