import React, { useState, useMemo } from 'react';
import { Asset, LabStorageLayout, LabType, Laboratory } from '../../types';
import { DEFAULT_STORAGE_LAYOUTS } from '../../data/storageLayouts';
import {
  Server,
  Tag,
} from 'lucide-react';

interface StorageVisualizerProps {
  currentLab: LabType;
  assets: Asset[];
  laboratories?: Laboratory[];
  onSelectAssetForTag?: (asset: Asset) => void;
}

export const StorageVisualizer: React.FC<StorageVisualizerProps> = ({
  currentLab,
  assets,
  laboratories = [],
  onSelectAssetForTag,
}) => {
  const layouts = useMemo<LabStorageLayout[]>(() => {
    const knownCodes = new Set(DEFAULT_STORAGE_LAYOUTS.map((l) => l.lab.toUpperCase()));
    const dynamicLabs: LabStorageLayout[] = laboratories
      .filter((lab) => !knownCodes.has(lab.code.toUpperCase()))
      .map((lab) => ({
        lab: lab.code,
        name: `${lab.name} (${lab.roomNumber})`,
        roomNumber: lab.roomNumber,
        totalCapacityUnits: lab.capacity,
        activeUnitsCount: lab.activeUnitsCount || 0,
        cabinets: [
          {
            id: `cabinet-${lab.code.toLowerCase()}-1`,
            name: `Cabinet ${lab.code}-A`,
            description: `Primary equipment and tools cabinet for ${lab.name}`,
            shelves: [
              { id: `shelf-${lab.code.toLowerCase()}-1`, label: 'Shelf 1 - Primary Equipment', assignedCategory: 'Computers' },
              { id: `shelf-${lab.code.toLowerCase()}-2`, label: 'Shelf 2 - Tools & Hardware', assignedCategory: 'Tools' },
              { id: `shelf-${lab.code.toLowerCase()}-3`, label: 'Shelf 3 - Consumables & Accessories', assignedCategory: 'Consumables' },
            ],
          },
        ],
      }));

    // Keep default layouts only for existing labs (if labs are populated)
    const activeCodes = new Set(laboratories.map((l) => l.code.toUpperCase()));
    const baseLayouts =
      laboratories.length > 0
        ? DEFAULT_STORAGE_LAYOUTS.filter((l) => activeCodes.has(l.lab.toUpperCase()))
        : DEFAULT_STORAGE_LAYOUTS;

    const combined = [...baseLayouts, ...dynamicLabs];
    if (currentLab && currentLab !== 'ALL') {
      return combined.filter((l) => l.lab.toUpperCase() === currentLab.toUpperCase());
    }
    return combined;
  }, [currentLab, laboratories]);

  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');

  // Find all cabinets across loaded layouts
  const allCabinets = layouts.flatMap((l) =>
    l.cabinets.map((c) => ({ ...c, labName: l.name, labCode: l.lab }))
  );

  const activeCabinet = allCabinets.find((c) => c.id === selectedCabinetId) || allCabinets[0];

  const getAssetsForShelf = (labCode: string, cabinetName: string, shelfLabel: string) => {
    return assets.filter((a) => {
      if (a.lab?.toUpperCase() !== labCode.toUpperCase()) return false;
      const loc = a.storageLocation;
      if (!loc) return false;
      const rackText = (loc.rackOrCabinet || '').trim().toLowerCase();
      const shelfText = (loc.shelf || '').trim().toLowerCase();
      const cabMatch =
        !!rackText &&
        (cabinetName.toLowerCase().includes(rackText) || rackText.includes(cabinetName.toLowerCase()));
      const shelfMatch =
        !!shelfText &&
        (shelfLabel.toLowerCase().includes(shelfText) || shelfText.includes(shelfLabel.toLowerCase()));
      return cabMatch && shelfMatch;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Facility Storage Map
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Physical Rack &amp; Cabinet Visualization</span>
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight">
            Laboratory Storage & Rack Map
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-normal">
            Interactive visual mapping of server racks, tool chests, and storage enclosures across campus laboratories.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
          <Server className="w-4 h-4 text-blue-700" />
          <span>{allCabinets.length} Mapped Enclosures</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table / Cabinet / Rack Directory */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200">
            Tables, Cabinets &amp; Racks
          </div>

          <div className="space-y-1.5">
            {allCabinets.map((cab) => {
              const isSelected = activeCabinet?.id === cab.id;
              return (
                <button
                  key={cab.id}
                  onClick={() => setSelectedCabinetId(cab.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{cab.name}</span>
                    <span className="text-[10px] font-mono text-blue-900 font-extrabold bg-blue-100 px-1.5 py-0.2 rounded border border-blue-300">
                      {cab.labCode}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-1">
                    {cab.shelves.length} {cab.name.toLowerCase().includes('table') ? 'Table Positions' : 'Positions / Tiers'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table/Cabinet Positions Visualizer */}
        <div className="lg:col-span-3 bg-white border-2 border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          {activeCabinet ? (
            <>
              {/* Enclosure Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-950">{activeCabinet.name}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                      {activeCabinet.labCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{activeCabinet.description}</p>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Facility: <strong className="text-slate-950">{activeCabinet.labName}</strong>
                </div>
              </div>

              {/* Placement Zones / Tiers */}
              <div className="space-y-4">
                {activeCabinet.shelves.map((shelf, sIdx) => {
                  const shelfAssets = getAssetsForShelf(activeCabinet.labCode, activeCabinet.name, shelf.label);

                  return (
                    <div
                      key={shelf.id}
                      className="bg-slate-50 border border-slate-300 rounded-xl p-4 transition-all hover:border-slate-400"
                    >
                      {/* Zone Title Bar */}
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-300 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-blue-900 text-amber-300 font-mono font-bold flex items-center justify-center text-[10px]">
                            {sIdx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900">{shelf.label}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-[11px] text-slate-600">
                            Assigned: <strong className="text-slate-900">{shelf.assignedCategory}</strong>
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-[11px] font-mono text-blue-900 font-bold bg-blue-100 px-2 py-0.5 rounded">
                            {shelfAssets.length} Mapped Items
                          </span>
                        </div>
                      </div>

                      {/* Items in this zone */}
                      {shelfAssets.length === 0 ? (
                        <div className="text-xs text-slate-500 italic py-2 pl-7 font-medium">
                          Available capacity for {shelf.assignedCategory.toLowerCase()}.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                          {shelfAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-300 hover:border-blue-600 transition-colors shadow-2xs"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-blue-900">
                                    {asset.assetTag}
                                  </span>
                                  <span className="text-[11px] text-slate-600 font-medium">
                                    {asset.availableQuantity} of {asset.quantity} {asset.unit || 'units'}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-900 font-bold truncate mt-0.5">
                                  {asset.name}
                                </div>
                              </div>

                              {onSelectAssetForTag && (
                                <button
                                  onClick={() => onSelectAssetForTag(asset)}
                                  title="Generate tag for this asset"
                                  className="p-1.5 text-blue-700 hover:text-blue-950 hover:bg-blue-100 rounded transition-colors cursor-pointer shrink-0"
                                >
                                  <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 font-medium">
              Select a cabinet or server rack from the left to inspect shelving layout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
