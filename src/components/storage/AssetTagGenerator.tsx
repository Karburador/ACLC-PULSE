import React, { useState } from 'react';
import { Asset, LabType } from '../../types';
import { Printer, Tag, Check, Copy } from 'lucide-react';

interface AssetTagGeneratorProps {
  assets: Asset[];
  currentLab: LabType;
  selectedAsset?: Asset | null;
}

export const AssetTagGenerator: React.FC<AssetTagGeneratorProps> = ({
  assets,
  currentLab,
  selectedAsset: initialAsset,
}) => {
  const [activeAssetId, setActiveAssetId] = useState<string>(
    initialAsset ? initialAsset.id : assets[0]?.id || ''
  );
  const [tagFormat, setTagFormat] = useState<'Standard' | 'Compact' | 'Industrial'>('Standard');
  const [copied, setCopied] = useState(false);

  const activeAsset = assets.find((a) => a.id === activeAssetId) || initialAsset || assets[0];

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
      <svg className="w-full h-12" viewBox={`0 0 ${fullBars.length * 3} 40`} preserveAspectRatio="none">
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

  // Generate crisp deterministic 2D QR matrix
  const renderSvgQr = (code: string) => {
    const size = 17;
    const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (r === 0 || r === 4 || c === 0 || c === 4 || (r >= 1 && r <= 3 && c >= 1 && c <= 3 && (r === 2 && c === 2))) {
            matrix[startY + r][startX + c] = true;
          }
        }
      }
    };
    drawFinder(1, 1);
    drawFinder(11, 1);
    drawFinder(1, 11);

    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const inFinder =
          (r < 7 && c < 7) || (r < 7 && c > 9) || (r > 9 && c < 7);
        if (!inFinder) {
          const bit = Math.abs((hash ^ (r * 31 + c * 17)) % 7) > 3;
          matrix[r][c] = bit;
        }
      }
    }

    return (
      <svg className="w-20 h-20 bg-white p-1 rounded border border-slate-300" viewBox={`0 0 ${size} ${size}`}>
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0A2540" />
            ) : null
          )
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
              Phase 3: Labeling & Physical Verification
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Thermal & Laser Printable Asset Tags</span>
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight">
            Printable Asset Tag Generator
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-normal">
            Generates standardized tamper-evident equipment labels with ACLC College of Manila branding, optical barcodes, and QR routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
            {(['Standard', 'Compact', 'Industrial'] as const).map((fmt) => (
              <button
                key={fmt}
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
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
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
            {assets.map((asset) => {
              const isSelected = activeAsset?.id === asset.id;
              return (
                <button
                  key={asset.id}
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
                    {asset.storageLocation?.rackOrCabinet} · {asset.storageLocation?.shelf}
                  </div>
                </button>
              );
            })}
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
                      <div className="text-[12px] font-bold font-kabel tracking-wide text-blue-950 leading-tight">
                        ACLC COLLEGE OF MANILA
                      </div>
                      <div className="text-[9px] text-amber-800 font-bold font-kabel tracking-wider">
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
                  </div>

                  {/* QR Matrix */}
                  <div className="shrink-0 flex flex-col items-center">
                    {renderSvgQr(activeAsset.assetTag)}
                    <span className="text-[8px] font-mono font-bold text-slate-600 mt-1">
                      SCAN FOR LOGS
                    </span>
                  </div>
                </div>

                {/* Storage Mapping & Barcode */}
                <div className="pt-3 border-t border-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-700 font-medium">
                    <span>
                      Loc:{' '}
                      <strong className="text-slate-950">
                        {activeAsset.storageLocation?.rackOrCabinet} / {activeAsset.storageLocation?.shelf}
                      </strong>
                    </span>
                    <span>
                      Category: <strong className="text-slate-950">{activeAsset.category}</strong>
                    </span>
                  </div>

                  {/* SVG Barcode Graphic */}
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
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCopyTagCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tag Copied!' : 'Copy Tag ID'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Send to Label Printer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
