import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { Asset, LabType } from '../../types';
import { Printer, Check, Copy, Download, QrCode } from 'lucide-react';

interface AssetTagGeneratorProps {
  assets: Asset[];
  currentLab: LabType;
  selectedAsset?: Asset | null;
}

export const AssetTagGenerator: React.FC<AssetTagGeneratorProps> = ({
  assets,
  currentLab: _currentLab,
  selectedAsset: initialAsset,
}) => {
  const [activeAssetId, setActiveAssetId] = useState<string>(
    initialAsset ? initialAsset.id : assets[0]?.id || ''
  );
  const [tagFormat, setTagFormat] = useState<'Standard' | 'Compact' | 'Industrial'>('Standard');
  const [qrMode, setQrMode] = useState<'url' | 'tag'>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialAsset?.id) {
      setActiveAssetId(initialAsset.id);
    }
  }, [initialAsset?.id]);

  const activeAsset = assets.find((a) => a.id === activeAssetId) || initialAsset || assets[0];

  const qrPayload = useMemo(() => {
    if (!activeAsset) return '';
    if (qrMode === 'tag') {
      return activeAsset.assetTag;
    }
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://aclc-pulse.app';
    return `${origin}/?asset=${encodeURIComponent(activeAsset.assetTag)}`;
  }, [activeAsset, qrMode]);

  useEffect(() => {
    let active = true;
    if (!qrPayload) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(qrPayload, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0A2540',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [qrPayload]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTagCode = () => {
    if (activeAsset) {
      navigator.clipboard.writeText(activeAsset.assetTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl || !activeAsset) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${activeAsset.assetTag}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate deterministic SVG Barcode lines based on tag characters
  const renderSvgBarcode = (code: string) => {
    const bars: boolean[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      for (let b = 0; b < 6; b++) {
        bars.push(((charCode >> b) & 1) === 1);
      }
      bars.push(false);
    }
    const fullBars = [true, false, true, ...bars, true, false, true];

    return (
      <svg className="w-full h-11" viewBox={`0 0 ${fullBars.length * 3} 40`} preserveAspectRatio="none">
        {fullBars.map((isBlack, idx) =>
          isBlack ? (
            <rect
              key={idx}
              x={idx * 3}
              y={0}
              width={2.2}
              height={40}
              fill="#0F172A"
            />
          ) : null
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-asset-tag, #printable-asset-tag * {
            visibility: visible;
          }
          #printable-asset-tag {
            position: fixed;
            left: 20px;
            top: 20px;
            width: 380px;
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Labeling &amp; Physical Verification
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Scannable ISO QR &amp; Printable Stickers</span>
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight">
            Printable Asset Tag &amp; QR Generator
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-normal">
            Generates real camera-scannable QR stickers for ACLC College of Manila laboratory assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* QR Content Mode */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300" title="Choose what the QR code encodes">
            <button
              type="button"
              onClick={() => setQrMode('url')}
              className={`px-2.5 py-1.5 text-xs rounded transition-colors cursor-pointer flex items-center gap-1 ${
                qrMode === 'url'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-semibold'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Phone Link
            </button>
            <button
              type="button"
              onClick={() => setQrMode('tag')}
              className={`px-2.5 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                qrMode === 'tag'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-semibold'
              }`}
            >
              Tag ID Only
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
            {(['Standard', 'Compact', 'Industrial'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setTagFormat(fmt)}
                className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                  tagFormat === fmt
                    ? 'bg-blue-700 text-white font-extrabold shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-semibold'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!activeAsset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 stroke-[3]" />
            <span>Print Label</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Selection List */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700 pb-2 border-b border-slate-200">
            <span className="font-extrabold text-slate-900">Choose Equipment to Tag</span>
            <span className="font-bold text-blue-900">{assets.length} items</span>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {assets.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 font-medium">
                No equipment registered. Add assets to generate printable tags.
              </div>
            ) : (
              assets.map((asset) => {
                const isSelected = activeAsset?.id === asset.id;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setActiveAssetId(asset.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-blue-900">
                        {asset.assetTag}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300">
                        {asset.lab}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate mt-1">{asset.name}</div>
                    <div className="text-[11px] text-slate-500 truncate font-medium">
                      {asset.brandModel || asset.category}
                      {asset.monitorInfo?.brandModel ? ` · Monitor: ${asset.monitorInfo.brandModel}` : ''}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Physical Tag Live Preview Box */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[380px] shadow-inner">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-4">
              Physical Label Print Preview ({tagFormat} Layout)
            </span>

            {activeAsset ? (
              <div
                id="printable-asset-tag"
                className={`w-full max-w-md bg-white text-slate-900 rounded-xl border-2 border-slate-900 shadow-xl overflow-hidden transition-all duration-200 ${
                  tagFormat === 'Compact' ? 'p-4' : 'p-5'
                }`}
              >
                {/* Institution & Brand Top Band */}
                <div className="bg-slate-100 text-slate-950 px-4 py-2.5 -mx-5 -mt-5 mb-4 border-b-2 border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/aistudio/ACLC_3c4418b0.png"
                      alt="ACLC College Seal"
                      className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border-2 border-blue-900 shrink-0 shadow-xs"
                    />
                    <div>
                      <div className="text-[12px] font-bold tracking-wide text-blue-950 leading-tight">
                        ACLC COLLEGE OF MANILA
                      </div>
                      <div className="text-[9px] text-amber-800 font-bold tracking-wider">
                        ACLC-PULSE · LABORATORY PROPERTY
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-blue-950 font-mono border border-slate-400">
                      {activeAsset.lab}
                    </span>
                  </div>
                </div>

                {/* Main Tag Body */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                      PROPERTY IDENTIFIER
                    </div>
                    <div className="text-xl font-black font-mono tracking-tight text-blue-950">
                      {activeAsset.assetTag}
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {activeAsset.name}
                    </div>
                    {activeAsset.brandModel && (
                      <div className="text-[10px] text-slate-600 truncate font-medium">
                        Model: {activeAsset.brandModel}
                      </div>
                    )}
                    {activeAsset.serialNumber && (
                      <div className="text-[10px] text-slate-600 font-mono truncate font-medium">
                        S/N: {activeAsset.serialNumber}
                      </div>
                    )}
                    {activeAsset.monitorInfo?.brandModel && (
                      <div className="text-[10px] text-emerald-800 truncate font-semibold">
                        Monitor: {activeAsset.monitorInfo.brandModel}
                        {activeAsset.monitorInfo.serialNumber ? ` (${activeAsset.monitorInfo.serialNumber})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Real Scannable ISO QR Code */}
                  <div className="shrink-0 flex flex-col items-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`Scannable QR Code for ${activeAsset.assetTag}`}
                        className="w-24 h-24 bg-white p-1 rounded border border-slate-400"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                        Generating...
                      </div>
                    )}
                    <span className="text-[8px] font-mono font-bold text-slate-700 mt-1">
                      {qrMode === 'url' ? 'SCAN WITH CAMERA' : 'SCAN TAG ID'}
                    </span>
                  </div>
                </div>

                {/* Metadata & Barcode */}
                <div className="pt-3 border-t border-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-700 font-medium">
                    <span>
                      Category: <strong className="text-slate-950">{activeAsset.category}</strong>
                    </span>
                    <span>
                      Qty: <strong className="text-slate-950">{activeAsset.quantity} {activeAsset.unit || 'units'}</strong>
                    </span>
                  </div>

                  {/* Optical Tag Strip */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-300">
                    {renderSvgBarcode(activeAsset.assetTag)}
                    <div className="text-center font-mono text-[9px] font-black text-slate-900 tracking-widest mt-1">
                      *{activeAsset.assetTag}*
                    </div>
                  </div>

                  {/* Warning Strip */}
                  <div className="text-[8px] text-center text-slate-600 font-bold tracking-tight uppercase">
                    Security Seal · Do Not Remove or Deface under ACLC Lab Policy
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">Select an asset from the left to preview its tag.</p>
            )}

            {/* Quick Actions for Active Tag */}
            {activeAsset && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={handleCopyTagCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tag Copied!' : 'Copy Tag ID'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  disabled={!qrDataUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Send to Label Printer</span>
                </button>
              </div>
            )}

            {activeAsset && (
              <p className="text-[11px] text-slate-500 font-medium mt-3 text-center max-w-md">
                QR encodes: <span className="font-mono text-slate-700 break-all">{qrPayload}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
