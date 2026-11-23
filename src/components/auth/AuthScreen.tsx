import React, { useState } from 'react';
import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { CAMPUS_ADMIN_EMAIL } from '../../services/firestoreSync';
import {
  AlertCircle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface AuthScreenProps {
  pendingVerificationUser: User | null;
  unauthorizedUser?: {
    email: string;
    displayName?: string | null;
    inactive?: boolean;
  } | null;
  recheckingAccess?: boolean;
  onRecheckAccess?: () => Promise<void>;
  onVerificationConfirmed: () => void;
  onSignOut: () => Promise<void>;
}

function mapFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not yet in Firebase Authorized Domains. Add "${host}" once in Firebase Console → Authentication → Settings → Authorized domains.`;
    }
    case 'auth/popup-closed-by-user':
      return 'Gmail sign-in window was closed before finishing. Click the button again to choose your Gmail account.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Gmail sign-in popup. Please allow popups for this site and click again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    default:
      return err?.message || 'Gmail sign-in failed. Please try again.';
  }
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  pendingVerificationUser,
  unauthorizedUser,
  recheckingAccess = false,
  onRecheckAccess,
  onVerificationConfirmed,
  onSignOut,
}) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!auth.currentUser) return;
    try {
      setCheckingVerification(true);
      setError(null);
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      if (auth.currentUser.emailVerified) {
        onVerificationConfirmed();
      } else {
        setError('Please sign in with a verified Gmail account to continue.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to verify account status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  if (unauthorizedUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC College of Manila Seal"
              className="w-14 h-14 object-contain rounded-full bg-white p-1 border-2 border-blue-900 shrink-0"
            />
            <div>
              <h1 className="font-kabel text-2xl font-bold text-blue-950 tracking-normal">
                ACLC-Pulse
              </h1>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Custodian Allowlist Protection
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {unauthorizedUser.inactive
                  ? 'Custodian Access Suspended'
                  : 'Gmail Account Pending Admin Approval'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Signed in as <strong className="font-mono text-slate-950">{unauthorizedUser.email}</strong>.
              {unauthorizedUser.inactive
                ? ' This account is currently suspended in the ACLC-Pulse Custodian Roster.'
                : ' For campus data protection, only approved Gmail accounts can access the shared laboratory inventory.'}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Ask the Head Campus Admin (<strong className="font-mono text-slate-900">{CAMPUS_ADMIN_EMAIL}</strong>) to authorize your email under <strong>Security &amp; Audit → Custodian Roster</strong>, then click Check Approval.
          </p>

          <div className="flex items-center gap-2">
            {onRecheckAccess && (
              <button
                type="button"
                onClick={onRecheckAccess}
                disabled={recheckingAccess}
                className="flex-1 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${recheckingAccess ? 'animate-spin' : ''}`} />
                <span>{recheckingAccess ? 'Checking...' : 'Check Approval'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="py-2.5 px-4 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Gmail</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pendingVerificationUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC College of Manila Seal"
              className="w-14 h-14 object-contain rounded-full bg-white p-1 border-2 border-blue-900 shrink-0"
            />
            <div>
              <h1 className="font-kabel text-2xl font-bold text-blue-950 tracking-normal">
                ACLC-Pulse
              </h1>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                ACLC College of Manila · Account Verification
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-700 leading-relaxed">
            Account <strong className="font-mono">{pendingVerificationUser.email}</strong> needs a verified email, or switch to a Gmail account via 1-click sign-in.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckVerified}
              disabled={checkingVerification}
              className="flex-1 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checkingVerification ? 'animate-spin' : ''}`} />
              <span>{checkingVerification ? 'Checking...' : 'Check Status'}</span>
            </button>
            <button
              onClick={onSignOut}
              className="py-2.5 px-4 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Gmail</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-7 space-y-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/aistudio/ACLC_3c4418b0.png"
            alt="ACLC College of Manila Seal"
            className="w-14 h-14 object-contain rounded-full bg-white p-1 border-2 border-blue-900 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-kabel text-2xl font-bold text-blue-950 tracking-normal">
                ACLC-Pulse
              </h1>
              <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                MANILA
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Laboratory Asset &amp; Inventory Hub
            </p>
          </div>
        </div>

        {/* Shared Single Campus Database + Allowlist Info */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>1-Click Gmail Login · Protected Campus Database</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Authorized ACLC Lab Custodians connect to the single shared campus database with role-based permissions and an immutable audit trail.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary 1-Click Gmail Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-3"
        >
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 1.77 14.96.8 12 .8 7.62.8 3.84 3.31 2.01 6.97l3.67 2.84C6.55 7.21 9.05 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.04 12.26c0-.81-.07-1.59-.21-2.34H12v4.43h6.19c-.27 1.43-1.08 2.64-2.3 3.45l3.54 2.75c2.07-1.91 3.61-4.72 3.61-8.29z"
              />
              <path
                fill="#FBBC05"
                d="M5.68 14.19A6.97 6.97 0 0 1 5.31 12c0-.76.13-1.5.37-2.19L2.01 6.97A11.17 11.17 0 0 0 .8 12c0 1.81.43 3.52 1.21 5.03l3.67-2.84z"
              />
              <path
                fill="#34A853"
                d="M12 23.2c3.24 0 5.96-1.07 7.95-2.9l-3.54-2.75c-1.07.72-2.44 1.15-4.41 1.15-2.95 0-5.45-2.17-6.32-4.77l-3.67 2.84C3.84 20.69 7.62 23.2 12 23.2z"
              />
            </svg>
          </span>
          <span>{googleLoading ? 'Opening Gmail Picker...' : 'Sign in with Gmail (1-Click)'}</span>
        </button>

        <p className="text-[11px] text-center text-slate-500 font-medium leading-relaxed">
          Displays the Gmail account chooser. New staff emails must be approved by the Head Admin before accessing campus records.
        </p>
      </div>
    </div>
  );
};
