import { TraineeProfile, StoragePlan, CompetencyModule, EvidenceItem } from './types';

export const STORAGE_PLANS: StoragePlan[] = [
  {
    id: 'basic',
    name: 'Basic Repository',
    priceKes: 750,
    limitBytes: 2 * 1024 * 1024 * 1024, // 2 GB
    limitLabel: '2 GB',
    features: [
      '2 GB Secure Encrypted Storage',
      'PDF & Image Upload Capability',
      'Single Assessor Review Routing',
      'Basic Performance Dashboard',
      'Standard Support Ticketing'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Vault',
    priceKes: 1000,
    limitBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    limitLabel: '5 GB',
    features: [
      '5 GB High-Speed Storage',
      'HD Video Evidence Processing',
      'Live Trainer Correction Feed',
      'AI-Powered Reflection Assistant',
      'Instant Competency Badge Generation'
    ],
    badge: 'Recommended'
  },
  {
    id: 'advanced',
    name: 'Advanced Matrix',
    priceKes: 1500,
    limitBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    limitLabel: '10 GB',
    features: [
      '10 GB Massive Data Capacity',
      'Engineering Project Bundles',
      'Direct National Verification Line',
      'Full Portfolio PDF Export',
      'Priority Ministerial Verification Routing'
    ]
  }
];

export const MOCK_PROFILES: TraineeProfile[] = [
  {
    id: 'student-1',
    registrationNumber: 'IN/001/2026',
    fullName: 'Odhiambo Vans',
    nationalId: '34567890',
    institution: 'Nairobi Technical Training Institute',
    courseName: 'Diploma in Information Communication Technology (ICT)',
    email: 'odhiambovanso2003@gmail.com',
    storagePlanId: 'standard',
    storageUsedBytes: 1.45 * 1024 * 1024 * 1024, // 1.45 GB
    active: true
  },
  {
    id: 'student-2',
    registrationNumber: 'KCNP/EE/2026/1023',
    fullName: 'Amina Hussein',
    nationalId: '35123456',
    institution: 'The Kenya Coast National Polytechnic',
    courseName: 'Diploma in Electrical Engineering',
    email: 'amina.hussein@gmail.com',
    storagePlanId: 'basic',
    storageUsedBytes: 0.65 * 1024 * 1024 * 1024, // 0.65 GB
    active: true
  },
  {
    id: 'student-3',
    registrationNumber: 'KNP/AE/2026/3041',
    fullName: 'Wycliffe Barasa',
    nationalId: '36789012',
    institution: 'Kisumu National Polytechnic',
    courseName: 'Diploma in Automotive Engineering',
    email: 'wycliffe.barasa@gmail.com',
    storagePlanId: 'advanced',
    storageUsedBytes: 4.8 * 1024 * 1024 * 1024, // 4.8 GB
    active: true
  }
];

export const COURSE_MODULES: Record<string, CompetencyModule[]> = {
  'Diploma in Information Communication Technology (ICT)': [
    {
      code: 'ICT-01',
      name: 'Perform Computer Troubleshooting & Maintenance',
      description: 'Diagnose hardware failures, replace processing units, perform cooling fan lubrication, and install primary operations software.',
      credits: 6,
      status: 'competent'
    },
    {
      code: 'ICT-02',
      name: 'Design & Administer Local Area Networks',
      description: 'Crimp CAT6 cables, design IP addressing schemes, mount patch panels, configure managed switches, and establish firewall rules.',
      credits: 8,
      status: 'ongoing'
    },
    {
      code: 'ICT-03',
      name: 'Web Application Development & Database Integration',
      description: 'Develop structured dynamic endpoints, write secure SQL procedures, create schema architectures, and deploy complete systems.',
      credits: 10,
      status: 'not_started'
    }
  ],
  'Diploma in Electrical Engineering': [
    {
      code: 'EE-01',
      name: 'Install Electrical Conduits & Cable Trays',
      description: 'Execute bend designs on metal conduits, lay heavy cables, route wire networks along industrial structures, and perform ground resistance tests.',
      credits: 6,
      status: 'competent'
    },
    {
      code: 'EE-02',
      name: 'Winding & Testing Electrical Machines',
      description: 'Calculate copper wire dimensions, wind stator coils, insert slot insulations, test winding integrity, and perform load testing on induction motors.',
      credits: 8,
      status: 'ongoing'
    },
    {
      code: 'EE-03',
      name: 'Industrial Automation & PLC Troubleshooting',
      description: 'Design ladder diagrams, wire PLC input/output blocks, interface sensors and actuators, and configure safety stop relays.',
      credits: 10,
      status: 'not_started'
    }
  ],
  'Diploma in Automotive Engineering': [
    {
      code: 'AE-01',
      name: 'Service Automotive Engine Fuel Systems',
      description: 'Clean high-pressure fuel injectors, test common rail pump delivery pressures, scan fuel ECU logs, and replace primary filtration blocks.',
      credits: 6,
      status: 'competent'
    },
    {
      code: 'AE-02',
      name: 'Diagnose & Repair Automotive Steering Systems',
      description: 'Align front steering tracks, replace worm gear linkages, bleed hydraulic power steering fluid lines, and calibrate steering position sensors.',
      credits: 8,
      status: 'ongoing'
    },
    {
      code: 'AE-03',
      name: 'Overhaul Manual and Automatic Transmissions',
      description: 'Disassemble planetary gear sets, measure wet multi-disc clutches, check valve body solenoid resistances, and replace main seals.',
      credits: 10,
      status: 'not_started'
    }
  ]
};

export const SEEDED_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-1',
    traineeId: 'student-1',
    title: 'Intel Core i7 RAM Replacement & Clean Room Dusting',
    moduleCode: 'ICT-01',
    type: 'practical_video',
    description: 'Visual evidence demonstrating the physical installation of replacement DDR4 memory sticks, cleaning thermal paste, and applying fresh thermal compounds in a grounded workstation.',
    fileName: 'ram_repair_proc_ntti.mp4',
    fileSize: 350 * 1024 * 1024, // 350 MB
    reflectionText: 'During this task, I applied electro-static discharge precautions carefully by clipping my wrist band to the server frame. I discovered that thermal throttle warnings resolved immediately after applying correct density paste.',
    dateAcquired: '2026-06-15',
    status: 'competent',
    assessorFeedback: 'Excellent performance! Student successfully demonstrated complete static mitigation protocols and proper paste application levels. Competency achieved.',
    aiReviewResult: {
      isValid: true,
      authenticityScore: 95,
      validityScore: 98,
      sufficiencyScore: 90,
      currencyScore: 100,
      feedback: 'The evidence strongly matches the requirements of ICT-01. The practical application of ESD strap demonstrates strict safety adherence. All assessment parameters met.',
      reviewedAt: '2026-06-15'
    }
  },
  {
    id: 'ev-2',
    traineeId: 'student-1',
    title: 'Standard Network Crimp & Wire Test Sheet',
    moduleCode: 'ICT-02',
    type: 'project_report',
    description: 'Comprehensive lab report covering the step-by-step T568B crimping procedure, including cable length testing and attenuation logs using a fluke tester.',
    fileName: 'crimp_test_attenuation_report.pdf',
    fileSize: 42 * 1024 * 1024, // 42 MB
    reflectionText: 'I verified alignment using the Fluke analyzer. The initial cable suffered cross-talk because I untwisted the wire pairs too far back (beyond 0.5 inches). I corrected this and re-crimped for clean signal levels.',
    dateAcquired: '2026-07-10',
    status: 'pending_review',
    aiReviewResult: {
      isValid: true,
      authenticityScore: 92,
      validityScore: 94,
      sufficiencyScore: 88,
      currencyScore: 100,
      feedback: 'The document includes specific details of attenuation logs which validates authenticity. Suggestion: add a high-resolution photograph of the connector alignment to secure maximum sufficiency score from the physical assessor.',
      reviewedAt: '2026-07-11'
    }
  },
  {
    id: 'ev-3',
    traineeId: 'student-2',
    title: 'Bend Calculations on 25mm Metallic Conduit',
    moduleCode: 'EE-01',
    type: 'project_report',
    description: 'Manual layouts and mechanical bends created using a tube-bending machine to bypass an concrete support pillar at Mombasa Port training lab.',
    fileName: 'conduit_offset_bends_log.pdf',
    fileSize: 12 * 1024 * 1024, // 12 MB
    reflectionText: 'Calculating shrink allowance was crucial. I applied the standard 30-degree offset multiplier of 2.0 to establish precise conduit distance.',
    dateAcquired: '2026-05-12',
    status: 'competent',
    assessorFeedback: 'Bends are highly accurate and align flush against the wall surface. Solid mathematical deduction.',
    aiReviewResult: {
      isValid: true,
      authenticityScore: 98,
      validityScore: 96,
      sufficiencyScore: 95,
      currencyScore: 100,
      feedback: 'Mathematical calculations are accurate and show industrial precision. Directly compliant with TVET EE-01 standard for metal framing.',
      reviewedAt: '2026-05-13'
    }
  },
  {
    id: 'ev-4',
    traineeId: 'student-3',
    title: 'CRDI Fuel Injector Flow Calibration Curve',
    moduleCode: 'AE-01',
    type: 'project_report',
    description: 'Flow test logs indicating fuel delivery volumes at high-pressure conditions to diagnose cylinder imbalance in a Toyota D4D trainer engine.',
    fileName: 'flow_bench_data_barasa.pdf',
    fileSize: 18 * 1024 * 1024, // 18 MB
    reflectionText: 'Running the diagnostic bench proved that Cylinder 3 injector had a clogged nozzle plate, delivering 15% less volume than specification.',
    dateAcquired: '2026-06-20',
    status: 'competent',
    assessorFeedback: 'Fantastic diagnostic approach. Overhaul validated, and flow rates returned to balance.',
    aiReviewResult: {
      isValid: true,
      authenticityScore: 99,
      validityScore: 97,
      sufficiencyScore: 100,
      currencyScore: 100,
      feedback: 'Perfect matching of automotive diagnostics standards. Diagnostic waveforms represent actual flow bench test results.',
      reviewedAt: '2026-06-21'
    }
  }
];
