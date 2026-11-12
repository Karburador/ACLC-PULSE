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
  onAddTask,
}) => {
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
    {
      lab: 'MACLAB',
      title: 'macOS Sonoma Color Calibration & Creative Cloud Sync',
      frequency: 'Bi-Weekly Cycle',
      nextDue: '2026-11-25',
      type: 'Routine Preventive',
      technician: 'Tech. Alan Villanueva',
      itemsCount: '20 Apple iMac M3 & Cintiq Pro Displays',
      icon: HardDrive,
    },
    {
      lab: 'CYBERLAB',
      title: 'Enterprise Server Hypervisor & Firewall Log Audit',
      frequency: 'Weekly Security Sweep',
      nextDue: '2026-11-19',
      type: 'Network Audit',
      technician: 'Engr. Michael Santos',
      itemsCount: 'Dell PowerEdge R750 & FortiGate Firewalls',
      icon: Network,
    },
    {
      lab: 'IOTLAB',
      title: 'Oscilloscope Calibration & GPIO Bench Voltage Verification',
      frequency: 'Monthly Inspection',
      nextDue: '2026-11-28',
      type: 'Routine Preventive',
      technician: 'Tech. Dennis Ocampo',
      itemsCount: '15 Rigol Scopes & Raspberry Pi 5 Benches',
      icon: Cpu,
    },
  ];

  const filteredRoutines = currentLab === 'ALL'
    ? routineSchedules
    : routineSchedules.filter((r) => r.lab === currentLab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-black text-slate-950">Routine Preventive Schedule Calendar</h3>
          <p className="text-xs text-slate-600 font-medium">
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
              className="p-5 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-600 transition-colors space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 shrink-0">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">{routine.title}</h4>
                    <span className="text-[11px] text-blue-900 font-extrabold">
                      [{routine.lab}] · {routine.frequency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-200 text-slate-700">
                <div>
                  Scope: <strong className="text-slate-950">{routine.itemsCount}</strong>
                </div>
                <div>
                  Lead: <strong className="text-slate-950">{routine.technician}</strong>
                </div>
                <div>
                  Next Due:{' '}
                  <strong className="text-amber-950 font-mono font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                    {routine.nextDue}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    Active Policy
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
