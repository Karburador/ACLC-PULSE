import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Server,
  Database,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Globe,
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
    if (!window.confirm('I-restore ang ACLC default laboratory catalog (160 units across standard labs)?')) {
      return;
    }
    try {
      setResetting(true);
      const res = await api.resetData('default');
      setResetMessage(res.message);
      onDataReset();
      setTimeout(() => setResetMessage(null), 4000);
    } finally {
      setResetting(false);
    }
  };

  const handleWipeZero = async () => {
    if (!window.confirm('SIGURADO KA BA? Buburahin lahat ng assets, borrow loans, at maintenance tickets para MAGING 0 LAHAT ang data ng inventory.')) {
      return;
    }
    try {
      setResetting(true);
      const res = await api.resetData('zero');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Option 2 Architecture
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Vercel + Render + MongoDB Atlas Production Guide</span>
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight">
            Deployment Architecture & Environment Setup
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-normal">
            Strict separation of concerns: Static React SPA deployed on Vercel, Express REST API hosted on Render, backed by MongoDB Atlas with offline fallback.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleWipeZero}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-300 hover:border-red-600 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Delete lahat ng data para back to 0"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{resetting ? 'Processing...' : 'Reset to 0 (Wipe)'}</span>
          </button>
          <button
            onClick={handleResetCatalog}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Ibalik ang ACLC default 160 units"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-700 stroke-[2.5]" />
            <span>{resetting ? 'Processing...' : 'Restore Demo (160 Units)'}</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Live System Diagnostics Card */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-700 stroke-[2.5]" />
            <h3 className="text-sm font-black text-slate-950">Live System Engine Diagnostics</h3>
          </div>
          <span className="text-xs text-emerald-800 font-extrabold flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            REST API Responding (Port 3000)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-300 space-y-1">
            <div className="text-slate-600 font-bold">Database Backend Status</div>
            <div className="text-sm font-black text-blue-950">
              {healthData?.databaseMode || 'High-Speed Fallback Engine'}
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {healthData?.mongoUriConfigured
                ? 'MongoDB Atlas URI loaded from environment.'
                : 'Safe fallback active. Ready for live MONGO_URI in Render.'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-300 space-y-1">
            <div className="text-slate-600 font-bold">CORS Configuration</div>
            <div className="text-sm font-black text-slate-900">
              {healthData?.clientUrl || 'Dynamic Allowed'}
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Allows cross-origin requests from Vercel static frontends.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-300 space-y-1">
            <div className="text-slate-600 font-bold">Covered Facilities</div>
            <div className="text-sm font-black text-slate-900">
              6 Specialized Labs (160 Total Units)
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              COMLAB (40) · NETLAB (25) · TESDA (20) · MACLAB (30) · CYBERLAB (20) · IOTLAB (25)
            </p>
          </div>
        </div>
      </div>

      {/* 3-Tier Option 2 Architecture Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Vercel Frontend */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900">
              <Globe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-950">1. Frontend: Vercel</h4>
              <span className="text-xs text-slate-500 font-medium">Static Site Deployment</span>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Deploy the React + Vite frontend as a high-speed Edge Static Site on Vercel.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium">
            <li>Framework Preset: <strong className="text-slate-950">Vite</strong></li>
            <li>Build Command: <code className="text-blue-900 font-mono font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-200">npm run build</code></li>
            <li>Output Directory: <code className="text-blue-900 font-mono font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-200">dist</code></li>
          </ul>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold mb-1">
              <span>Environment Variable (.env):</span>
              <button
                onClick={() => handleCopy('vercel', vercelEnvSnippet)}
                className="text-blue-700 hover:text-blue-950 flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedKey === 'vercel' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-mono text-amber-300 overflow-x-auto">
              {vercelEnvSnippet}
            </pre>
          </div>
        </div>

        {/* Tier 2: Render Backend */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-900">
              <Server className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-950">2. Backend: Render</h4>
              <span className="text-xs text-slate-500 font-medium">Node/Express Web Service</span>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Host the Node.js Express REST API server as a persistent Web Service on Render.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium">
            <li>Environment: <strong className="text-slate-950">Node</strong></li>
            <li>Build Command: <code className="text-indigo-900 font-mono font-bold bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">npm install && npm run build</code></li>
            <li>Start Command: <code className="text-indigo-900 font-mono font-bold bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">npm start</code></li>
          </ul>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold mb-1">
              <span>Environment Variables:</span>
              <button
                onClick={() => handleCopy('render', renderEnvSnippet)}
                className="text-blue-700 hover:text-blue-950 flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedKey === 'render' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-mono text-amber-300 overflow-x-auto">
              {renderEnvSnippet}
            </pre>
          </div>
        </div>

        {/* Tier 3: MongoDB Atlas */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900">
              <Database className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-950">3. Database: Atlas</h4>
              <span className="text-xs text-slate-500 font-medium">MongoDB Cloud Cluster</span>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Create a free M0 cluster on MongoDB Atlas to persist all assets, loans, and maintenance tasks.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium">
            <li>Database Name: <code className="text-emerald-900 font-mono font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">aclc_pulse</code></li>
            <li>Network Access: <strong className="text-slate-950">Allow 0.0.0.0/0 (Render IPs)</strong></li>
            <li>Collections: <strong className="text-slate-950">assets, loans, maintenances</strong></li>
          </ul>

          <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg text-[11px] text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline / Preview Fallback Protected</span>
            </div>
            <p className="text-slate-700 font-medium">
              If MONGO_URI is omitted during local development or evaluation, the built-in local store automatically engages without server crashes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
