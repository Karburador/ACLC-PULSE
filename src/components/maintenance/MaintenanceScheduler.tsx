import React from 'react';
import { MaintenanceTask, LabType } from '../../types';
import {
  HardDrive,
  Cpu,
  Network,
  ShieldCheck,
} from 'lucide-react';

interface MaintenanceSchedulerProps {
  tasks: MaintenanceTask[];
  currentLab: LabType;
  onAddTask: (task: Partial<MaintenanceTask>) => Promise<void>;
}

export const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({
  tasks,
  currentLab,
}) => {
  const scheduledTasks = tasks.filter((t) =>
    currentLab === 'ALL' ? true : t.lab === currentLab
  );

  const getIcon = (type: MaintenanceTask['type']) => {
    switch (type) {
      case 'Network Audit':
        return Network;
      case 'Safety Inspection':
        return ShieldCheck;
      case 'Hardware Repair':
        return Cpu;
      default:
        return HardDrive;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-black text-slate-950">Preventive &amp; Scheduled Maintenance Calendar</h3>
          <p className="text-xs text-slate-600 font-medium">
            Active upkeep schedules and servicing cycles tracked in the laboratory maintenance ledger.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
          {scheduledTasks.length} Scheduled
        </span>
      </div>

      {scheduledTasks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-10 text-center space-y-2">
          <HardDrive className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
          <h4 className="text-sm font-bold text-slate-900">No scheduled maintenance records</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently 0 maintenance schedules or tickets recorded. Log a repair or preventive task from the Kanban tab to schedule servicing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledTasks.map((task) => {
            const Icon = getIcon(task.type);
            const isDone = task.column === 'Replaced/Retired';
            return (
              <div
                key={task.id}
                className="p-5 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-600 transition-colors space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 shrink-0">
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950">{task.title}</h4>
                      <span className="text-[11px] text-blue-900 font-extrabold">
                        [{task.lab}] · {task.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-200 text-slate-700">
                  <div>
                    Asset Tag:{' '}
                    <strong className="text-slate-950 font-mono">
                      {task.assetTag || 'General Facility'}
                    </strong>
                  </div>
                  <div>
                    Lead: <strong className="text-slate-950">{task.assignedTechnician}</strong>
                  </div>
                  <div>
                    Scheduled:{' '}
                    <strong className="text-amber-950 font-mono font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                      {task.scheduledDate}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black px-2 py-0.5 rounded border ${
                        isDone
                          ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                          : 'text-blue-900 bg-blue-100 border-blue-300'
                      }`}
                    >
                      {task.column}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
