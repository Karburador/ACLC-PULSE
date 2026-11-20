import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class FirebaseErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let readable = error.message || 'An unexpected cloud synchronization error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error) {
        readable = `Cloud Sync Error (${parsed.operationType} on ${parsed.path || 'database'}): ${parsed.error}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
          <div className="max-w-lg w-full bg-white border-2 border-rose-300 rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950">Cloud Sync Error</h2>
                <p className="text-xs text-slate-600 font-medium">ACLC-Pulse Real-Time Database</p>
              </div>
            </div>
            <p className="text-xs text-rose-900 bg-rose-50 border border-rose-200 rounded-lg p-3 font-mono break-words">
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
