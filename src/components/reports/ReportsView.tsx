import React from 'react';
import { Asset, LoanRecord, MaintenanceTask, LabType } from '../../types';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Boxes,
  HandCoins,
  Wrench,
  GraduationCap
} from 'lucide-react';

interface ReportsViewProps {
  assets: Asset[];
  loans: LoanRecord[];
  maintenance: MaintenanceTask[];
  currentLab: LabType;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  assets,
  loans,
  maintenance,
  currentLab,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInventoryCsv = () => {
    window.open(api.getExportUrl('inventory', currentLab), '_blank');
  };

  const handleDownloadLoansCsv = () => {
    window.open(api.getExportUrl('borrowers', currentLab), '_blank');
  };

  const totalAssetsCount = assets.reduce((s, a) => s + (a.quantity || 1), 0);
  const availableCount = assets.reduce((s, a) => s + (a.availableQuantity || 0), 0);
  const inUseCount = totalAssetsCount - availableCount;
  const activeLoansCount = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue').length;
  const overdueCount = loans.filter((l) => l.status === 'Overdue').length;
  const completedMaint = maintenance.filter((m) => m.column === 'Replaced/Retired').length;

  return (
    <div className="space-y-6">
      {/* Print Stylesheet for Formal Report Document */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #formal-audit-report, #formal-audit-report * {
            visibility: visible;
          }
          #formal-audit-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #fff !important;
            color: #000 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Top Banner and Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Phase 5: Compliance & Auditing
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Formal Laboratory Registry & CSV Export</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Inventory & Dispensing Audit Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate printable laboratory compliance reports or export raw tabular datasets formatted for administrative records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadInventoryCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Inventory CSV</span>
          </button>
          <button
            onClick={handleDownloadLoansCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Loans CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Formal Audit</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Total Tracked Units</span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalAssetsCount}
          </div>
          <p className="text-[11px] text-slate-500">Across {assets.length} item lines</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Available In Stock</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {availableCount}
          </div>
          <p className="text-[11px] text-slate-500">Ready for class distribution</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Active / Overdue Loans</span>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {activeLoansCount}
          </div>
          <p className="text-[11px] text-slate-500">
            {overdueCount > 0 ? `${overdueCount} require urgent retrieval` : 'Zero overdue items'}
          </p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Maintenance Completed</span>
          <div className="text-2xl font-bold text-blue-400 font-mono tabular-nums">
            {completedMaint}
          </div>
          <p className="text-[11px] text-slate-500">Repaired & verified</p>
        </div>
      </div>

      {/* Formal Printable Audit Report Sheet Preview */}
      <div
        id="formal-audit-report"
        className="bg-white text-slate-900 p-8 rounded-xl border border-slate-300 shadow-xl space-y-6 max-w-4xl mx-auto"
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#0A2540] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#0A2540] text-amber-400 flex items-center justify-center font-bold text-lg">
              AP
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#0A2540]">
                ACLC COLLEGE OF MANILA
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                LABORATORY & FACILITIES INVENTORY AUDIT CERTIFICATE
              </p>
              <p className="text-[10px] text-slate-500">
                System: ACLC-Pulse Asset Management Engine · Manila Campus
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-[#0A2540]">
              Audit Scope: {currentLab === 'ALL' ? 'All Laboratories (85 Units)' : currentLab}
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
            </div>
          </div>
        </div>

        {/* Laboratory Status Summary Table */}
        <div>
          <h3 className="text-xs font-extrabold text-[#0A2540] uppercase tracking-wider mb-2">
            1. Current Laboratory Asset Summary
          </h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                <th className="p-2">Asset Tag</th>
                <th className="p-2">Item Description</th>
                <th className="p-2">Laboratory</th>
                <th className="p-2">Category</th>
                <th className="p-2 text-right">Available</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.slice(0, 10).map((a) => (
                <tr key={a.id} className="text-slate-800">
                  <td className="p-2 font-mono font-bold text-[#0A2540]">{a.assetTag}</td>
                  <td className="p-2 font-medium">{a.name}</td>
                  <td className="p-2">{a.lab}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2 text-right font-mono font-bold">{a.availableQuantity}</td>
                  <td className="p-2 text-right font-mono">{a.quantity}</td>
                  <td className="p-2">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length > 10 && (
            <p className="text-[10px] text-slate-500 italic mt-1">
              * Showing first 10 assets. Full dataset available in the CSV export.
            </p>
          )}
        </div>

        {/* Active Circulation / Loans Table */}
        <div>
          <h3 className="text-xs font-extrabold text-[#0A2540] uppercase tracking-wider mb-2">
            2. Active Equipment Circulation & Loans
          </h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                <th className="p-2">Borrower Name</th>
                <th className="p-2">ID Number</th>
                <th className="p-2">Section</th>
                <th className="p-2">Item Borrowed</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2">Expected Return</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loans.filter((l) => l.status !== 'Returned').map((l) => (
                <tr key={l.id} className="text-slate-800">
                  <td className="p-2 font-bold">{l.borrowerName}</td>
                  <td className="p-2 font-mono">{l.borrowerIdNumber}</td>
                  <td className="p-2">{l.departmentSection}</td>
                  <td className="p-2">{l.assetName} ({l.assetTag})</td>
                  <td className="p-2 text-right font-mono">{l.quantity}</td>
                  <td className="p-2 font-mono">{l.expectedReturnDate}</td>
                  <td className="p-2 font-bold">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off Section */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
              Engr. Michael Santos
            </div>
            <div className="text-[11px] text-slate-600">Chief Laboratory Custodian & Network Administrator</div>
            <div className="text-[10px] text-slate-400">ACLC College of Manila</div>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
              Dean, College of Computer Studies & TVET
            </div>
            <div className="text-[11px] text-slate-600">Academic & Facility Oversight Verification</div>
            <div className="text-[10px] text-slate-400">ACLC College of Manila</div>
          </div>
        </div>
      </div>
    </div>
  );
};
