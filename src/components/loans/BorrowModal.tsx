import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Laboratory, LabType, LoanRecord } from '../../types';
import {
  X,
  HandCoins,
  AlertCircle,
  Search,
  Check,
  Package,
  Minus,
  Plus,
} from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueLoan: (loanData: Partial<LoanRecord>) => Promise<void>;
  availableAssets: Asset[];
  laboratories?: Laboratory[];
  currentLab?: LabType;
  preselectedAsset?: Asset | null;
  custodianName?: string;
}

type PrimaryBorrowerRole = 'Faculty' | 'Instructor' | 'Admin' | 'Student';

const ROLE_CONFIG: Record<
  PrimaryBorrowerRole,
  {
    namePlaceholder: string;
    idLabel: string;
    idRequired: boolean;
    idPlaceholder: string;
    deptLabel: string;
    deptPlaceholder: string;
    deptPresets: string[];
    purposePresets: string[];
    defaultPurpose: string;
  }
> = {
  Faculty: {
    namePlaceholder: 'e.g. Prof. Maria Santos',
    idLabel: 'Faculty / Employee ID (Optional)',
    idRequired: false,
    idPlaceholder: 'e.g. FAC-014 (optional)',
    deptLabel: 'Department / Subject *',
    deptPlaceholder: 'e.g. CCS Faculty, IT Dept, CS101',
    deptPresets: ['CCS Faculty', 'IT Dept', 'CS Dept', 'General Ed'],
    purposePresets: ['Class Lecture', 'Lab Practicum', 'Faculty Research', 'Department Event'],
    defaultPurpose: 'Class Lecture',
  },
  Instructor: {
    namePlaceholder: 'e.g. Engr. Carlo Reyes',
    idLabel: 'Instructor / Employee ID (Optional)',
    idRequired: false,
    idPlaceholder: 'e.g. INST-008 (optional)',
    deptLabel: 'Department / Subject *',
    deptPlaceholder: 'e.g. IT Dept, TESDA-CSS, Networking',
    deptPresets: ['IT Dept', 'TESDA-CSS', 'Networking', 'Programming'],
    purposePresets: ['Lab Practicum', 'Class Lecture', 'TESDA Assessment', 'Demo Session'],
    defaultPurpose: 'Lab Practicum',
  },
  Admin: {
    namePlaceholder: 'e.g. Ana Garcia',
    idLabel: 'Employee / Admin ID (Optional)',
    idRequired: false,
    idPlaceholder: 'e.g. ADM-003 (optional)',
    deptLabel: 'Office / Unit *',
    deptPlaceholder: 'e.g. Admin Office, Registrar, MIS, OSA',
    deptPresets: ['Admin Office', 'Registrar', 'MIS Office', 'OSA'],
    purposePresets: ['Office / Admin Use', 'Campus Event', 'Meeting / Briefing', 'Maintenance Support'],
    defaultPurpose: 'Office / Admin Use',
  },
  Student: {
    namePlaceholder: 'e.g. Juan Dela Cruz',
    idLabel: 'Student ID # *',
    idRequired: true,
    idPlaceholder: 'e.g. 2024-MNL-0198',
    deptLabel: 'Course & Section *',
    deptPlaceholder: 'e.g. BSCS-3A, BSIT-2B, TESDA-CSS',
    deptPresets: ['BSCS', 'BSIT', 'ACT', 'TESDA-CSS'],
    purposePresets: ['Lab Practicum', 'Thesis / Capstone', 'Class Activity', 'TESDA NC II Training'],
    defaultPurpose: 'Laboratory Practical Coursework',
  },
};

function formatLocalDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  isOpen,
  onClose,
  onIssueLoan,
  availableAssets,
  laboratories = [],
  currentLab = 'ALL',
  preselectedAsset,
  custodianName,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isChangingPreselected, setIsChangingPreselected] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemLabFilter, setItemLabFilter] = useState<string>('ALL');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const [borrowerRole, setBorrowerRole] = useState<PrimaryBorrowerRole>('Faculty');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerIdNumber, setBorrowerIdNumber] = useState('');
  const [departmentSection, setDepartmentSection] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => formatLocalDate(0));
  const [purpose, setPurpose] = useState('');
  const [issuedBy, setIssuedBy] = useState(custodianName || 'Lab Custodian');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setItemSearch('');
    setShowUnavailable(false);
    setItemLabFilter(
      preselectedAsset
        ? preselectedAsset.lab
        : currentLab && currentLab !== 'ALL'
          ? currentLab
          : 'ALL'
    );
    setIsChangingPreselected(false);

    if (preselectedAsset) {
      setSelectedAssetId(preselectedAsset.id);
    } else {
      const scoped =
        currentLab && currentLab !== 'ALL'
          ? availableAssets.filter((a) => a.lab?.toUpperCase() === currentLab.toUpperCase())
          : availableAssets;
      const firstAvail =
        scoped.find(
          (a) =>
            (a.availableQuantity || 0) > 0 &&
            a.status !== 'Damaged' &&
            a.status !== 'Under Maintenance' &&
            a.status !== 'Archived'
        ) ||
        availableAssets.find((a) => (a.availableQuantity || 0) > 0) ||
        null;
      setSelectedAssetId(firstAvail ? firstAvail.id : '');
    }

    setBorrowerRole('Faculty');
    setBorrowerName('');
    setBorrowerIdNumber('');
    setDepartmentSection('');
    setQuantity(1);
    setExpectedReturnDate(formatLocalDate(0));
    setPurpose('');
    setIssuedBy(custodianName || 'Lab Custodian');
    setError(null);
  }, [isOpen, preselectedAsset, currentLab, custodianName]);

  const labCodes = useMemo(() => {
    const set = new Set<string>();
    laboratories.forEach((l) => {
      if (l.code) set.add(l.code.toUpperCase());
    });
    availableAssets.forEach((a) => {
      if (a.lab) set.add(a.lab.toUpperCase());
    });
    return Array.from(set);
  }, [laboratories, availableAssets]);

  const unavailableCountInScope = useMemo(() => {
    return availableAssets.filter((a) => {
      if (itemLabFilter !== 'ALL' && a.lab?.toUpperCase() !== itemLabFilter.toUpperCase()) {
        return false;
      }
      return (
        (a.availableQuantity || 0) <= 0 ||
        a.status === 'Damaged' ||
        a.status === 'Under Maintenance' ||
        a.status === 'Archived'
      );
    }).length;
  }, [availableAssets, itemLabFilter]);

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return availableAssets
      .filter((asset) => {
        if (itemLabFilter !== 'ALL' && asset.lab?.toUpperCase() !== itemLabFilter.toUpperCase()) {
          return false;
        }
        const isDispenseReady =
          (asset.availableQuantity || 0) > 0 &&
          asset.status !== 'Damaged' &&
          asset.status !== 'Under Maintenance' &&
          asset.status !== 'Archived';

        if (!showUnavailable && !isDispenseReady) {
          return false;
        }

        if (q) {
          const match =
            asset.name.toLowerCase().includes(q) ||
            asset.assetTag.toLowerCase().includes(q) ||
            (asset.brandModel && asset.brandModel.toLowerCase().includes(q)) ||
            (asset.category && asset.category.toLowerCase().includes(q)) ||
            (asset.storageLocation?.rackOrCabinet &&
              asset.storageLocation.rackOrCabinet.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aAvail = (a.availableQuantity || 0) > 0 ? 1 : 0;
        const bAvail = (b.availableQuantity || 0) > 0 ? 1 : 0;
        if (aAvail !== bAvail) return bAvail - aAvail;
        return a.assetTag.localeCompare(b.assetTag);
      });
  }, [availableAssets, itemLabFilter, itemSearch, showUnavailable]);

  if (!isOpen) return null;

  const currentAsset = availableAssets.find((a) => a.id === selectedAssetId) || null;
  const maxAvailable = currentAsset ? currentAsset.availableQuantity || 0 : 0;
  const roleConfig = ROLE_CONFIG[borrowerRole];

  const todayStr = formatLocalDate(0);
  const tomorrowStr = formatLocalDate(1);
  const plusThreeStr = formatLocalDate(3);

  const handleRoleSwitch = (nextRole: PrimaryBorrowerRole) => {
    setBorrowerRole(nextRole);
    setError(null);
    // Clear dept preset if user simply tapped one of the previous role's quick presets
    const prevPresets = ROLE_CONFIG[borrowerRole].deptPresets;
    if (prevPresets.includes(departmentSection.trim())) {
      setDepartmentSection('');
    }
    const prevPurposePresets = ROLE_CONFIG[borrowerRole].purposePresets;
    if (prevPurposePresets.includes(purpose.trim())) {
      setPurpose('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !currentAsset) {
      setError('Please select an available item to issue.');
      return;
    }
    if (maxAvailable <= 0) {
      setError('Selected item has 0 available units in stock.');
      return;
    }
    if (!borrowerName.trim()) {
      setError('Borrower full name is required.');
      return;
    }
    if (roleConfig.idRequired && !borrowerIdNumber.trim()) {
      setError('Student ID number is required for student borrowers.');
      return;
    }
    if (!departmentSection.trim()) {
      setError(
        borrowerRole === 'Student'
          ? 'Course and section is required.'
          : borrowerRole === 'Admin'
            ? 'Office or unit is required.'
            : 'Department or subject is required.'
      );
      return;
    }
    if (quantity > maxAvailable) {
      setError(`Cannot issue ${quantity} units. Only ${maxAvailable} available in stock.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onIssueLoan({
        assetId: selectedAssetId,
        borrowerName: borrowerName.trim(),
        borrowerIdNumber: borrowerIdNumber.trim() || 'On File',
        borrowerRole,
        departmentSection: departmentSection.trim(),
        quantity,
        dateBorrowed: formatLocalDate(0),
        expectedReturnDate: expectedReturnDate || formatLocalDate(0),
        purpose: purpose.trim() || roleConfig.defaultPurpose,
        issuedBy: issuedBy.trim() || custodianName || 'Lab Custodian',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLockedPreselected = Boolean(preselectedAsset && !isChangingPreselected && currentAsset);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC Seal"
              className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border border-blue-900 shrink-0"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-blue-950">
                Issue &amp; Dispense Item
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                ACLC College of Manila · Fast Custodian Counter Dispatch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-5 overflow-y-auto text-slate-900 flex-1"
        >
          {/* Section 1: Searchable Item Picker (Replaces native dropdown) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-800">
                1. Item to Issue *
              </label>
              {!showLockedPreselected && unavailableCountInScope > 0 && (
                <button
                  type="button"
                  onClick={() => setShowUnavailable((prev) => !prev)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 cursor-pointer whitespace-nowrap"
                >
                  {showUnavailable
                    ? 'Hide unavailable items'
                    : `Show out-of-stock (${unavailableCountInScope})`}
                </button>
              )}
            </div>

            {showLockedPreselected && currentAsset ? (
              <div className="flex items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-300 rounded-lg">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-950 truncate">
                    {currentAsset.name}
                    {currentAsset.brandModel ? (
                      <span className="text-xs font-medium text-slate-600">
                        {' '}
                        · {currentAsset.brandModel}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-semibold text-blue-900">
                      {currentAsset.assetTag}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{currentAsset.lab}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {currentAsset.storageLocation?.rackOrCabinet} (
                      {currentAsset.storageLocation?.shelf})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono tabular-nums font-bold text-emerald-800">
                    {maxAvailable} {currentAsset.unit || 'units'} avail.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingPreselected(true)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Change Item
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Search + Lab Filter Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search by item name, tag (e.g. PRJ, PC01), brand, or cabinet..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Lab Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => setItemLabFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      itemLabFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Labs
                  </button>
                  {labCodes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setItemLabFilter(code)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        itemLabFilter.toUpperCase() === code
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {/* Scrollable Item Picker List */}
                <div className="max-h-44 overflow-y-auto border border-slate-300 rounded-lg divide-y divide-slate-200 bg-white">
                  {filteredItems.length === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <Package className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        No matching available equipment found
                        {itemLabFilter !== 'ALL' ? ` in ${itemLabFilter}` : ''}.
                      </p>
                      {(itemSearch || itemLabFilter !== 'ALL') && (
                        <button
                          type="button"
                          onClick={() => {
                            setItemSearch('');
                            setItemLabFilter('ALL');
                          }}
                          className="px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-md cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredItems.map((asset) => {
                      const avail = asset.availableQuantity || 0;
                      const isDisabled =
                        avail <= 0 ||
                        asset.status === 'Damaged' ||
                        asset.status === 'Under Maintenance' ||
                        asset.status === 'Archived';
                      const isSelected = asset.id === selectedAssetId;

                      return (
                        <button
                          key={asset.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setQuantity(1);
                            setError(null);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                            isDisabled
                              ? 'opacity-50 bg-slate-50 cursor-not-allowed'
                              : isSelected
                                ? 'bg-blue-50 cursor-pointer'
                                : 'hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-blue-700 border-blue-700 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {asset.name}
                                {asset.brandModel ? (
                                  <span className="text-xs font-normal text-slate-500">
                                    {' '}
                                    · {asset.brandModel}
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-1.5">
                                <span className="font-mono font-semibold text-blue-900">
                                  {asset.assetTag}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{asset.lab}</span>
                                <span aria-hidden="true">·</span>
                                <span>{asset.category}</span>
                                {asset.storageLocation?.rackOrCabinet && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{asset.storageLocation.rackOrCabinet}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div
                              className={`text-xs font-mono tabular-nums font-bold ${
                                isDisabled ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              {isDisabled
                                ? asset.status === 'Available'
                                  ? '0 avail.'
                                  : asset.status
                                : `${avail} / ${asset.quantity} ${asset.unit || 'units'}`}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {currentAsset && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    <span>
                      Selected:{' '}
                      <strong className="text-slate-950">{currentAsset.name}</strong>{' '}
                      <span className="font-mono text-blue-900">
                        ({currentAsset.assetTag})
                      </span>
                    </span>
                    <span className="font-mono tabular-nums font-bold text-emerald-800">
                      {maxAvailable} {currentAsset.unit || 'units'} in stock ·{' '}
                      {currentAsset.storageLocation?.rackOrCabinet} (
                      {currentAsset.storageLocation?.shelf})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity & Expected Return Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quantity *
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, maxAvailable)}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(Math.max(1, maxAvailable), parseInt(e.target.value, 10) || 1))
                    )
                  }
                  className="w-full text-center py-2 bg-transparent text-sm font-mono tabular-nums font-bold text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, maxAvailable), q + 1))
                  }
                  disabled={quantity >= maxAvailable}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label className="block text-xs font-bold text-slate-700">
                  Expected Return Date *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpectedReturnDate(todayStr)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                      expectedReturnDate === todayStr
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpectedReturnDate(tomorrowStr)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                      expectedReturnDate === tomorrowStr
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpectedReturnDate(plusThreeStr)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                      expectedReturnDate === plusThreeStr
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +3 Days
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Borrower Role (Segmented 1-Click Buttons) */}
          <div className="space-y-3 pt-1 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                2. Borrower Type *
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg">
                {(['Faculty', 'Instructor', 'Admin', 'Student'] as PrimaryBorrowerRole[]).map(
                  (role) => {
                    const active = borrowerRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSwitch(role)}
                        className={`py-2 px-2 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Smart Role-Aware Borrower Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Borrower Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder={roleConfig.namePlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {roleConfig.idLabel}
                </label>
                <input
                  type="text"
                  required={roleConfig.idRequired}
                  value={borrowerIdNumber}
                  onChange={(e) => setBorrowerIdNumber(e.target.value)}
                  placeholder={roleConfig.idPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {roleConfig.deptLabel}
                </label>
                <input
                  type="text"
                  required
                  value={departmentSection}
                  onChange={(e) => setDepartmentSection(e.target.value)}
                  placeholder={roleConfig.deptPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {roleConfig.deptPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepartmentSection(preset)}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        departmentSection === preset
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Authorizing Custodian
                </label>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  placeholder="Lab Custodian Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Purpose + Quick Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Purpose / Course Subject
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={`Optional — defaults to "${roleConfig.defaultPurpose}"`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {roleConfig.purposePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPurpose(preset)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      purpose === preset
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentAsset || maxAvailable <= 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <HandCoins className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Recording Loan...' : 'Authorize & Dispense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
