import React, { useMemo, useState } from 'react';
import {
  AuditLogEntry,
  AuthorizedCustodian,
  CustodianRole,
} from '../../types';
import { CAMPUS_ADMIN_EMAIL } from '../../services/firestoreSync';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  Ban,
  Shield,
} from 'lucide-react';

interface SecurityAuditViewProps {
  currentUserEmail: string;
  currentUserRole: CustodianRole;
  custodians: AuthorizedCustodian[];
  auditLogs: AuditLogEntry[];
  onAddCustodian: (input: {
    email: string;
    displayName: string;
    role: CustodianRole;
    notes?: string;
  }) => Promise<void>;
  onUpdateCustodian: (
    email: string,
    updates: { displayName?: string; role?: CustodianRole; active?: boolean; notes?: string }
  ) => Promise<void>;
  onRemoveCustodian: (email: string) => Promise<void>;
}

const ACTION_LABELS: Record<string, string> = {
  ASSET_CREATE: 'Asset Created',
  ASSET_UPDATE: 'Asset Updated',
  ASSET_DELETE: 'Asset Deleted',
  LOAN_ISSUE: 'Item Issued',
  LOAN_RETURN: 'Item Returned',
  MAINT_CREATE: 'Ticket Logged',
  MAINT_UPDATE: 'Ticket Updated',
  MAINT_DELETE: 'Ticket Deleted',
  LAB_CREATE: 'Lab Created',
  LAB_UPDATE: 'Lab Updated',
  LAB_DELETE: 'Lab Deleted',
  CUSTODIAN_ADD: 'Custodian Added',
  CUSTODIAN_UPDATE: 'Access Updated',
  CUSTODIAN_REMOVE: 'Access Revoked',
  CATALOG_WIPE_ZERO: 'Reset to 0',
  CATALOG_RESTORE_DEFAULT: 'Defaults Restored',
};

function formatAuditTime(ts: any): string {
  if (!ts) return 'Just now';
  try {
    const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return date.toLocaleString('en-PH', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recorded';
  }
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({
  currentUserEmail,
  currentUserRole,
  custodians,
  auditLogs,
  onAddCustodian,
  onUpdateCustodian,
  onRemoveCustodian,
}) => {
  const isAdmin = currentUserRole === 'Admin';

  // Add Custodian form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<CustodianRole>('Custodian');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audit Log filter state
  const [logSearch, setLogSearch] = useState('');
  const [logScope, setLogScope] = useState<'all' | 'asset' | 'loan' | 'maintenance' | 'laboratory' | 'custodian' | 'system'>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((entry) => {
      if (logScope !== 'all' && entry.targetType !== logScope) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        return (
          entry.actorEmail.toLowerCase().includes(q) ||
          entry.actorName.toLowerCase().includes(q) ||
          entry.targetLabel.toLowerCase().includes(q) ||
          entry.details.toLowerCase().includes(q) ||
          (entry.lab && entry.lab.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [auditLogs, logScope, logSearch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      setSubmitting(true);
      setFeedback(null);
      await onAddCustodian({
        email: newEmail.trim().toLowerCase(),
        displayName: newName.trim() || newEmail.trim().split('@')[0],
        role: newRole,
        notes: newNotes.trim() || undefined,
      });
      setFeedback({
        type: 'success',
        text: `Authorized ${newEmail.trim().toLowerCase()} as ${newRole}. They can now sign in with Gmail.`,
      });
      setNewEmail('');
      setNewName('');
      setNewNotes('');
      setNewRole('Custodian');
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to add custodian.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleToggle = async (c: AuthorizedCustodian) => {
    const nextRole: CustodianRole = c.role === 'Admin' ? 'Custodian' : 'Admin';
    try {
      setBusyEmail(c.email);
      setFeedback(null);
      await onUpdateCustodian(c.email, { role: nextRole });
      setFeedback({ type: 'success', text: `Updated ${c.email} to ${nextRole}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Role update failed.' });
    } finally {
      setBusyEmail(null);
    }
  };

  const handleActiveToggle = async (c: AuthorizedCustodian) => {
    try {
      setBusyEmail(c.email);
      setFeedback(null);
      await onUpdateCustodian(c.email, { active: !c.active });
      setFeedback({
        type: 'success',
        text: c.active ? `Suspended access for ${c.email}.` : `Restored access for ${c.email}.`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Status update failed.' });
    } finally {
      setBusyEmail(null);
    }
  };

  const handleRemove = async (c: AuthorizedCustodian) => {
    try {
      setBusyEmail(c.email);
      setFeedback(null);
      await onRemoveCustodian(c.email);
      setFeedback({ type: 'success', text: `Removed ${c.email} from authorized roster.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to remove account.' });
    } finally {
      setBusyEmail(null);
    }
  };

  const scopeTabs: { id: typeof logScope; label: string }[] = [
    { id: 'all', label: 'All Activity' },
    { id: 'asset', label: 'Inventory' },
    { id: 'loan', label: 'Loans' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'laboratory', label: 'Labs' },
    { id: 'custodian', label: 'Access' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Security &amp; Governance</span>
            <span aria-hidden="true">·</span>
            <span>Role: {currentUserRole}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{currentUserEmail}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 text-balance">
            Custodian Access &amp; Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Database access is enforced at the Firebase server level: only listed Gmail custodians may read or write records, destructive deletes and resets are locked to Admins, and every action writes an immutable audit log.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium shrink-0">
          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Allowlist Enforced</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
            <Lock className="w-3.5 h-3.5 text-blue-700" />
            <span>Admin-Only Deletes</span>
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Section 1: Custodian Roster Management */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-blue-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Authorized Custodian Roster
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'Add or manage verified Gmail accounts permitted to sign in to the shared campus database.'
                  : `Managed by Head Administrator (${CAMPUS_ADMIN_EMAIL}).`}
              </p>
            </div>
          </div>

          {isAdmin && (
            <span className="text-xs font-mono tabular-nums text-slate-600">
              {custodians.filter((c) => c.active).length} active · {custodians.length} total
            </span>
          )}
        </div>

        {!isAdmin ? (
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">
                Signed in with Custodian clearance ({currentUserEmail})
              </p>
              <p className="text-slate-600">
                You can register and update assets, issue/return loans, and manage maintenance tickets. Deleting records, wiping the catalog, and managing user access are restricted to Admins.
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Admin Contact: {CAMPUS_ADMIN_EMAIL}</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {/* Add Gmail Custodian Form */}
            <form onSubmit={handleAdd} className="p-5 bg-slate-50/60 space-y-3">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                <span>Authorize New Gmail / Google Workspace Account</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gmail / Google Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. labstaff.aclc@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Engr. M. Santos"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as CustodianRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-700 cursor-pointer"
                  >
                    <option value="Custodian">Custodian</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {submitting ? 'Authorizing...' : 'Authorize Account'}
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional note (e.g. COMLAB & NETLAB student assistant, morning shift)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-700"
                />
              </div>
            </form>

            {/* Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="px-5 py-3">Account</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {custodians.map((c) => {
                    const isHeadAdmin = c.email === CAMPUS_ADMIN_EMAIL.toLowerCase();
                    const isBusy = busyEmail === c.email;

                    return (
                      <tr key={c.email} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-950">{c.displayName}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{c.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-semibold ${c.role === 'Admin' ? 'text-blue-800' : 'text-slate-700'}`}>
                            {isHeadAdmin ? 'Head Admin' : c.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-semibold ${c.active ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {c.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                          {c.notes || (isHeadAdmin ? 'Primary campus owner' : 'Standard lab access')}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          {isHeadAdmin ? (
                            <span className="text-[11px] text-slate-400 font-medium">Protected</span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRoleToggle(c)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 hover:bg-slate-100 rounded-md cursor-pointer disabled:opacity-50"
                              >
                                {c.role === 'Admin' ? 'Set Custodian' : 'Promote Admin'}
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleActiveToggle(c)}
                                className={`px-2.5 py-1 text-xs font-semibold border rounded-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 ${
                                  c.active
                                    ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                                    : 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                                }`}
                              >
                                <Ban className="w-3 h-3" />
                                <span>{c.active ? 'Suspend' : 'Activate'}</span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRemove(c)}
                                title={`Remove ${c.email}`}
                                className="p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Immutable Audit Trail */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-blue-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Immutable Activity &amp; Audit Trail ({filteredLogs.length})
              </h2>
              <p className="text-xs text-slate-500">
                Append-only server-timestamped record of all inventory, loan, maintenance, and access changes.
              </p>
            </div>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Filter by email, asset tag, action..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
            />
          </div>
        </div>

        {/* Scope Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {scopeTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLogScope(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                logScope === tab.id
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit events recorded yet for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="px-5 py-2.5 whitespace-nowrap">Timestamp</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Actor</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Action</th>
                  <th className="px-4 py-2.5">Target &amp; Scope</th>
                  <th className="px-5 py-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-mono tabular-nums text-slate-500 whitespace-nowrap text-[11px]">
                      {formatAuditTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{log.actorEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">
                      {ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{log.targetLabel}</div>
                      {log.lab && (
                        <div className="text-[11px] font-mono text-blue-800">{log.lab}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
