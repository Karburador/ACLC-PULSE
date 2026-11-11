import React, { useState } from 'react';
import { LoanRecord, LabType } from '../../types';
import {
  HandCoins,
  Search,
  RotateCcw,
  AlertTriangle,
  Check,
  FileCheck2
} from 'lucide-react';

interface LoansTrackerProps {
  loans: LoanRecord[];
  currentLab: LabType;
  onReturnItem: (id: string, notes?: string) => Promise<void>;
  onOpenIssueModal: () => void;
}

export const LoansTracker: React.FC<LoansTrackerProps> = ({
  loans,
  currentLab,
  onReturnItem,
  onOpenIssueModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Overdue' | 'Returned'>('ALL');
  const [returningId, setReturningId] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredLoans = loans.filter((loan) => {
    if (statusFilter !== 'ALL' && loan.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        loan.borrowerName.toLowerCase().includes(q) ||
        loan.borrowerIdNumber.toLowerCase().includes(q) ||
        loan.assetName.toLowerCase().includes(q) ||
        loan.assetTag.toLowerCase().includes(q) ||
        loan.departmentSection.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeCount = loans.filter((l) => l.status === 'Active').length;
  const overdueCount = loans.filter((l) => l.status === 'Overdue').length;
  const returnedCount = loans.filter((l) => l.status === 'Returned').length;

  const handleConfirmReturn = async (id: string) => {
    try {
      setIsProcessing(true);
      await onReturnItem(id, returnNotes || 'Item returned in satisfactory condition.');
      setReturningId(null);
      setReturnNotes('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Phase 2: Dispensing Hub
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Borrower Tracking & Circulation</span>
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight">
            Equipment Borrowing & Dispensing Ledger
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-normal">
            Real-time custody tracking across students, faculty, and TESDA scholars with auto-return stock restoration.
          </p>
        </div>

        <button
          onClick={onOpenIssueModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <HandCoins className="w-4 h-4 stroke-[3]" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Filter and Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search borrower name, student ID, item tag, or section..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 font-medium shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 md:col-span-2 p-1 bg-white rounded-lg border border-slate-300 overflow-x-auto shadow-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-blue-700 text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            All ({loans.length})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-blue-900 text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('Overdue')}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'Overdue'
                ? 'bg-rose-700 text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setStatusFilter('Returned')}
            className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'Returned'
                ? 'bg-emerald-700 text-white font-extrabold shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            Returned ({returnedCount})
          </button>
        </div>
      </div>

      {/* Return Confirmation Popover / Modal */}
      {returningId && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl shadow-md space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 text-sm font-black">
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>Confirm Item Return & Inventory Restock</span>
            </div>
            <button
              onClick={() => setReturningId(null)}
              className="text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Accepting this return will automatically restore the borrowed quantity to available inventory for that item.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Inspection note: e.g. Checked by Custodian; cable and connectors intact"
              className="flex-1 px-3 py-2 bg-white border border-amber-400 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={() => handleConfirmReturn(returningId)}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              {isProcessing ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-extrabold uppercase tracking-wider">
                <th className="px-4 py-3.5">Borrower & Section</th>
                <th className="px-4 py-3.5">Borrowed Equipment</th>
                <th className="px-3 py-3.5">Lab</th>
                <th className="px-3 py-3.5 text-right">Qty</th>
                <th className="px-3 py-3.5">Date Issued</th>
                <th className="px-3 py-3.5">Expected Return</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-600 bg-white">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                      <p className="text-sm font-bold text-slate-900">No loan records match</p>
                      <p className="text-xs text-slate-500">
                        {statusFilter === 'Overdue'
                          ? 'No overdue loans! All items are accounted for or returned on schedule.'
                          : 'Issue a loan using the button above to begin tracking.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isOverdue = loan.status === 'Overdue';
                  const isReturned = loan.status === 'Returned';

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* Borrower */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{loan.borrowerName}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            ({loan.borrowerRole})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono font-medium mt-0.5">
                          {loan.borrowerIdNumber} · {loan.departmentSection}
                        </div>
                      </td>

                      {/* Equipment */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{loan.assetName}</div>
                        <div className="text-[11px] text-blue-900 font-mono font-bold">
                          {loan.assetTag}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5 font-medium" title={loan.purpose}>
                          Purpose: {loan.purpose}
                        </div>
                      </td>

                      {/* Lab */}
                      <td className="px-3 py-3 font-bold whitespace-nowrap text-slate-800">
                        {loan.lab}
                      </td>

                      {/* Quantity */}
                      <td className="px-3 py-3 text-right font-mono tabular-nums font-black text-slate-950 text-sm">
                        {loan.quantity}
                      </td>

                      {/* Date Issued */}
                      <td className="px-3 py-3 text-slate-700 font-mono font-semibold whitespace-nowrap">
                        {loan.dateBorrowed}
                      </td>

                      {/* Expected Return */}
                      <td className="px-3 py-3 font-mono whitespace-nowrap">
                        <div className={`flex items-center gap-1 font-bold ${isOverdue ? 'text-rose-700' : 'text-slate-800'}`}>
                          {isOverdue && <AlertTriangle className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                          <span>{loan.expectedReturnDate}</span>
                        </div>
                        {isReturned && loan.dateReturned && (
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            Returned {loan.dateReturned}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-900 font-extrabold text-xs bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            OVERDUE
                          </span>
                        ) : isReturned ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-900 font-bold text-xs bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Returned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-blue-900 font-bold text-xs bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            Active Loan
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {!isReturned ? (
                          <button
                            onClick={() => {
                              setReturningId(loan.id);
                              setReturnNotes('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-md transition-colors cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-3 h-3 stroke-[3]" />
                            <span>Return Item</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic font-medium">
                            {loan.returnedNotes || 'Restocked'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
