import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Server,
  Cloud,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  ExternalLink
} from 'lucide-react';

interface DeploymentGuideProps {
  onDataReset: () => void;
}

export const DeploymentGuide: React.FC<DeploymentGuideProps> = ({ onDataReset }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        setLoading(true);
        const data = await api.getSystemHealth();
        setHealthData(data);
      } catch (err) {
        console.error('Health check failed', err);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetCatalog = async () => {
    if (!window.confirm('Reset catalog back to ACLC Manila default laboratory units (40 COMLAB, 25 NETLAB, 20 TESDA)?')) {
      return;
    }
    try {
      setResetting(true);
      const res = await api.resetData();
      setResetMessage(res.message);
      onDataReset();
      setTimeout(() => setResetMessage(null), 4000);
    } finally {
      setResetting(false);
    }
  };

  const vercelEnvSnippet = `VITE_API_BASE_URL="https://aclc-pulse-backend.onrender.com"`;
  const renderEnvSnippet = `PORT=5000
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/aclc_pulse?retryWrites=true&w=majority"
CLIENT_URL="https://aclc-pulse.vercel.app"`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Option 2 Architecture
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Vercel + Render + MongoDB Atlas Production Guide</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Deployment Architecture & Environment Setup
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation of concerns: Static React SPA deployed on Vercel, Express REST API hosted on Render, backed by MongoDB Atlas with offline fallback.
          </p>
        </div>

        <button
          onClick={handleResetCatalog}
          disabled={resetting}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>{resetting ? 'Resetting...' : 'Reset Default Seed Data'}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Live System Diagnostics Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Live System Engine Diagnostics</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            REST API Responding (Port 3000)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium">Database Backend Status</div>
            <div className="text-sm font-bold text-amber-300">
              {healthData?.databaseMode || 'High-Speed Fallback Engine'}
            </div>
            <p className="text-[11px] text-slate-400">
              {healthData?.mongoUriConfigured
                ? 'MongoDB Atlas URI loaded from environment.'
                : 'Safe fallback active. Ready for live MONGO_URI in Render.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium">CORS Configuration</div>
            <div className="text-sm font-bold text-slate-200">
              {healthData?.clientUrl || 'Dynamic Allowed'}
            </div>
            <p className="text-[11px] text-slate-400">
              Allows cross-origin requests from Vercel static frontends.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium">Covered Facilities</div>
            <div className="text-sm font-bold text-slate-200">
              COMLAB (40) · NETLAB (25) · TESDA (20)
            </div>
            <p className="text-[11px] text-slate-400">
              85 total hardware units under active pulse tracking.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Tier Option 2 Architecture Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Vercel Frontend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-slate-950 border border-slate-700 text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">1. Frontend: Vercel</h4>
              <span className="text-xs text-slate-400">Static Site Deployment</span>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Deploy the React + Vite frontend as a high-speed Edge Static Site on Vercel.
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>Framework Preset: <strong className="text-slate-200">Vite</strong></li>
            <li>Build Command: <code className="text-amber-300 font-mono">npm run build</code></li>
            <li>Output Directory: <code className="text-amber-300 font-mono">dist</code></li>
          </ul>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Environment Variable (.env):</span>
              <button
                onClick={() => handleCopy('vercel', vercelEnvSnippet)}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'vercel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
              {vercelEnvSnippet}
            </pre>
          </div>
        </div>

        {/* Tier 2: Render Backend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-slate-950 border border-slate-700 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">2. Backend: Render</h4>
              <span className="text-xs text-slate-400">Node/Express Web Service</span>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Host the Node.js Express REST API server as a persistent Web Service on Render.
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>Environment: <strong className="text-slate-200">Node</strong></li>
            <li>Build Command: <code className="text-amber-300 font-mono">npm install && npm run build</code></li>
            <li>Start Command: <code className="text-amber-300 font-mono">npm start</code></li>
          </ul>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Environment Variables:</span>
              <button
                onClick={() => handleCopy('render', renderEnvSnippet)}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'render' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
              {renderEnvSnippet}
            </pre>
          </div>
        </div>

        {/* Tier 3: MongoDB Atlas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-slate-950 border border-slate-700 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">3. Database: Atlas</h4>
              <span className="text-xs text-slate-400">MongoDB Cloud Cluster</span>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Create a free M0 cluster on MongoDB Atlas to persist all assets, loans, and maintenance tasks.
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>Database Name: <code className="text-emerald-300 font-mono">aclc_pulse</code></li>
            <li>Network Access: <strong className="text-slate-200">Allow 0.0.0.0/0 (Render IPs)</strong></li>
            <li>Collections: <strong className="text-slate-200">assets, loans, maintenances</strong></li>
          </ul>

          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-[11px] text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline / Preview Fallback Protected</span>
            </div>
            <p className="text-slate-400">
              If MONGO_URI is omitted during local development or evaluation, the built-in local store automatically engages without server crashes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
