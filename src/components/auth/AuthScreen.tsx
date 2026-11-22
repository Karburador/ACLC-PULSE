import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';

interface AuthScreenProps {
  pendingVerificationUser: User | null;
  onVerificationConfirmed: () => void;
  onSignOut: () => Promise<void>;
}

type AuthMode = 'signin' | 'signup' | 'reset';

function mapFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console. Use the 1-Click Gmail Sign-In button above, or enable Email/Password under Firebase Console → Authentication → Sign-in method.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Switch to Sign In instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not yet in Firebase Authorized Domains. Add "${host}" once in Firebase Console → Authentication → Settings → Authorized domains.`;
    }
    case 'auth/popup-closed-by-user':
      return 'Gmail sign-in window was closed before finishing. Click the button again to choose your Gmail account.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Gmail sign-in popup. Please allow popups for this site and click again.';
    default:
      return err?.message || 'Sign-in failed. Please try again.';
  }
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  pendingVerificationUser,
  onVerificationConfirmed,
  onSignOut,
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      setInfoMessage(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    if (mode === 'reset') {
      try {
        setLoading(true);
        await sendPasswordResetEmail(auth, trimmedEmail);
        setInfoMessage(
          `Password reset link sent to ${trimmedEmail}. Check your inbox (and spam folder).`
        );
      } catch (err: any) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your name or custodian role.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Verification screen offers resend button if initial send throttles
        }
      }
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!auth.currentUser) return;
    try {
      setCheckingVerification(true);
      setError(null);
      setInfoMessage(null);
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      if (auth.currentUser.emailVerified) {
        onVerificationConfirmed();
      } else {
        setError(
          'Your email is not verified yet. Please click the verification link sent to your inbox, then press this button again.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to check verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      setResendingVerification(true);
      setError(null);
      await sendEmailVerification(auth.currentUser);
      setInfoMessage(
        `A fresh verification link was sent to ${auth.currentUser.email}. Check your inbox or spam folder.`
      );
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setResendingVerification(false);
    }
  };

  // Pending Email Verification Gate (only if someone creates a non-Google email/password account)
  if (pendingVerificationUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC College of Manila Seal"
              className="w-14 h-14 object-contain rounded-full bg-white p-1 border-2 border-blue-900 shrink-0 shadow-xs"
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
                Custodian Account Verification
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-950">
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Verify Your Email to Activate Workspace</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              We sent a verification link to{' '}
              <strong className="font-mono break-all">{pendingVerificationUser.email}</strong>.
              Open the link in your inbox, then click <strong>I&apos;ve Verified — Continue</strong>.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              onClick={handleCheckVerified}
              disabled={checkingVerification}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checkingVerification ? 'animate-spin' : ''}`} />
              <span>
                {checkingVerification ? 'Checking Status...' : "I've Verified — Continue"}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {resendingVerification ? 'Sending...' : 'Resend Email'}
              </button>
              <button
                onClick={onSignOut}
                className="py-2 px-3 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-6 sm:p-7 space-y-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/aistudio/ACLC_3c4418b0.png"
            alt="ACLC College of Manila Seal"
            className="w-14 h-14 object-contain rounded-full bg-white p-1 border-2 border-blue-900 shrink-0 shadow-xs"
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

        {/* Multi-Custodian Private Workspace Highlight */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950">
            <Users className="w-4 h-4 text-blue-700 shrink-0" />
            <span>1-Click Gmail Login · Private Per-Custodian Space</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Sign in with any Gmail account in 1 click. Each Lab Custodian gets their own separate inventory, labs, loans, and QR tags—no data mixing across different Gmail accounts.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Primary 1-Click Gmail Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-3"
        >
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
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
          Always shows the Gmail account selector so another Lab Custodian can pick or add their own Gmail account anytime.
        </p>

        {/* Collapsible Email & Password Option */}
        <div className="pt-1 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowEmailForm((prev) => !prev)}
            className="w-full py-1.5 text-[11px] font-bold text-slate-600 hover:text-blue-900 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Or use custom Email &amp; Password</span>
            {showEmailForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEmailForm && (
            <div className="mt-3 space-y-3">
              {mode !== 'reset' ? (
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'signin'
                        ? 'bg-white text-blue-950 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'signup'
                        ? 'bg-white text-blue-950 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                    <KeyRound className="w-4 h-4 text-blue-700" />
                    <span>Reset Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Custodian Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="custodian@aclc-manila.edu.ph"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Password *</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('reset');
                            setError(null);
                            setInfoMessage(null);
                          }}
                          className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {loading
                      ? 'Please wait...'
                      : mode === 'signin'
                      ? 'Sign In with Email'
                      : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
