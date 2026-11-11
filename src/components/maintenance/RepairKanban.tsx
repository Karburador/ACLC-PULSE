import React, { useState } from 'react';
import { MaintenanceTask, KanbanColumn, LabType, Asset } from '../../types';
import {
  Wrench,
  Plus,
  ChevronRight,
  ChevronLeft,
  User,
  X,
  Trash2,
} from 'lucide-react';

interface RepairKanbanProps {
  tasks: MaintenanceTask[];
  currentLab: LabType;
  assets: Asset[];
  onAddTask: (task: Partial<MaintenanceTask>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export const RepairKanban: React.FC<RepairKanbanProps> = ({
  tasks,
  currentLab,
  assets,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [newTaskLab, setNewTaskLab] = useState<'COMLAB' | 'NETLAB' | 'TESDA'>(
    currentLab === 'ALL' ? 'COMLAB' : currentLab
  );
  const [newTaskType, setNewTaskType] = useState<MaintenanceTask['type']>('Hardware Repair');
  const [newTaskPriority, setNewTaskPriority] = useState<MaintenanceTask['priority']>('High');
  const [technician, setTechnician] = useState('Tech. Dennis Ocampo');
  const [description, setDescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [costEstimate, setCostEstimate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns: { id: KanbanColumn; label: string; headerColor: string }[] = [
    { id: 'Reported', label: '1. Reported Faults', headerColor: 'text-amber-950 border-amber-400 bg-amber-100 font-black' },
    { id: 'Diagnosed', label: '2. Under Diagnosis', headerColor: 'text-blue-950 border-blue-400 bg-blue-100 font-black' },
    { id: 'Under Repair', label: '3. In Repair / Bench', headerColor: 'text-indigo-950 border-indigo-400 bg-indigo-100 font-black' },
    { id: 'Replaced/Retired', label: '4. Replaced / Restored', headerColor: 'text-emerald-950 border-emerald-400 bg-emerald-100 font-black' },
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const linkedAsset = assets.find((a) => a.id === selectedAssetId);
      await onAddTask({
        title: newTaskTitle.trim(),
        assetId: selectedAssetId || undefined,
        assetTag: linkedAsset?.assetTag || undefined,
        lab: newTaskLab,
        type: newTaskType,
        column: 'Reported',
        priority: newTaskPriority,
        scheduledDate: new Date().toISOString().split('T')[0],
        assignedTechnician: technician.trim(),
        description: description.trim(),
        diagnosis: diagnosis.trim() || undefined,
        costEstimate: Number(costEstimate) || 0,
      });

      setIsModalOpen(false);
      setNewTaskTitle('');
      setDescription('');
      setDiagnosis('');
      setCostEstimate(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveColumn = async (task: MaintenanceTask, direction: 'prev' | 'next') => {
    const colOrder: KanbanColumn[] = ['Reported', 'Diagnosed', 'Under Repair', 'Replaced/Retired'];
    const currentIndex = colOrder.indexOf(task.column);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < colOrder.length) {
      await onUpdateTask(task.id, { column: colOrder[newIndex] });
    }
  };

  const getPriorityBadge = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-950 bg-rose-100 border border-rose-400 font-black';
      case 'High':
        return 'text-amber-950 bg-amber-100 border border-amber-400 font-bold';
      case 'Medium':
        return 'text-blue-950 bg-blue-100 border border-blue-400 font-bold';
      default:
        return 'text-slate-800 bg-slate-100 border border-slate-300 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900">
              Phase 4: Laboratory Uptime & Servicing
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Preventive Maintenance & Hardware Kanban</span>
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight">
            Repair & Replacement Kanban Board
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-normal">
            Stage-by-stage pipeline for troubleshooting faulty PCs, re-imaging labs, patching switches, and TESDA test-bench repairs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Repair Ticket</span>
        </button>
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100 border-2 border-slate-300 rounded-xl flex flex-col min-h-[500px] overflow-hidden shadow-xs"
            >
              {/* Column Header */}
              <div className="px-4 py-3 bg-white border-b-2 border-slate-200 flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded border-2 ${col.headerColor}`}>
                  {col.label}
                </span>
                <span className="text-xs font-mono font-black text-slate-900 tabular-nums bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-500 italic border-2 border-dashed border-slate-300 rounded-lg font-medium">
                    No active tickets
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-600 transition-all shadow-xs space-y-2.5"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-blue-900 font-black">
                          {task.assetTag || `LAB-${task.lab}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-700 font-bold">{task.lab}</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-950 leading-snug">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Diagnosis if available */}
                      {task.diagnosis && (
                        <div className="text-[10px] p-2 rounded bg-slate-50 border border-slate-300 text-slate-800">
                          <strong className="text-blue-900">Diagnosis:</strong> {task.diagnosis}
                        </div>
                      )}

                      {/* Footer Info & Stage Controls */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[100px] font-semibold">{task.assignedTechnician}</span>
                        </div>

                        {/* Move stage controls */}
                        <div className="flex items-center gap-1">
                          {task.column !== 'Reported' && (
                            <button
                              onClick={() => moveColumn(task, 'prev')}
                              title="Move back"
                              className="p-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded border border-slate-300 cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {task.column !== 'Replaced/Retired' && (
                            <button
                              onClick={() => moveColumn(task, 'next')}
                              title="Advance to next stage"
                              className="p-1 text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 rounded border border-blue-300 cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Remove card"
                            className="p-1 text-rose-700 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Maintenance Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b-2 border-slate-300 text-slate-900 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img
                  src="/assets/aistudio/ACLC_3c4418b0.png"
                  alt="ACLC Seal"
                  className="w-8 sm:w-9 h-8 sm:h-9 object-contain rounded-full bg-white p-0.5 border-2 border-blue-900 shrink-0 shadow-xs"
                />
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-kabel tracking-tight text-blue-950">Log Hardware Issue / Schedule</h3>
                  <p className="text-[11px] text-slate-600 font-kabel tracking-wide font-medium">ACLC College of Manila · ACLC-Pulse</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-slate-900 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ticket Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Workstation #14 PSU failure during Boot"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Laboratory *
                  </label>
                  <select
                    value={newTaskLab}
                    onChange={(e) => setNewTaskLab(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="COMLAB">COMLAB (40 Units)</option>
                    <option value="NETLAB">NETLAB (25 Units)</option>
                    <option value="TESDA">TESDA Hardware Lab (20 Units)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maintenance Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="Hardware Repair">Hardware Repair</option>
                    <option value="PC Re-imaging">PC Re-imaging / OS</option>
                    <option value="Network Audit">Network Audit & Firmware</option>
                    <option value="Routine Preventive">Routine Preventive Cleaning</option>
                    <option value="Safety Inspection">Safety Inspection</option>
                  </select>
                </div>
              </div>

              {/* Link Asset */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Linked Asset in Inventory (Optional)
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer font-medium"
                >
                  <option value="">-- General Facility Check / Not Linked --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-white text-slate-900">
                      [{a.lab}] {a.assetTag} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="Low">Low (Routine Check)</option>
                    <option value="Medium">Medium (Attention Required)</option>
                    <option value="High">High (Immediate Bench Servicing)</option>
                    <option value="Critical">Critical (Lab Blocker)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    required
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="Technician Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Symptom / Problem Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail symptoms, error beeps, or visual physical defects..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preliminary Diagnosis (Optional)
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Bad capacitors on rail; replacement required"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Add to Kanban'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
