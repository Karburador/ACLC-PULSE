import mongoose from 'mongoose';
import { AssetModel, IAsset } from '../models/Asset.js';
import { LoanModel, ILoan } from '../models/Loan.js';
import { MaintenanceModel, IMaintenance } from '../models/Maintenance.js';
import { LaboratoryModel } from '../models/Laboratory.js';

// Pre-seeded comprehensive data for ACLC College of Manila Laboratories:
// - COMLAB: 40 Workstations & supporting gear
// - NETLAB: 25 Networking racks, routers & switches
// - TESDA Hardware Lab: 20 Hardware maintenance & testing units
export const INITIAL_ASSETS = [
  // 1. COMLAB (Room 304 - 40 Units)
  {
    id: 'asset-com-01',
    assetTag: 'ACLC-COM-PC01',
    name: 'Dell OptiPlex 7090 Desktop Workstation',
    category: 'Computers',
    lab: 'COMLAB',
    status: 'Available',
    quantity: 40,
    availableQuantity: 36,
    unit: 'units',
    serialNumber: 'SN-COM-7090-001X',
    brandModel: 'Dell OptiPlex 7090 Tower',
    specs: 'Intel Core i7-11700, 16GB DDR4 RAM, 512GB NVMe SSD, Dual DisplayPort, Win 11 Pro',
    storageLocation: {
      rackOrCabinet: 'Row A-D Stations',
      shelf: 'Station Units 01-40',
      slot: 'Desk Mount',
    },
    acquisitionDate: '2024-06-15',
    lastMaintained: '2026-10-12',
    notes: 'Standard programming and database lab client unit.',
  },
  {
    id: 'asset-com-02',
    assetTag: 'ACLC-COM-PROJ01',
    name: 'Epson EB-FH52 4000-Lumen 1080p Projector',
    category: 'Projectors',
    lab: 'COMLAB',
    status: 'In Use',
    quantity: 2,
    availableQuantity: 1,
    unit: 'units',
    serialNumber: 'EP-EB-2023-019',
    brandModel: 'Epson EB-FH52',
    specs: 'Full HD 1080p, 4000 lumens, Miracast Wireless, HDMI/VGA',
    storageLocation: {
      rackOrCabinet: 'Cabinet COM-A',
      shelf: 'Shelf 1 (AV Gear)',
      slot: 'Ceiling & Backup',
    },
    acquisitionDate: '2023-11-10',
    lastMaintained: '2026-10-05',
    notes: 'Ceiling mount + backup portable instructor unit.',
  },
  {
    id: 'asset-com-03',
    assetTag: 'ACLC-COM-MON01',
    name: 'Dell 24" UltraSharp FHD IPS Monitor',
    category: 'Peripherals',
    lab: 'COMLAB',
    status: 'Available',
    quantity: 40,
    availableQuantity: 38,
    unit: 'units',
    serialNumber: 'SN-MN-2419-040',
    brandModel: 'Dell U2419H IPS',
    specs: '1080p 60Hz, 99% sRGB, Height & Pivot Adjustable Stand, HDMI/DP',
    storageLocation: {
      rackOrCabinet: 'Row A-D Stations',
      shelf: 'Display Arms',
      slot: 'Per Station',
    },
    acquisitionDate: '2024-06-15',
    lastMaintained: '2026-09-20',
  },
  {
    id: 'asset-com-04',
    assetTag: 'ACLC-COM-CRIMP01',
    name: 'Heavy-Duty RJ45/RJ11 Ratchet Crimping Tool',
    category: 'Tools',
    lab: 'COMLAB',
    status: 'Available',
    quantity: 12,
    availableQuantity: 10,
    unit: 'pcs',
    serialNumber: 'TL-CRIMP-012',
    brandModel: "Pro'sKit CP-376TR",
    specs: 'Ratchet mechanism, integrated cable stripper and cutter',
    storageLocation: {
      rackOrCabinet: 'Cabinet COM-B',
      shelf: 'Shelf 3 (Tools Box)',
      slot: 'Bin 4',
    },
    acquisitionDate: '2025-01-20',
    lastMaintained: '2026-08-14',
  },
  {
    id: 'asset-com-05',
    assetTag: 'ACLC-COM-RJ45',
    name: 'Cat6 Unshielded RJ45 Modular Plugs',
    category: 'Consumables',
    lab: 'COMLAB',
    status: 'Available',
    quantity: 450,
    availableQuantity: 450,
    unit: 'pcs',
    brandModel: 'AMP Netconnect Cat6 Gold-Plated',
    specs: '50-micron gold plated contacts, 8P8C pass-through',
    storageLocation: {
      rackOrCabinet: 'Cabinet COM-B',
      shelf: 'Shelf 4 (Consumables)',
      slot: 'Bin C-01',
    },
    acquisitionDate: '2026-02-10',
  },

  // 2. NETLAB (Room 306 - 25 Units)
  {
    id: 'asset-net-01',
    assetTag: 'ACLC-NET-RTR01',
    name: 'Cisco 2911 Integrated Services Router',
    category: 'Routers',
    lab: 'NETLAB',
    status: 'Available',
    quantity: 10,
    availableQuantity: 8,
    unit: 'units',
    serialNumber: 'FCZ1948B012',
    brandModel: 'Cisco ISR 2911/K9',
    specs: '3x GE ports, 4x EHWIC slots, 2x DSP slots, 512MB RAM, Cisco IOS 15.x',
    storageLocation: {
      rackOrCabinet: 'Server Rack 1 & 2',
      shelf: 'Rack Units 14-24',
      slot: 'Bay 1-10',
    },
    acquisitionDate: '2023-08-01',
    lastMaintained: '2026-10-18',
    notes: 'Used for CCNA Routing & Switching practical exams.',
  },
  {
    id: 'asset-net-02',
    assetTag: 'ACLC-NET-SW01',
    name: 'Cisco Catalyst 2960-X 24-Port Managed Switch',
    category: 'Routers',
    lab: 'NETLAB',
    status: 'Available',
    quantity: 15,
    availableQuantity: 12,
    unit: 'units',
    serialNumber: 'FCZ2042A890',
    brandModel: 'WS-C2960X-24TS-L',
    specs: '24x GigE ports, 4x 1G SFP uplinks, LAN Base feature set, FlexStack-Plus',
    storageLocation: {
      rackOrCabinet: 'Server Rack 1 & 2',
      shelf: 'Rack Units 04-12',
      slot: 'Bay 1-15',
    },
    acquisitionDate: '2023-08-01',
    lastMaintained: '2026-10-22',
  },
  {
    id: 'asset-net-03',
    assetTag: 'ACLC-NET-TEST01',
    name: 'Fluke Networks MicroScanner2 Cable Verifier',
    category: 'Tools',
    lab: 'NETLAB',
    status: 'Available',
    quantity: 4,
    availableQuantity: 2,
    unit: 'units',
    serialNumber: 'FLK-MS2-84920',
    brandModel: 'Fluke MS2-100',
    specs: 'Voice/Data/Video verification, wiremap, length, cable ID, tone generator',
    storageLocation: {
      rackOrCabinet: 'Cabinet NET-ToolSafe',
      shelf: 'Shelf 1 (Diagnostic Instruments)',
      slot: 'Case 02',
    },
    acquisitionDate: '2024-04-18',
    lastMaintained: '2026-09-02',
  },
  {
    id: 'asset-net-04',
    assetTag: 'ACLC-NET-CAB-UTP',
    name: 'Cat6 UTP Solid Pure Copper Cable Reel',
    category: 'Consumables',
    lab: 'NETLAB',
    status: 'Available',
    quantity: 5,
    availableQuantity: 3,
    unit: 'boxes (305m)',
    brandModel: 'Schneider Actassi Cat6 U/UTP',
    specs: '23 AWG, 250 MHz, Flame retardant PVC jacket, 305 meters reel',
    storageLocation: {
      rackOrCabinet: 'Cabinet NET-Consumables',
      shelf: 'Floor Base Tier',
      slot: 'Spool Holder',
    },
    acquisitionDate: '2026-01-15',
  },
  {
    id: 'asset-net-05',
    assetTag: 'ACLC-NET-PROJ01',
    name: 'BenQ MW560 WXGA Network Classroom Projector',
    category: 'Projectors',
    lab: 'NETLAB',
    status: 'Available',
    quantity: 1,
    availableQuantity: 1,
    unit: 'units',
    serialNumber: 'BQ-MW560-8819',
    brandModel: 'BenQ MW560',
    specs: '4000 ANSI Lumens, 20,000:1 Contrast, Dual HDMI, SmartEco Mode',
    storageLocation: {
      rackOrCabinet: 'NETLAB Podium',
      shelf: 'Top Rack',
      slot: 'Mount A',
    },
    acquisitionDate: '2024-05-19',
    lastMaintained: '2026-08-20',
  },

  // 3. TESDA Hardware Lab (Room 208 - 20 Units)
  {
    id: 'asset-tes-01',
    assetTag: 'ACLC-TES-TB01',
    name: 'Modular Hardware Assembly Bench Testbed Rig',
    category: 'Computers',
    lab: 'TESDA',
    status: 'Available',
    quantity: 20,
    availableQuantity: 18,
    unit: 'benches',
    serialNumber: 'TESDA-CSS-TB-020',
    brandModel: 'AeroCool Open Air Rig / ASUS Prime AM4',
    specs: 'AMD Ryzen 5 APU, 8GB DDR4, Modular PSU 550W, Open Acrylic Test Frame',
    storageLocation: {
      rackOrCabinet: 'Workbenches 1-10',
      shelf: 'Station A & B',
      slot: 'Bench Mount',
    },
    acquisitionDate: '2024-09-05',
    lastMaintained: '2026-10-28',
    notes: 'Used for TESDA CSS NC II Assessment & Troubleshooting tests.',
  },
  {
    id: 'asset-tes-02',
    assetTag: 'ACLC-TES-SOLD01',
    name: 'Hakko FX-888D Digital Soldering Station',
    category: 'Tools',
    lab: 'TESDA',
    status: 'Available',
    quantity: 10,
    availableQuantity: 8,
    unit: 'units',
    serialNumber: 'HK-FX888D-5930',
    brandModel: 'Hakko FX-888D 70W',
    specs: 'Digital temperature adjustment 50-480°C, ESD safe, ceramic heating element',
    storageLocation: {
      rackOrCabinet: 'Cabinet TESDA-Tools',
      shelf: 'Shelf 2 (Electronics & Soldering)',
      slot: 'Bay 1-10',
    },
    acquisitionDate: '2024-10-01',
    lastMaintained: '2026-09-15',
  },
  {
    id: 'asset-tes-03',
    assetTag: 'ACLC-TES-DMM01',
    name: 'Uni-T UT61E+ High-Precision Digital Multimeter',
    category: 'Tools',
    lab: 'TESDA',
    status: 'Available',
    quantity: 12,
    availableQuantity: 9,
    unit: 'units',
    serialNumber: 'UT-61E-202409',
    brandModel: 'UNI-T UT61E+ True RMS',
    specs: '22,000 count display, AC/DC voltage/current, resistance, capacitance, diode check',
    storageLocation: {
      rackOrCabinet: 'Cabinet TESDA-Tools',
      shelf: 'Shelf 1 (Measurement Instruments)',
      slot: 'Foam Tray A',
    },
    acquisitionDate: '2025-03-12',
    lastMaintained: '2026-09-18',
  },
  {
    id: 'asset-tes-04',
    assetTag: 'ACLC-TES-PASTE01',
    name: 'Arctic MX-4 High-Performance Thermal Compound',
    category: 'Consumables',
    lab: 'TESDA',
    status: 'Available',
    quantity: 24,
    availableQuantity: 19,
    unit: 'syringes (4g)',
    brandModel: 'Arctic MX-4 2019 Edition',
    specs: 'Carbon micro-particles, 8.5 W/(mK) thermal conductivity, non-conductive',
    storageLocation: {
      rackOrCabinet: 'Cabinet TESDA-Consumables',
      shelf: 'Shelf 3',
      slot: 'Chemical Tray',
    },
    acquisitionDate: '2026-01-20',
  },

  // 4. MACLAB (Room 302 - 30 Units)
  {
    id: 'asset-mac-01',
    assetTag: 'ACLC-MAC-IMAC01',
    name: 'Apple 24" iMac Retina 4.5K M3 Workstation',
    category: 'Computers',
    lab: 'MACLAB',
    status: 'Available',
    quantity: 30,
    availableQuantity: 28,
    unit: 'units',
    serialNumber: 'C02GK990Q05P',
    brandModel: 'Apple iMac 24" M3 Chip',
    specs: 'Apple M3 8-Core CPU / 10-Core GPU, 16GB Unified Memory, 512GB SSD, 4.5K Retina',
    storageLocation: {
      rackOrCabinet: 'Design Pods 1-6',
      shelf: 'Desks 01-30',
      slot: 'Station Mount',
    },
    acquisitionDate: '2024-11-15',
    lastMaintained: '2026-10-25',
  },
  {
    id: 'asset-mac-02',
    assetTag: 'ACLC-MAC-TAB01',
    name: 'Wacom Intuos Pro Medium Graphic Tablet',
    category: 'Peripherals',
    lab: 'MACLAB',
    status: 'Available',
    quantity: 25,
    availableQuantity: 22,
    unit: 'units',
    serialNumber: 'WCM-PTH660-8491',
    brandModel: 'Wacom Intuos Pro PTH-660',
    specs: '8192 levels pen pressure, multi-touch gesture support, Bluetooth & USB-C',
    storageLocation: {
      rackOrCabinet: 'Cabinet MAC-A',
      shelf: 'Shelf 2 (Drawing Peripherals)',
      slot: 'Locker 1-4',
    },
    acquisitionDate: '2025-02-01',
    lastMaintained: '2026-09-10',
  },
  {
    id: 'asset-mac-03',
    assetTag: 'ACLC-MAC-PROJ01',
    name: 'ViewSonic 4K UHD Short-Throw Laser Projector',
    category: 'Projectors',
    lab: 'MACLAB',
    status: 'Available',
    quantity: 1,
    availableQuantity: 1,
    unit: 'units',
    serialNumber: 'VS-LS830-4K-01',
    brandModel: 'ViewSonic LS830',
    specs: '4K UHD, 4500 ANSI Lumens, 0.23 Ultra-Short Throw ratio',
    storageLocation: {
      rackOrCabinet: 'MACLAB Presentation Wall',
      shelf: 'Ceiling Bracket',
      slot: 'Main Center',
    },
    acquisitionDate: '2024-12-01',
    lastMaintained: '2026-10-10',
  },

  // 5. CYBERLAB (Room 308 - 20 Units)
  {
    id: 'asset-cyb-01',
    assetTag: 'ACLC-CYB-SRV01',
    name: 'Dell PowerEdge R740 2U Enterprise Rack Server',
    category: 'Computers',
    lab: 'CYBERLAB',
    status: 'Available',
    quantity: 6,
    availableQuantity: 5,
    unit: 'units',
    serialNumber: 'SVC-TAG-89XN042',
    brandModel: 'Dell PowerEdge R740',
    specs: 'Dual Intel Xeon Silver 4214R, 128GB ECC DDR4, 4x 1.92TB SAS SSD RAID-10',
    storageLocation: {
      rackOrCabinet: 'Enterprise Server Rack Alpha',
      shelf: 'Rack Units 18-30',
      slot: 'Chassis 1-6',
    },
    acquisitionDate: '2024-03-20',
    lastMaintained: '2026-10-15',
  },
  {
    id: 'asset-cyb-02',
    assetTag: 'ACLC-CYB-FW01',
    name: 'Fortinet FortiGate 60F Enterprise Firewall',
    category: 'Routers',
    lab: 'CYBERLAB',
    status: 'Available',
    quantity: 4,
    availableQuantity: 4,
    unit: 'units',
    serialNumber: 'FGT60FTK2104819',
    brandModel: 'Fortinet FortiGate 60F',
    specs: 'SOC4 hardware acceleration, 10x GE RJ45, 1.4 Gbps IPS throughput',
    storageLocation: {
      rackOrCabinet: 'Enterprise Server Rack Alpha',
      shelf: 'Rack Unit 12',
      slot: 'Perimeter Bay',
    },
    acquisitionDate: '2024-07-11',
    lastMaintained: '2026-09-25',
  },
  {
    id: 'asset-cyb-03',
    assetTag: 'ACLC-CYB-MIKRO01',
    name: 'MikroTik CCR2004 16-Port 10G Cloud Core Router',
    category: 'Routers',
    lab: 'CYBERLAB',
    status: 'Available',
    quantity: 4,
    availableQuantity: 3,
    unit: 'units',
    serialNumber: 'MT-CCR2004-940',
    brandModel: 'MikroTik CCR2004-1G-12S+2XS',
    specs: 'Quad-Core AL32400 1.7GHz, 4GB RAM, 12x 10G SFP+ ports, 2x 25G SFP28 ports',
    storageLocation: {
      rackOrCabinet: 'Enterprise Server Rack Beta',
      shelf: 'Rack Unit 08',
      slot: 'Core Routing',
    },
    acquisitionDate: '2025-01-10',
    lastMaintained: '2026-10-02',
  },

  // 6. IOTLAB (Room 204 - 25 Units)
  {
    id: 'asset-iot-01',
    assetTag: 'ACLC-IOT-RIG01',
    name: 'HP ProDesk Mini Core i5 Embedded Test Station',
    category: 'Computers',
    lab: 'IOTLAB',
    status: 'Available',
    quantity: 15,
    availableQuantity: 14,
    unit: 'units',
    serialNumber: 'HP-PD600-9382',
    brandModel: 'HP ProDesk 600 G6 Mini',
    specs: 'Intel Core i5-10500T, 16GB RAM, 256GB SSD, Serial RS-232, GPIO Expansion',
    storageLocation: {
      rackOrCabinet: 'Robotics Island 1-3',
      shelf: 'Workbench Stations',
      slot: 'Vesa Mount',
    },
    acquisitionDate: '2025-03-01',
    lastMaintained: '2026-09-30',
  },
  {
    id: 'asset-iot-02',
    assetTag: 'ACLC-IOT-OSC01',
    name: 'Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope',
    category: 'Tools',
    lab: 'IOTLAB',
    status: 'Available',
    quantity: 8,
    availableQuantity: 6,
    unit: 'units',
    serialNumber: 'RGL-DS1054Z-2849',
    brandModel: 'Rigol DS1054Z',
    specs: '50 MHz Bandwidth, 4 Analog Channels, 1 GSa/s Real-time Sample Rate',
    storageLocation: {
      rackOrCabinet: 'Cabinet IOT-TestGear',
      shelf: 'Shelf 1 (Measurement Benches)',
      slot: 'Unit 1-8',
    },
    acquisitionDate: '2025-04-12',
    lastMaintained: '2026-08-15',
  },
  {
    id: 'asset-iot-03',
    assetTag: 'ACLC-IOT-KIT01',
    name: 'Advanced Arduino & ESP32 IoT Sensor Starter Kit',
    category: 'Consumables',
    lab: 'IOTLAB',
    status: 'Available',
    quantity: 35,
    availableQuantity: 30,
    unit: 'kits',
    brandModel: 'Elegoo & Espressif IoT Master Kit',
    specs: 'ESP32 Wi-Fi/BT Dev Board, 37 sensor modules (ultrasonic, temperature, PIR, OLED)',
    storageLocation: {
      rackOrCabinet: 'Cabinet IOT-Kits',
      shelf: 'Shelf 2 & 3',
      slot: 'Bin 01-35',
    },
    acquisitionDate: '2026-01-05',
  },
];

export const INITIAL_LOANS = [
  {
    id: 'loan-001',
    borrowerName: 'Juan Dela Cruz',
    borrowerIdNumber: '2023-MNL-0482',
    borrowerRole: 'Student',
    departmentSection: 'BSCS-3A',
    assetId: 'asset-net-03',
    assetTag: 'ACLC-NET-TEST01',
    assetName: 'Fluke Networks MicroScanner2 Cable Verifier',
    lab: 'NETLAB',
    quantity: 1,
    dateBorrowed: '2026-11-08',
    expectedReturnDate: '2026-11-10',
    status: 'Active',
    purpose: 'Network Architecture Cabling Capstone Defense Preparation',
    issuedBy: 'Engr. M. Santos (Custodian)',
  },
  {
    id: 'loan-002',
    borrowerName: 'Maria Clara Santos',
    borrowerIdNumber: '2024-MNL-1190',
    borrowerRole: 'TESDA Scholar',
    departmentSection: 'TVET-CSS-NCII',
    assetId: 'asset-tes-02',
    assetTag: 'ACLC-TES-SOLD01',
    assetName: 'Hakko FX-888D Digital Soldering Station',
    lab: 'TESDA',
    quantity: 1,
    dateBorrowed: '2026-11-04',
    expectedReturnDate: '2026-11-07',
    status: 'Overdue',
    purpose: 'Power Supply PCB SMD Component Replacement Lab Exercise',
    issuedBy: 'Prof. R. Bautista',
  },
  {
    id: 'loan-003',
    borrowerName: 'Prof. Roberto Bautista',
    borrowerIdNumber: 'FAC-2019-012',
    borrowerRole: 'Faculty',
    departmentSection: 'IT Department',
    assetId: 'asset-com-03',
    assetTag: 'ACLC-COM-PROJ01',
    assetName: 'Epson EB-FH52 4000-Lumen Projector',
    lab: 'COMLAB',
    quantity: 1,
    dateBorrowed: '2026-11-09',
    expectedReturnDate: '2026-11-11',
    status: 'Active',
    purpose: 'Multimedia Computing Lecture and Lab Demo',
    issuedBy: 'Admin Desk',
  },
  {
    id: 'loan-004',
    borrowerName: 'Carl Kenneth Reyes',
    borrowerIdNumber: '2023-MNL-0781',
    borrowerRole: 'Student',
    departmentSection: 'ACT-2B',
    assetId: 'asset-com-04',
    assetTag: 'ACLC-COM-CRIMP01',
    assetName: 'Heavy-Duty RJ45/RJ11 Ratchet Crimping Tool',
    lab: 'COMLAB',
    quantity: 2,
    dateBorrowed: '2026-11-02',
    expectedReturnDate: '2026-11-03',
    dateReturned: '2026-11-03',
    status: 'Returned',
    purpose: 'Data Communications Lab Exercise #4',
    issuedBy: 'Engr. M. Santos',
    returnedNotes: 'Returned in good operating condition with blades intact.',
  },
];

export const INITIAL_MAINTENANCE = [
  {
    id: 'maint-001',
    title: 'COMLAB PC Imaging & Windows 11 Cumulative Update',
    assetId: 'asset-com-01',
    assetTag: 'ACLC-COM-WS01',
    lab: 'COMLAB',
    type: 'PC Re-imaging',
    column: 'Under Repair',
    priority: 'High',
    scheduledDate: '2026-11-12',
    assignedTechnician: 'Tech. Alan Villanueva',
    description: 'Deploy clean Windows 11 sysprep image containing Visual Studio, NetBeans, MySQL Server, and packet tracer across 40 workstations.',
    diagnosis: 'Previous OS profile bloated with temp files from database course.',
    costEstimate: 0,
  },
  {
    id: 'maint-002',
    title: 'NETLAB Cisco Switch 2960-X Firmware Hardening',
    assetId: 'asset-net-02',
    assetTag: 'ACLC-NET-SW01',
    lab: 'NETLAB',
    type: 'Network Audit',
    column: 'Reported',
    priority: 'Medium',
    scheduledDate: '2026-11-15',
    assignedTechnician: 'Engr. Michael Santos',
    description: 'Update Cisco IOS-XE security baseline, disable unused telnet ports, and re-flash VLAN database for incoming networking batch.',
    costEstimate: 0,
  },
  {
    id: 'maint-003',
    title: 'TESDA PSU Tester #3 Display Backlight Failure',
    assetId: 'asset-tes-05',
    assetTag: 'ACLC-TES-PSUTEST01',
    lab: 'TESDA',
    type: 'Hardware Repair',
    column: 'Diagnosed',
    priority: 'High',
    scheduledDate: '2026-11-10',
    assignedTechnician: 'Tech. Dennis Ocampo',
    description: 'LCD panel remains blank while testing rail voltage signals.',
    diagnosis: 'Loose ribbon cable connector and blown surface-mount SMD diode on power intake.',
    costEstimate: 450,
  },
  {
    id: 'maint-004',
    title: 'Quarterly Optical Laser Sensor Clean & Filter Replacement',
    assetId: 'asset-com-03',
    assetTag: 'ACLC-COM-PROJ01',
    lab: 'COMLAB',
    type: 'Routine Preventive',
    column: 'Replaced/Retired',
    priority: 'Low',
    scheduledDate: '2026-10-30',
    assignedTechnician: 'Tech. Dennis Ocampo',
    description: 'Exhaust dust filter vacuuming and lamp cooling channel cleaning.',
    diagnosis: 'Dust buildup mitigated before thermal throttling occurred.',
    completedDate: '2026-10-31',
    costEstimate: 200,
  },
];

export const LAB_STORAGE_LAYOUTS = [
  {
    lab: 'COMLAB',
    name: 'Computer Laboratory (Room 304)',
    totalCapacityUnits: 40,
    activeUnitsCount: 40,
    cabinets: [
      {
        id: 'cab-com-a',
        name: 'Cabinet COM-A (AV & Projector Depot)',
        description: 'Enclosed steel cabinet for AV peripherals, HDMI extenders, and wireless presenters',
        shelves: [
          { id: 'com-a-s1', label: 'Shelf 1: Projectors & Lenses', assignedCategory: 'Equipment' },
          { id: 'com-a-s2', label: 'Shelf 2: Presentation Accessories & Remotes', assignedCategory: 'Equipment' },
          { id: 'com-a-s3', label: 'Shelf 3: Long HDMI/VGA Cable Spools', assignedCategory: 'Consumable Materials' },
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
          { id: 'com-b-s4', label: 'Shelf 4: RJ45 Connectors & Boot Sleeves', assignedCategory: 'Consumable Materials' },
        ],
      },
    ],
  },
  {
    lab: 'NETLAB',
    name: 'Networking Laboratory (Room 306)',
    totalCapacityUnits: 25,
    activeUnitsCount: 25,
    cabinets: [
      {
        id: 'rack-net-01',
        name: 'Server Rack Alpha (42U Server Enclosure)',
        description: 'Standard 19-inch 4-post rack housing production routers, patch panels, and switch stacks',
        shelves: [
          { id: 'net-r1-s1', label: 'RU 01-12: Catalyst 2960-X Switches', assignedCategory: 'Equipment' },
          { id: 'net-r1-s2', label: 'RU 13-24: Cisco 2911 ISR Routers', assignedCategory: 'Equipment' },
          { id: 'net-r1-s3', label: 'RU 25-32: Patch Panels & Horizontal Cable Managers', assignedCategory: 'Equipment' },
          { id: 'net-r1-s4', label: 'RU 33-42: Rackmount UPS & PDU Units', assignedCategory: 'Equipment' },
        ],
      },
      {
        id: 'cab-net-tools',
        name: 'Cabinet NET-ToolSafe',
        description: 'Secure lockup for fiber cleavers, OTDR adapters, and Fluke network verifiers',
        shelves: [
          { id: 'net-t-s1', label: 'Shelf 1: Fluke MicroScanner2 & Certifiers', assignedCategory: 'Tools' },
          { id: 'net-t-s2', label: 'Shelf 2: Console Cables (RJ45 to USB/DB9)', assignedCategory: 'Consumable Materials' },
          { id: 'net-t-s3', label: 'Floor Tier: 305m Cat6 Solid Copper Reels', assignedCategory: 'Consumable Materials' },
        ],
      },
    ],
  },
  {
    lab: 'TESDA',
    name: 'TESDA Hardware Servicing Laboratory (Room 208)',
    totalCapacityUnits: 20,
    activeUnitsCount: 20,
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
    activeUnitsCount: 30,
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
    activeUnitsCount: 20,
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
    activeUnitsCount: 25,
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

export interface MemoryLoan {
  id: string;
  borrowerName: string;
  borrowerIdNumber: string;
  borrowerRole: string;
  departmentSection: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  lab: string;
  quantity: number;
  dateBorrowed: string;
  expectedReturnDate: string;
  dateReturned?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  purpose: string;
  issuedBy: string;
  returnedNotes?: string;
}

export const DEFAULT_LABORATORIES = [
  {
    code: 'COMLAB',
    name: 'Computer Programming & Applications Lab',
    roomNumber: 'Room 304',
    capacity: 40,
    description: 'Dell OptiPlex Core i7 Workstations, 24" UltraSharp monitors, classroom projector, and network cabling tools.',
    isCustom: false,
  },
  {
    code: 'NETLAB',
    name: 'Cisco CCNA Networking Lab',
    roomNumber: 'Room 306',
    capacity: 25,
    description: 'Cisco 2911 ISR routers, Catalyst 2960-X 24-port switches, Fluke MicroScanner2 verifiers, and 42U rack units.',
    isCustom: false,
  },
  {
    code: 'TESDA',
    name: 'Computer Systems Servicing (CSS NC II) Hardware Lab',
    roomNumber: 'Room 208',
    capacity: 20,
    description: 'Modular assembly test beds, Hakko digital soldering stations, Uni-T multimeters, and component diagnosis benches.',
    isCustom: false,
  },
  {
    code: 'MACLAB',
    name: 'Multimedia & Graphic Design Studio',
    roomNumber: 'Room 302',
    capacity: 30,
    description: 'Apple iMac 24" 4.5K Retina M3, Wacom Cintiq 16 Pro pen displays, ViewSonic 4K laser projector, and studio gear.',
    isCustom: false,
  },
  {
    code: 'CYBERLAB',
    name: 'Cybersecurity, Cloud & Server Operations Lab',
    roomNumber: 'Room 308',
    capacity: 20,
    description: 'Dell PowerEdge R750 dual Xeon servers, Fortinet FortiGate firewalls, MikroTik 10G routers, and fiber diagnostics.',
    isCustom: false,
  },
  {
    code: 'IOTLAB',
    name: 'IoT, Robotics & Embedded Systems Lab',
    roomNumber: 'Room 204',
    capacity: 25,
    description: 'Raspberry Pi 5 Developer Stations, Arduino Mega kits, Rigol digital oscilloscopes, and smart sensor kits.',
    isCustom: false,
  },
];

// In-Memory Fallback State (automatically used if MongoDB Atlas is not yet configured,
// ensuring the application runs out-of-the-box seamlessly in AI Studio dev environment)
let memoryAssets: any[] = [...INITIAL_ASSETS];
let memoryLoans: MemoryLoan[] = [...INITIAL_LOANS] as MemoryLoan[];
let memoryMaintenance: any[] = [...INITIAL_MAINTENANCE];
let memoryLaboratories: any[] = [...DEFAULT_LABORATORIES];
let isMongoConnected = false;

export function isValidMongoUri(uri?: string): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    return false;
  }
  const placeholders = [
    'username:password',
    '<username>',
    '<password>',
    '<cluster>',
    'MY_MONGO_URI',
    'your_mongodb_uri',
    'cluster.mongodb.net',
  ];
  return !placeholders.some((ph) => trimmed.includes(ph));
}

export async function initDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  const mongoUri = process.env.MONGO_URI;

  if (!isValidMongoUri(mongoUri)) {
    isMongoConnected = false;
    return {
      connected: false,
      message: 'Running in Local Storage Engine mode with pre-seeded ACLC Manila laboratory units (COMLAB: 40, NETLAB: 25, TESDA: 20). Set MONGO_URI in Render to connect live MongoDB Atlas.',
    };
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      return { connected: true, message: 'Connected to MongoDB Atlas database.' };
    }

    await mongoose.connect(mongoUri!, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;

    // Seed database if empty
    const count = await AssetModel.countDocuments();
    if (count === 0) {
      await (AssetModel as any).insertMany(INITIAL_ASSETS);
      await (LoanModel as any).insertMany(INITIAL_LOANS);
      await (MaintenanceModel as any).insertMany(INITIAL_MAINTENANCE);
    }

    const labCount = await (LaboratoryModel as any).countDocuments();
    if (labCount === 0) {
      await (LaboratoryModel as any).insertMany(DEFAULT_LABORATORIES);
    }

    return { connected: true, message: 'Successfully connected and verified MongoDB Atlas instance.' };
  } catch (err: any) {
    isMongoConnected = false;
    return {
      connected: false,
      message: `Safe fallback mode active with in-memory persistence (${err.message}).`,
    };
  }
}

export const DataStore = {
  isAtlasConnected: () => isMongoConnected,

  // ASSETS
  async getAssets(lab?: string, search?: string, category?: string, status?: string) {
    if (isMongoConnected) {
      const query: any = {};
      if (lab && lab !== 'ALL') query.lab = lab;
      if (category && category !== 'ALL') query.category = category;
      if (status && status !== 'ALL') query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { assetTag: { $regex: search, $options: 'i' } },
          { brandModel: { $regex: search, $options: 'i' } },
          { serialNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const docs = await AssetModel.find(query).sort({ updatedAt: -1 }).lean();
      return docs.map((d: any) => ({ ...d, id: d._id ? d._id.toString() : d.id }));
    }

    // In-memory fallback
    let list = [...memoryAssets];
    if (lab && lab !== 'ALL') list = list.filter((a) => a.lab === lab);
    if (category && category !== 'ALL') list = list.filter((a) => a.category === category);
    if (status && status !== 'ALL') list = list.filter((a) => a.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetTag.toLowerCase().includes(q) ||
          (a.brandModel && a.brandModel.toLowerCase().includes(q)) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getAssetById(id: string) {
    if (isMongoConnected) {
      try {
        const doc = await (AssetModel as any).findById(id).lean();
        if (doc) return { ...doc, id: doc._id.toString() };
      } catch {
        const byTag = await (AssetModel as any).findOne({ assetTag: id }).lean();
        if (byTag) return { ...byTag, id: byTag._id.toString() };
      }
    }
    return memoryAssets.find((a) => a.id === id || a.assetTag === id) || null;
  },

  async createAsset(data: any) {
    const assetTag = data.assetTag || `ACLC-${data.lab || 'GEN'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAsset = {
      ...data,
      assetTag: assetTag.toUpperCase().trim(),
      quantity: Number(data.quantity) || 1,
      availableQuantity: Number(data.availableQuantity !== undefined ? data.availableQuantity : data.quantity),
      status: data.status || 'Available',
      storageLocation: data.storageLocation || { rackOrCabinet: 'Main Depot', shelf: 'Shelf 1' },
    };

    if (isMongoConnected) {
      const created = await AssetModel.create(newAsset);
      return { ...created.toObject(), id: created._id.toString() };
    }

    const localAsset = {
      ...newAsset,
      id: `asset-${Date.now()}`,
    };
    memoryAssets.unshift(localAsset);
    return localAsset;
  },

  async updateAsset(id: string, updates: any) {
    if (isMongoConnected) {
      try {
        const updated = await (AssetModel as any).findByIdAndUpdate(id, updates, { new: true }).lean();
        if (updated) return { ...updated, id: updated._id.toString() };
      } catch {}
    }

    const index = memoryAssets.findIndex((a) => a.id === id || a.assetTag === id);
    if (index !== -1) {
      memoryAssets[index] = { ...memoryAssets[index], ...updates };
      return memoryAssets[index];
    }
    return null;
  },

  async deleteAsset(id: string) {
    if (isMongoConnected) {
      try {
        await (AssetModel as any).findByIdAndDelete(id);
        return true;
      } catch {}
    }

    const initialLength = memoryAssets.length;
    memoryAssets = memoryAssets.filter((a) => a.id !== id && a.assetTag !== id);
    return memoryAssets.length < initialLength;
  },

  // LOANS / DISPENSING
  async getLoans(lab?: string, status?: string) {
    // Auto-update overdue status on inspection
    const today = new Date().toISOString().split('T')[0];

    if (isMongoConnected) {
      const query: any = {};
      if (lab && lab !== 'ALL') query.lab = lab;
      if (status && status !== 'ALL') query.status = status;
      const docs = await LoanModel.find(query).sort({ createdAt: -1 }).lean();
      return docs.map((d: any) => {
        let currentStatus = d.status;
        if (currentStatus === 'Active' && d.expectedReturnDate < today) {
          currentStatus = 'Overdue';
        }
        return { ...d, id: d._id ? d._id.toString() : d.id, status: currentStatus };
      });
    }

    let list = memoryAssets.length ? memoryLoans : [];
    // Mark overdue in memory
    list = list.map((l) => {
      if (l.status === 'Active' && l.expectedReturnDate < today) {
        return { ...l, status: 'Overdue' as const };
      }
      return l;
    });
    memoryLoans = list;

    if (lab && lab !== 'ALL') list = list.filter((l) => l.lab === lab);
    if (status && status !== 'ALL') list = list.filter((l) => l.status === status);
    return list;
  },

  async createLoan(data: any) {
    const qty = Number(data.quantity) || 1;
    // Deduct available quantity from target asset
    const asset = await this.getAssetById(data.assetId);
    if (asset) {
      const newAvail = Math.max(0, (asset.availableQuantity || 0) - qty);
      const newStatus = newAvail === 0 ? 'In Use' : asset.status;
      await this.updateAsset(asset.id, {
        availableQuantity: newAvail,
        status: newStatus,
      });
    }

    const newLoan = {
      ...data,
      quantity: qty,
      dateBorrowed: data.dateBorrowed || new Date().toISOString().split('T')[0],
      status: 'Active',
      issuedBy: data.issuedBy || 'Lab Custodian',
    };

    if (isMongoConnected) {
      const created = await LoanModel.create(newLoan);
      return { ...created.toObject(), id: created._id.toString() };
    }

    const localLoan = {
      ...newLoan,
      id: `loan-${Date.now()}`,
    };
    memoryLoans.unshift(localLoan);
    return localLoan;
  },

  async returnLoan(id: string, notes?: string) {
    const today = new Date().toISOString().split('T')[0];
    let loanRecord: any = null;

    if (isMongoConnected) {
      loanRecord = await (LoanModel as any).findById(id);
      if (loanRecord) {
        loanRecord.status = 'Returned';
        loanRecord.dateReturned = today;
        if (notes) loanRecord.returnedNotes = notes;
        await loanRecord.save();
      }
    } else {
      const idx = memoryLoans.findIndex((l) => l.id === id);
      if (idx !== -1) {
        memoryLoans[idx] = {
          ...memoryLoans[idx],
          status: 'Returned',
          dateReturned: today,
          returnedNotes: notes || memoryLoans[idx].returnedNotes,
        };
        loanRecord = memoryLoans[idx];
      }
    }

    if (loanRecord) {
      // Restore asset available quantity
      const asset = await this.getAssetById(loanRecord.assetId);
      if (asset) {
        const restoredQty = (asset.availableQuantity || 0) + (loanRecord.quantity || 1);
        await this.updateAsset(asset.id, {
          availableQuantity: Math.min(asset.quantity, restoredQty),
          status: 'Available',
        });
      }
    }

    return loanRecord;
  },

  // MAINTENANCE & KANBAN
  async getMaintenanceTasks(lab?: string) {
    if (isMongoConnected) {
      const query: any = {};
      if (lab && lab !== 'ALL') query.lab = lab;
      const docs = await MaintenanceModel.find(query).sort({ scheduledDate: 1 }).lean();
      return docs.map((d: any) => ({ ...d, id: d._id ? d._id.toString() : d.id }));
    }

    let list = [...memoryMaintenance];
    if (lab && lab !== 'ALL') list = list.filter((m) => m.lab === lab);
    return list;
  },

  async createMaintenanceTask(data: any) {
    const newTask = {
      ...data,
      column: data.column || 'Reported',
      priority: data.priority || 'Medium',
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      costEstimate: Number(data.costEstimate) || 0,
    };

    // If an asset is linked and task is under repair or diagnosed, sync asset status
    if (newTask.assetId) {
      await this.updateAsset(newTask.assetId, {
        status: newTask.column === 'Replaced/Retired' ? 'Archived' : 'Under Maintenance',
      });
    }

    if (isMongoConnected) {
      const created = await MaintenanceModel.create(newTask);
      return { ...created.toObject(), id: created._id.toString() };
    }

    const localTask = {
      ...newTask,
      id: `maint-${Date.now()}`,
    };
    memoryMaintenance.push(localTask);
    return localTask;
  },

  async updateMaintenanceTask(id: string, updates: any) {
    if (isMongoConnected) {
      try {
        const updated = await (MaintenanceModel as any).findByIdAndUpdate(id, updates, { new: true }).lean();
        if (updated) return { ...updated, id: updated._id.toString() };
      } catch {}
    }

    const index = memoryMaintenance.findIndex((m) => m.id === id);
    if (index !== -1) {
      memoryMaintenance[index] = { ...memoryMaintenance[index], ...updates };
      // If moved to Replaced/Retired or Diagnosed, optionally reflect on asset
      if (updates.column === 'Replaced/Retired' && memoryMaintenance[index].assetId) {
        await this.updateAsset(memoryMaintenance[index].assetId!, { status: 'Available' });
      }
      return memoryMaintenance[index];
    }
    return null;
  },

  async deleteMaintenanceTask(id: string) {
    if (isMongoConnected) {
      try {
        await (MaintenanceModel as any).findByIdAndDelete(id);
        return true;
      } catch {}
    }

    const initialLen = memoryMaintenance.length;
    memoryMaintenance = memoryMaintenance.filter((m) => m.id !== id);
    return memoryMaintenance.length < initialLen;
  },

  // STORAGE LAYOUTS
  getStorageLayouts(lab?: string) {
    if (lab && lab !== 'ALL') {
      return LAB_STORAGE_LAYOUTS.filter((l) => l.lab === lab);
    }
    return LAB_STORAGE_LAYOUTS;
  },

  // SUMMARY AUDIT & METRICS
  async getMetrics(lab?: string) {
    const assets = await this.getAssets(lab);
    const loans = await this.getLoans(lab);
    const maintenance = await this.getMaintenanceTasks(lab);

    const totalAssets = assets.reduce((acc, a) => acc + (a.quantity || 1), 0);
    const availableAssets = assets.reduce((acc, a) => acc + (a.availableQuantity || 0), 0);
    const inUseAssets = assets.filter((a) => a.status === 'In Use').reduce((acc, a) => acc + (a.quantity - a.availableQuantity), 0);
    const damagedAssets = assets.filter((a) => a.status === 'Damaged').reduce((acc, a) => acc + a.quantity, 0);
    const activeLoans = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue').length;
    const overdueLoans = loans.filter((l) => l.status === 'Overdue').length;
    const pendingMaintenance = maintenance.filter((m) => m.column !== 'Replaced/Retired').length;

    return {
      totalAssets,
      availableAssets,
      inUseAssets: inUseAssets > 0 ? inUseAssets : (totalAssets - availableAssets),
      damagedAssets,
      activeLoans,
      overdueLoans,
      pendingMaintenance,
      totalAssetItemsCount: assets.length,
      isAtlasConnected: isMongoConnected,
    };
  },

  // LABORATORY MANAGEMENT (Dynamic Add, Edit, Delete)
  async getLaboratories() {
    let labs: any[] = [];
    if (isMongoConnected) {
      labs = await (LaboratoryModel as any).find({}).sort({ code: 1 }).lean();
      if (labs.length === 0) {
        await (LaboratoryModel as any).insertMany(DEFAULT_LABORATORIES);
        labs = await (LaboratoryModel as any).find({}).sort({ code: 1 }).lean();
      }
    } else {
      labs = [...memoryLaboratories];
    }

    // Enrich with live counts from current assets
    const assets = await this.getAssets();
    return labs.map((l: any) => {
      const labAssets = assets.filter((a: any) => a.lab?.toUpperCase() === l.code?.toUpperCase());
      const totalUnits = labAssets.reduce((sum: number, a: any) => sum + (a.quantity || 0), 0);
      const availableUnits = labAssets.reduce((sum: number, a: any) => sum + (a.availableQuantity || 0), 0);
      return {
        ...l,
        id: l._id ? l._id.toString() : l.code,
        totalAssets: labAssets.length,
        activeUnitsCount: totalUnits,
        availableUnitsCount: availableUnits,
      };
    });
  },

  async createLaboratory(data: { code: string; name: string; roomNumber: string; capacity?: number; description?: string }) {
    const code = (data.code || '').toUpperCase().trim();
    if (!code) throw new Error('Laboratory code identifier is required (e.g. ROBOTICS)');

    const existing = isMongoConnected
      ? await (LaboratoryModel as any).findOne({ code }).lean()
      : memoryLaboratories.find((l) => l.code.toUpperCase() === code);

    if (existing) {
      throw new Error(`Laboratory code "${code}" already exists.`);
    }

    const newLab = {
      code,
      name: data.name?.trim() || `${code} Laboratory`,
      roomNumber: data.roomNumber?.trim() || 'Room TBD',
      capacity: Number(data.capacity) || 30,
      description: data.description?.trim() || `Facility for ${code}`,
      isCustom: true,
    };

    if (isMongoConnected) {
      const created = await (LaboratoryModel as any).create(newLab);
      return { ...created.toObject(), id: created._id.toString() };
    }

    memoryLaboratories.push(newLab);

    // Also add a default storage layout for this laboratory so Storage Visualizer works
    LAB_STORAGE_LAYOUTS.push({
      lab: code,
      name: `${newLab.name} (${newLab.roomNumber})`,
      roomNumber: newLab.roomNumber,
      totalCapacityUnits: newLab.capacity,
      activeUnitsCount: 0,
      cabinets: [
        {
          id: `cabinet-${code.toLowerCase()}-1`,
          name: `Cabinet ${code}-A`,
          description: `Primary equipment and tools cabinet for ${newLab.name}`,
          shelves: [
            { id: `shelf-${code.toLowerCase()}-1`, label: 'Shelf 1 - Primary Equipment', assignedCategory: 'Computers' },
            { id: `shelf-${code.toLowerCase()}-2`, label: 'Shelf 2 - Tools & Hardware', assignedCategory: 'Tools' },
            { id: `shelf-${code.toLowerCase()}-3`, label: 'Shelf 3 - Consumables & Accessories', assignedCategory: 'Consumables' },
          ],
        },
      ],
    });

    return newLab;
  },

  async updateLaboratory(code: string, updates: Partial<{ name: string; roomNumber: string; capacity: number; description: string }>) {
    const upperCode = code.toUpperCase().trim();
    if (isMongoConnected) {
      const updated = await (LaboratoryModel as any).findOneAndUpdate(
        { code: upperCode },
        { ...updates },
        { new: true }
      ).lean();
      if (updated) return { ...updated, id: updated._id.toString() };
    }

    const idx = memoryLaboratories.findIndex((l) => l.code.toUpperCase() === upperCode);
    if (idx !== -1) {
      memoryLaboratories[idx] = { ...memoryLaboratories[idx], ...updates };
      return memoryLaboratories[idx];
    }
    throw new Error(`Laboratory "${code}" not found.`);
  },

  async deleteLaboratory(code: string, force: boolean = false) {
    const upperCode = code.toUpperCase().trim();
    const assets = await this.getAssets(upperCode);

    if (assets.length > 0 && !force) {
      return {
        success: false,
        requiresConfirmation: true,
        assetCount: assets.length,
        message: `Laboratory "${upperCode}" has ${assets.length} registered asset item(s). Confirm force delete to remove the lab and its items.`,
      };
    }

    if (force && assets.length > 0) {
      if (isMongoConnected) {
        await (AssetModel as any).deleteMany({ lab: upperCode });
        await (LoanModel as any).deleteMany({ lab: upperCode });
        await (MaintenanceModel as any).deleteMany({ lab: upperCode });
      } else {
        memoryAssets = memoryAssets.filter((a) => a.lab?.toUpperCase() !== upperCode);
        memoryLoans = memoryLoans.filter((l) => l.lab?.toUpperCase() !== upperCode);
        memoryMaintenance = memoryMaintenance.filter((m) => m.lab?.toUpperCase() !== upperCode);
      }
    }

    if (isMongoConnected) {
      await (LaboratoryModel as any).findOneAndDelete({ code: upperCode });
    }

    memoryLaboratories = memoryLaboratories.filter((l) => l.code.toUpperCase() !== upperCode);

    const layoutIdx = LAB_STORAGE_LAYOUTS.findIndex((l) => l.lab.toUpperCase() === upperCode);
    if (layoutIdx !== -1) {
      LAB_STORAGE_LAYOUTS.splice(layoutIdx, 1);
    }

    return {
      success: true,
      message: `Laboratory "${upperCode}" and its associated assets have been removed.`,
    };
  },

  // RESET SEED / WIPE DATA TO 0
  async resetToDefaults() {
    memoryAssets = [...INITIAL_ASSETS];
    memoryLoans = [...INITIAL_LOANS] as MemoryLoan[];
    memoryMaintenance = [...INITIAL_MAINTENANCE];
    memoryLaboratories = [...DEFAULT_LABORATORIES];

    if (isMongoConnected) {
      await (AssetModel as any).deleteMany({});
      await (LoanModel as any).deleteMany({});
      await (MaintenanceModel as any).deleteMany({});
      await (LaboratoryModel as any).deleteMany({});

      await (AssetModel as any).insertMany(INITIAL_ASSETS);
      await (LoanModel as any).insertMany(INITIAL_LOANS);
      await (MaintenanceModel as any).insertMany(INITIAL_MAINTENANCE);
      await (LaboratoryModel as any).insertMany(DEFAULT_LABORATORIES);
    }
    return { success: true, message: 'Reset back to default ACLC Manila lab catalog (6 labs, 160 core equipment units).' };
  },

  async wipeAllData() {
    memoryAssets = [];
    memoryLoans = [];
    memoryMaintenance = [];

    if (isMongoConnected) {
      await (AssetModel as any).deleteMany({});
      await (LoanModel as any).deleteMany({});
      await (MaintenanceModel as any).deleteMany({});
    }
    return { success: true, message: 'All assets, loans, and maintenance tickets have been deleted. Database is back to 0.' };
  },
};
