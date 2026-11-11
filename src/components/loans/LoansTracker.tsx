import React, { useState } from 'react';
import { LoanRecord, LabType } from '../../types';
import {
  HandCoins,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  User,
  Clock,
  Filter,
  Check,
  Building2,
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

  const today = new Date().toISOString().split('T')[0];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Phase 2: Dispensing Hub
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Borrower Tracking & Circulation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Equipment Borrowing & Dispensing Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time custody tracking across students, faculty, and TESDA scholars with auto-return stock restoration.
          </p>
        </div>

        <button
          onClick={onOpenIssueModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <HandCoins className="w-4 h-4 stroke-[2.5]" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Filter and Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search borrower name, student ID, item tag, or section..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 md:col-span-2 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-blue-900/60 text-amber-300 border border-blue-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Loans ({loans.length})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-blue-900/60 text-cyan-300 border border-blue-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('Overdue')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'Overdue'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setStatusFilter('Returned')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'Returned'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Returned ({returnedCount})
          </button>
        </div>
      </div>

      {/* Return Confirmation Popover / Modal */}
      {returningId && (
        <div className="p-4 bg-slate-900 border border-amber-500/40 rounded-xl shadow-lg space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <RotateCcw className="w-4 h-4" />
              <span>Confirm Item Return & Inventory Restock</span>
            </div>
            <button
              onClick={() => setReturningId(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Accepting this return will automatically restore the borrowed quantity to available inventory for that item.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Inspection note: e.g. Checked by Custodian; cable and connectors intact"
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleConfirmReturn(returningId)}
              disabled={isProcessing}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {isProcessing ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Borrower & Section</th>
                <th className="px-4 py-3">Borrowed Equipment</th>
                <th className="px-3 py-3">Lab</th>
                <th className="px-3 py-3 text-right">Qty</th>
                <th className="px-3 py-3">Date Issued</th>
                <th className="px-3 py-3">Expected Return</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileCheck2 className="w-8 h-8 text-slate-500 mx-auto stroke-1" />
                      <p className="text-sm font-medium text-slate-300">No loan records match</p>
                      <p className="text-xs text-slate-400">
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
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Borrower */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{loan.borrowerName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({loan.borrowerRole})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {loan.borrowerIdNumber} · {loan.departmentSection}
                        </div>
                      </td>

                      {/* Equipment */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{loan.assetName}</div>
                        <div className="text-[11px] text-amber-400 font-mono">
                          {loan.assetTag}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5" title={loan.purpose}>
                          Purpose: {loan.purpose}
                        </div>
                      </td>

                      {/* Lab */}
                      <td className="px-3 py-3 font-medium whitespace-nowrap text-slate-300">
                        {loan.lab}
                      </td>

                      {/* Quantity */}
                      <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-white">
                        {loan.quantity}
                      </td>

                      {/* Date Issued */}
                      <td className="px-3 py-3 text-slate-300 font-mono whitespace-nowrap">
                        {loan.dateBorrowed}
                      </td>

                      {/* Expected Return */}
                      <td className="px-3 py-3 font-mono whitespace-nowrap">
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                          {isOverdue && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                          <span>{loan.expectedReturnDate}</span>
                        </div>
                        {isReturned && loan.dateReturned && (
                          <div className="text-[10px] text-emerald-400">
                            Returned {loan.dateReturned}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {isOverdue ? (
                          <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>OVERDUE</span>
                          </div>
                        ) : isReturned ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Returned</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-cyan-400 font-medium text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <span>Active Loan</span>
                          </div>
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
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-md transition-colors cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                            <span>Return Item</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
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
