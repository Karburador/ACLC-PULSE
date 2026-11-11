import React, { useState } from 'react';
import { MaintenanceTask, LabType } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  Network,
  ShieldCheck,
  Plus,
  AlertCircle
} from 'lucide-react';

interface MaintenanceSchedulerProps {
  tasks: MaintenanceTask[];
  currentLab: LabType;
  onAddTask: (task: Partial<MaintenanceTask>) => Promise<void>;
}

export const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({
  tasks,
  currentLab,
  onAddTask,
}) => {
  // Pre-configured routine schedules for ACLC Manila's targeted laboratories
  const routineSchedules = [
    {
      lab: 'COMLAB',
      title: 'Monthly PC Sysprep & Re-imaging Batch A (Units 01-20)',
      frequency: 'Every 1st Saturday',
      nextDue: '2026-11-20',
      type: 'PC Re-imaging',
      technician: 'Tech. Alan Villanueva',
      itemsCount: '20 Dell OptiPlex Desktops',
      icon: HardDrive,
    },
    {
      lab: 'COMLAB',
      title: 'Monthly PC Sysprep & Re-imaging Batch B (Units 21-40)',
      frequency: 'Every 2nd Saturday',
      nextDue: '2026-11-27',
      type: 'PC Re-imaging',
      technician: 'Tech. Alan Villanueva',
      itemsCount: '20 Dell OptiPlex Desktops',
      icon: HardDrive,
    },
    {
      lab: 'NETLAB',
      title: 'Cisco IOS Firmware & VLAN Hardening Audit',
      frequency: 'Monthly Cycle',
      nextDue: '2026-11-22',
      type: 'Network Audit',
      technician: 'Engr. Michael Santos',
      itemsCount: '15 Catalyst 2960-X Switches & 10 Routers',
      icon: Network,
    },
    {
      lab: 'TESDA',
      title: 'CSS NC II Workbench Calibration & Soldering Tip Tinning',
      frequency: 'Bi-Weekly Inspection',
      nextDue: '2026-11-18',
      type: 'Routine Preventive',
      technician: 'Tech. Dennis Ocampo',
      itemsCount: '20 Modular Test Benches',
      icon: Cpu,
    },
    {
      lab: 'TESDA',
      title: 'ESD Mat & Grounding Wrist-Strap Continuity Verification',
      frequency: 'Quarterly Safety Audit',
      nextDue: '2026-12-05',
      type: 'Safety Inspection',
      technician: 'Engr. Michael Santos',
      itemsCount: 'All Workbenches 1-10',
      icon: ShieldCheck,
    },
  ];

  const filteredRoutines = currentLab === 'ALL'
    ? routineSchedules
    : routineSchedules.filter((r) => r.lab === currentLab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white">Routine Preventive Schedule Calendar</h3>
          <p className="text-xs text-slate-400">
            Standard laboratory upkeep cycles mandated by ACLC Academic & Facilities IT Policy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutines.map((routine, idx) => {
          const Icon = routine.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{routine.title}</h4>
                    <span className="text-[11px] text-amber-400 font-medium">
                      [{routine.lab}] · {routine.frequency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/60 text-slate-400">
                <div>
                  Scope: <strong className="text-slate-200">{routine.itemsCount}</strong>
                </div>
                <div>
                  Lead: <strong className="text-slate-200">{routine.technician}</strong>
                </div>
                <div>
                  Next Due:{' '}
                  <strong className="text-amber-300 font-mono">{routine.nextDue}</strong>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-medium">Active Policy</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
