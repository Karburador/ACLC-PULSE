import { LabStorageLayout } from '../types';

export const DEFAULT_STORAGE_LAYOUTS: LabStorageLayout[] = [
  {
    lab: 'COMLAB',
    name: 'Computer Laboratory (Room 304)',
    roomNumber: 'Room 304',
    totalCapacityUnits: 40,
    activeUnitsCount: 0,
    cabinets: [
      {
        id: 'table-com-1',
        name: 'Long Table 1 (7 Computer Sets)',
        description: '7-seat workstation table · CPUs mounted under table, monitors & peripherals on tabletop',
        shelves: [
          { id: 'com-t1-under', label: 'Under Table (CPU / System Units 01-07)', assignedCategory: 'Computers' },
          { id: 'com-t1-top', label: 'Tabletop (Monitors & Peripherals 01-07)', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'table-com-2',
        name: 'Long Table 2 (7 Computer Sets)',
        description: '7-seat workstation table · CPUs mounted under table, monitors & peripherals on tabletop',
        shelves: [
          { id: 'com-t2-under', label: 'Under Table (CPU / System Units 08-14)', assignedCategory: 'Computers' },
          { id: 'com-t2-top', label: 'Tabletop (Monitors & Peripherals 08-14)', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'table-com-3',
        name: 'Long Table 3 (7 Computer Sets)',
        description: '7-seat workstation table · CPUs mounted under table, monitors & peripherals on tabletop',
        shelves: [
          { id: 'com-t3-under', label: 'Under Table (CPU / System Units 15-21)', assignedCategory: 'Computers' },
          { id: 'com-t3-top', label: 'Tabletop (Monitors & Peripherals 15-21)', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'table-com-4',
        name: 'Long Table 4 (7 Computer Sets)',
        description: '7-seat workstation table · CPUs mounted under table, monitors & peripherals on tabletop',
        shelves: [
          { id: 'com-t4-under', label: 'Under Table (CPU / System Units 22-28)', assignedCategory: 'Computers' },
          { id: 'com-t4-top', label: 'Tabletop (Monitors & Peripherals 22-28)', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'table-com-5',
        name: 'Long Table 5 (7 Computer Sets)',
        description: '7-seat workstation table · CPUs mounted under table, monitors & peripherals on tabletop',
        shelves: [
          { id: 'com-t5-under', label: 'Under Table (CPU / System Units 29-35)', assignedCategory: 'Computers' },
          { id: 'com-t5-top', label: 'Tabletop (Monitors & Peripherals 29-35)', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'cab-com-a',
        name: 'Cabinet COM-A (AV & Projector Depot)',
        description: 'Enclosed steel cabinet for AV peripherals, HDMI extenders, and wireless presenters',
        shelves: [
          { id: 'com-a-s1', label: 'Shelf 1: Projectors & Lenses', assignedCategory: 'Projectors' },
          { id: 'com-a-s2', label: 'Shelf 2: Presentation Accessories & Remotes', assignedCategory: 'Peripherals' },
          { id: 'com-a-s3', label: 'Shelf 3: Long HDMI/VGA Cable Spools', assignedCategory: 'Consumables' },
        ],
      },
      {
        id: 'cab-com-b',
        name: 'Cabinet COM-B (Technician Tools & Supplies)',
        description: 'Double-door lockable storage with modular plastic organizer bins',
        shelves: [
          { id: 'com-b-s1', label: 'Shelf 1: Anti-Static Mats & Screwdrivers', assignedCategory: 'Tools' },
          { id: 'com-b-s2', label: 'Shelf 2: Network Cable Testers & Tone Generators', assignedCategory: 'Tools' },
          { id: 'com-b-s3', label: 'Shelf 3: Ratchet Crimping Tools', assignedCategory: 'Tools' },
          { id: 'com-b-s4', label: 'Shelf 4: RJ45 Connectors & Boot Sleeves', assignedCategory: 'Consumables' },
        ],
      },
    ],
  },
  {
    lab: 'NETLAB',
    name: 'Networking Laboratory (Room 306)',
    roomNumber: 'Room 306',
    totalCapacityUnits: 25,
    activeUnitsCount: 0,
    cabinets: [
      {
        id: 'rack-net-01',
        name: 'Server Rack Alpha (42U Server Enclosure)',
        description: 'Standard 19-inch 4-post rack housing production routers, patch panels, and switch stacks',
        shelves: [
          { id: 'net-r1-s1', label: 'RU 01-12: Catalyst 2960-X Switches', assignedCategory: 'Routers' },
          { id: 'net-r1-s2', label: 'RU 13-24: Cisco 2911 ISR Routers', assignedCategory: 'Routers' },
          { id: 'net-r1-s3', label: 'RU 25-32: Patch Panels & Horizontal Cable Managers', assignedCategory: 'Routers' },
          { id: 'net-r1-s4', label: 'RU 33-42: Rackmount UPS & PDU Units', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'cab-net-tools',
        name: 'Cabinet NET-ToolSafe',
        description: 'Secure lockup for fiber cleavers, OTDR adapters, and Fluke network verifiers',
        shelves: [
          { id: 'net-t-s1', label: 'Shelf 1: Fluke MicroScanner2 & Certifiers', assignedCategory: 'Tools' },
          { id: 'net-t-s2', label: 'Shelf 2: Console Cables (RJ45 to USB/DB9)', assignedCategory: 'Consumables' },
          { id: 'net-t-s3', label: 'Floor Tier: 305m Cat6 Solid Copper Reels', assignedCategory: 'Consumables' },
        ],
      },
    ],
  },
  {
    lab: 'TESDA',
    name: 'TESDA Hardware Servicing Laboratory (Room 208)',
    roomNumber: 'Room 208',
    totalCapacityUnits: 20,
    activeUnitsCount: 0,
    cabinets: [
      {
        id: 'cab-tesda-tools',
        name: 'Cabinet TESDA-Tools (Electronics & Servicing)',
        description: 'Organized tool chests with magnetic tool holders and ESD bins',
        shelves: [
          { id: 'tes-t-s1', label: 'Shelf 1: Digital Multimeters & Clamp Meters', assignedCategory: 'Tools' },
          { id: 'tes-t-s2', label: 'Shelf 2: Hakko Digital Soldering Stations & Desoldering Pumps', assignedCategory: 'Tools' },
          { id: 'tes-t-s3', label: 'Shelf 3: Digital PSU Testers & POST Debug Cards', assignedCategory: 'Tools' },
          { id: 'tes-t-s4', label: 'Shelf 4: Precision Screwdriver Bits & Spudgers', assignedCategory: 'Tools' },
        ],
      },
      {
        id: 'cab-tesda-cons',
        name: 'Cabinet TESDA-Consumables (Supplies & Thermal Paste)',
        description: 'Vented storage for thermal paste, flux pens, solder wick, and isopropyl alcohol',
        shelves: [
          { id: 'tes-c-s1', label: 'Shelf 1: Arctic MX-4 Thermal Compounds', assignedCategory: 'Consumables' },
          { id: 'tes-c-s2', label: 'Shelf 2: Lead-Free 60/40 Solder Wire Spools', assignedCategory: 'Consumables' },
          { id: 'tes-c-s3', label: 'Shelf 3: Thermal Pads & Heat-Shrink Tubing', assignedCategory: 'Consumables' },
        ],
      },
    ],
  },
  {
    lab: 'MACLAB',
    name: 'Multimedia & Animation Laboratory (Room 302)',
    roomNumber: 'Room 302',
    totalCapacityUnits: 30,
    activeUnitsCount: 0,
    cabinets: [
      {
        id: 'cab-mac-workstations',
        name: 'Design Pods 1-6 (Creative Workstations)',
        description: 'Ergonomic pods equipped with Apple 24" iMac M3 Retina displays and drawing tablets',
        shelves: [
          { id: 'mac-w-s1', label: 'Pods 1-3: 3D Modeling & Animation Stations', assignedCategory: 'Computers' },
          { id: 'mac-w-s2', label: 'Pods 4-6: Video Rendering & Audio Suite', assignedCategory: 'Computers' },
          { id: 'mac-w-s3', label: 'Peripheral Locker: Wacom Intuos Pro Tablets', assignedCategory: 'Peripherals' },
        ],
      },
      {
        id: 'cab-mac-av',
        name: 'MACLAB Presentation Wall & Screening',
        description: 'High-definition 4K laser projector and calibrated color grading monitors',
        shelves: [
          { id: 'mac-av-s1', label: 'Ceiling Bracket: ViewSonic 4K Laser Projector', assignedCategory: 'Projectors' },
        ],
      },
    ],
  },
  {
    lab: 'CYBERLAB',
    name: 'Cybersecurity, Cloud & Server Operations Lab (Room 308)',
    roomNumber: 'Room 308',
    totalCapacityUnits: 20,
    activeUnitsCount: 0,
    cabinets: [
      {
        id: 'rack-cyber-alpha',
        name: 'Enterprise Server Rack Alpha (Isolated Network)',
        description: 'Air-conditioned server rack for virtualization nodes, firewalls, and core switches',
        shelves: [
          { id: 'cyb-r1-s1', label: 'RU 18-30: Dell PowerEdge R740 Proxmox Servers', assignedCategory: 'Computers' },
          { id: 'cyb-r1-s2', label: 'RU 12-16: Fortinet FortiGate 60F Firewalls', assignedCategory: 'Routers' },
          { id: 'cyb-r1-s3', label: 'RU 06-10: MikroTik 10G Cloud Core Routers', assignedCategory: 'Routers' },
        ],
      },
    ],
  },
  {
    lab: 'IOTLAB',
    name: 'IoT, Robotics & Embedded Systems Lab (Room 204)',
    roomNumber: 'Room 204',
    totalCapacityUnits: 25,
    activeUnitsCount: 0,
    cabinets: [
      {
        id: 'cab-iot-benches',
        name: 'Robotics Island & Workbenches',
        description: 'ESD-safe assembly benches with embedded mini PCs, oscilloscopes, and sensor modules',
        shelves: [
          { id: 'iot-b-s1', label: 'Stations 1-15: HP ProDesk Mini Embedded Testing PCs', assignedCategory: 'Computers' },
          { id: 'iot-b-s2', label: 'Measurement Shelf: Rigol 50MHz Digital Oscilloscopes', assignedCategory: 'Tools' },
          { id: 'iot-b-s3', label: 'Bins 01-35: Arduino & ESP32 Sensor Starter Kits', assignedCategory: 'Consumables' },
        ],
      },
    ],
  },
];
