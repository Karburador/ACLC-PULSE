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
    namePlaceholder: 'Prof. Maria Santos',
    idLabel: 'Faculty ID (Optional)',
    idRequired: false,
    idPlaceholder: 'Optional',
    deptLabel: 'Dept / Subject *',
    deptPlaceholder: 'e.g. CCS Faculty, CS101',
    deptPresets: ['CCS Faculty', 'IT Dept', 'CS Dept'],
    purposePresets: ['Class Lecture', 'Lab Practicum', 'Faculty Research'],
    defaultPurpose: 'Class Lecture',
  },
  Instructor: {
    namePlaceholder: 'Engr. Carlo Reyes',
    idLabel: 'Instructor ID (Optional)',
    idRequired: false,
    idPlaceholder: 'Optional',
    deptLabel: 'Dept / Subject *',
    deptPlaceholder: 'e.g. IT Dept, TESDA-CSS',
    deptPresets: ['IT Dept', 'TESDA-CSS', 'Networking'],
    purposePresets: ['Lab Practicum', 'Class Lecture', 'TESDA Assessment'],
    defaultPurpose: 'Lab Practicum',
  },
  Admin: {
    namePlaceholder: 'Ana Garcia',
    idLabel: 'Admin ID (Optional)',
    idRequired: false,
    idPlaceholder: 'Optional',
    deptLabel: 'Office / Unit *',
    deptPlaceholder: 'e.g. Admin Office, Registrar',
    deptPresets: ['Admin Office', 'Registrar', 'MIS'],
    purposePresets: ['Office Use', 'Campus Event', 'Meeting'],
    defaultPurpose: 'Office / Admin Use',
  },
  Student: {
    namePlaceholder: 'Juan Dela Cruz',
    idLabel: 'Student ID # *',
    idRequired: true,
    idPlaceholder: '2024-MNL-0198',
    deptLabel: 'Course & Section *',
    deptPlaceholder: 'e.g. BSCS-3A, TESDA-CSS',
    deptPresets: ['BSCS', 'BSIT', 'ACT', 'TESDA-CSS'],
    purposePresets: ['Lab Practicum', 'Capstone', 'Class Activity'],
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
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/ACLC_3c4418b0.png"
              alt="ACLC Seal"
              className="w-7 h-7 object-contain rounded-full bg-white p-0.5 border border-blue-900 shrink-0"
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h2 className="text-sm font-bold tracking-tight text-blue-950">
                Issue &amp; Dispense Item
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                ACLC Manila · Counter Dispatch
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-5 mt-2.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* 2-Column Compact Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
              {/* Left Column: Item Picker */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">1. Item *</span>
                  {!showLockedPreselected && unavailableCountInScope > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowUnavailable((prev) => !prev)}
                      className="text-[11px] font-medium text-slate-500 hover:text-blue-700 cursor-pointer whitespace-nowrap"
                    >
                      {showUnavailable
                        ? 'Available only'
                        : `+${unavailableCountInScope} out of stock`}
                    </button>
                  )}
                </div>

                {showLockedPreselected && currentAsset ? (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2.5">
                    <div>
                      <div className="text-xs font-bold text-slate-950">
                        {currentAsset.name}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-1">
                        <span className="font-mono font-semibold text-blue-900">
                          {currentAsset.assetTag}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{currentAsset.lab}</span>
                        {currentAsset.brandModel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{currentAsset.brandModel}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200/80 text-[11px]">
                      <span className="font-mono tabular-nums font-bold text-emerald-800">
                        {maxAvailable} / {currentAsset.quantity} {currentAsset.unit || 'units'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsChangingPreselected(true)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer whitespace-nowrap"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        placeholder="Search name, tag, brand..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setItemLabFilter('ALL')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          itemLabFilter === 'ALL'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      {labCodes.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setItemLabFilter(code)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            itemLabFilter.toUpperCase() === code
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>

                    <div className="h-44 md:h-[238px] overflow-y-auto border border-slate-300 rounded-lg divide-y divide-slate-200 bg-white">
                      {filteredItems.length === 0 ? (
                        <div className="p-5 text-center space-y-1.5">
                          <Package className="w-5 h-5 text-slate-400 mx-auto" />
                          <p className="text-[11px] font-semibold text-slate-600">
                            No available items match
                            {itemLabFilter !== 'ALL' ? ` in ${itemLabFilter}` : ''}.
                          </p>
                          {(itemSearch || itemLabFilter !== 'ALL') && (
                            <button
                              type="button"
                              onClick={() => {
                                setItemSearch('');
                                setItemLabFilter('ALL');
                              }}
                              className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                            >
                              Reset filter
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
                              className={`w-full text-left px-2.5 py-2 flex items-center justify-between gap-2 transition-colors ${
                                isDisabled
                                  ? 'opacity-45 bg-slate-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-blue-50 cursor-pointer'
                                    : 'hover:bg-slate-50 cursor-pointer'
                              }`}
                            >
                              <div className="min-w-0 flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-700 border-blue-700 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {asset.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                    <span className="font-mono font-semibold text-blue-900">
                                      {asset.assetTag}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span>{asset.lab}</span>
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-[11px] font-mono tabular-nums font-bold shrink-0 ${
                                  isDisabled ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                              >
                                {isDisabled
                                  ? asset.status === 'Available'
                                    ? '0'
                                    : asset.status
                                  : `${avail}/${asset.quantity}`}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Borrower & Dispatch Details */}
              <div className="md:col-span-7 flex flex-col gap-3 md:border-l md:border-slate-200 md:pl-5">
                {/* Borrower Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    2. Borrower Type *
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
                    {(['Faculty', 'Instructor', 'Admin', 'Student'] as PrimaryBorrowerRole[]).map(
                      (role) => {
                        const active = borrowerRole === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleSwitch(role)}
                            className={`py-1.5 px-2 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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

                {/* Borrower Name + ID */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Borrower Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      placeholder={roleConfig.namePlaceholder}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {roleConfig.idLabel}
                    </label>
                    <input
                      type="text"
                      required={roleConfig.idRequired}
                      value={borrowerIdNumber}
                      onChange={(e) => setBorrowerIdNumber(e.target.value)}
                      placeholder={roleConfig.idPlaceholder}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Dept/Section + Qty */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-8">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        {roleConfig.deptLabel}
                      </label>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {roleConfig.deptPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setDepartmentSection(preset)}
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                              departmentSection === preset
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      value={departmentSection}
                      onChange={(e) => setDepartmentSection(e.target.value)}
                      placeholder={roleConfig.deptPlaceholder}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Qty *
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden h-[30px]">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-2 h-full text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={Math.max(1, maxAvailable)}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(Math.max(1, maxAvailable), parseInt(e.target.value, 10) || 1)
                            )
                          )
                        }
                        className="w-full text-center bg-transparent text-xs font-mono tabular-nums font-bold text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(Math.max(1, maxAvailable), q + 1))
                        }
                        disabled={quantity >= maxAvailable}
                        className="px-2 h-full text-slate-700 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Return Date + Purpose */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Return *
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setExpectedReturnDate(todayStr)}
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer whitespace-nowrap ${
                            expectedReturnDate === todayStr
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpectedReturnDate(tomorrowStr)}
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer whitespace-nowrap ${
                            expectedReturnDate === tomorrowStr
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Tom.
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpectedReturnDate(plusThreeStr)}
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer whitespace-nowrap ${
                            expectedReturnDate === plusThreeStr
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          +3d
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      required
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Purpose
                      </label>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {roleConfig.purposePresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPurpose(preset)}
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                              purpose === preset
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder={`Defaults to ${roleConfig.defaultPurpose}`}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Compact Selected Item + Custodian Strip */}
                <div className="mt-auto pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <div className="truncate">
                    {currentAsset ? (
                      <>
                        Selected:{' '}
                        <strong className="text-slate-900 font-mono">
                          {currentAsset.assetTag}
                        </strong>
                        <span aria-hidden="true"> · </span>
                        <span className="text-emerald-700 font-mono tabular-nums font-bold">
                          {maxAvailable} avail.
                        </span>
                      </>
                    ) : (
                      <span>No item selected</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Issued by:</span>
                    <input
                      type="text"
                      value={issuedBy}
                      onChange={(e) => setIssuedBy(e.target.value)}
                      aria-label="Authorizing Custodian"
                      className="w-36 px-2 py-0.5 bg-slate-50 border border-slate-300 rounded text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="flex items-center justify-end gap-2.5 px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentAsset || maxAvailable <= 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <HandCoins className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Recording...' : 'Authorize & Dispense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
