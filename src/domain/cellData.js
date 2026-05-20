import plantCellRender from '../assets/cell-plant-render.png'

export const CELL_TYPES = [
  { id: 'plant', name: 'Sedan', type: 'Showroom Model', accent: '#82b366' },
  { id: 'white-blood', name: 'SUV', type: 'Showroom Model', accent: '#7e6edb' },
  { id: 'neuron', name: 'Sports Car', type: 'Showroom Model', accent: '#8b5cf6' },
  { id: 'epithelial', name: 'Pickup Truck', type: 'Showroom Model', accent: '#e07a7a' },
  { id: 'bacteria', name: 'Compact', type: 'Showroom Model', accent: '#5fbf9f' },
  { id: 'animal', name: 'Luxury', type: 'Showroom Model', accent: '#459ccf' },
  { id: 'muscle', name: 'Muscle Car', type: 'Showroom Model', accent: '#d25762' },
]

export const SEEDED_GENERATED_CELLS = [
  {
    id: 'tripo-epithelial-test',
    name: 'AI Pickup Concept',
    type: 'Cached AI Asset',
    accent: '#e07a7a',
    custom: true,
    template: 'epithelial',
    imageUrl: '/generated-models/epithelial-car-generated.jpeg',
    generation: {
      provider: 'tripo',
      status: 'success',
      taskId: '46de8e2f-7b29-4d8d-a481-07b2c5bbb6b2',
      modelUrl: '/generated-models/tripo-epithelial-car.glb',
      rawModelUrl: '',
      message: 'AI-generated 3D pickup truck model via Tripo text-to-3D.',
    },
  },
  {
    id: 'tripo-plant-test',
    name: 'AI Sedan Concept',
    type: 'Cached AI Asset',
    accent: '#82b366',
    custom: true,
    template: 'plant',
    imageUrl: '/generated-models/plant-car-generated.jpeg',
    generation: {
      provider: 'tripo',
      status: 'success',
      taskId: 'edc253b0-d275-4b80-9ac9-27b19eeb4faa',
      modelUrl: '/generated-models/tripo-plant-car.glb',
      rawModelUrl: '',
      message: 'AI-generated 3D sedan model via Tripo text-to-3D.',
    },
  },
]

export const KHRONOS_REFERENCE_CELLS = [
  {
    id: 'khronos-transmission-test',
    name: 'Glass Body Kit',
    type: 'Khronos PBR Reference',
    accent: '#72a4bf',
    custom: true,
    reference: true,
    template: 'animal',
    imageUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TransmissionTest/screenshot/screenshot_large.png',
    referenceSummary: 'Khronos glTF sample for transparent materials. Useful for tuning glass bodies, headlight lenses, and window transparency.',
    referenceLicense: 'CC0, Adobe via Khronos glTF Sample Models',
    referenceSource: 'https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/TransmissionTest',
    generation: {
      provider: 'reference',
      requestedProvider: 'reference',
      status: 'success',
      taskId: 'khronos-transmission-test',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TransmissionTest/glTF-Binary/TransmissionTest.glb',
      rawModelUrl: '',
      message: 'Remote Khronos GLB reference for transparent material behavior.',
    },
  },
  {
    id: 'khronos-transmission-roughness',
    name: 'Frosted Glass',
    type: 'Khronos PBR Reference',
    accent: '#8eb4cf',
    custom: true,
    reference: true,
    template: 'animal',
    imageUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TransmissionRoughnessTest/screenshot/screenshot-large.png',
    referenceSummary: 'Khronos glTF sample for transmission, IOR, and roughness. Useful for frosted windows, light diffusers, and soft translucent panels.',
    referenceLicense: 'CC-BY 4.0, Ed Mackey / Analytical Graphics via Khronos glTF Sample Models',
    referenceSource: 'https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/TransmissionRoughnessTest',
    generation: {
      provider: 'reference',
      requestedProvider: 'reference',
      status: 'success',
      taskId: 'khronos-transmission-roughness',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TransmissionRoughnessTest/glTF-Binary/TransmissionRoughnessTest.glb',
      rawModelUrl: '',
      message: 'Remote Khronos GLB reference for IOR and translucent roughness.',
    },
  },
  {
    id: 'khronos-mosquito-amber',
    name: 'Amber Specimen',
    type: 'Khronos Bio Reference',
    accent: '#d18a42',
    custom: true,
    reference: true,
    template: 'bacteria',
    imageUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MosquitoInAmber/screenshot/screenshot.jpg',
    referenceSummary: 'Biological specimen in transparent amber. Useful for organic detail plus translucent material presentation.',
    referenceLicense: 'CC-BY 4.0, Loic Norgeot / Geoffrey Marchal / Sketchfab via Khronos glTF Sample Models',
    referenceSource: 'https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/MosquitoInAmber',
    generation: {
      provider: 'reference',
      requestedProvider: 'reference',
      status: 'success',
      taskId: 'khronos-mosquito-amber',
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb',
      rawModelUrl: '',
      message: 'Remote Khronos biological GLB reference. This model is larger and may take longer to load.',
    },
  },
]

export const ORGANELLES = {
  nucleus: {
    label: 'Powertrain',
    title: 'Powertrain',
    subtitle: 'Engine and drivetrain core',
    size: 'Central mechanical assembly',
    location: 'Front or mid-mounted',
    visible: 'Visible in inspection mode',
    note: 'The powertrain is the heart of the vehicle. It defines performance character, sound, and driving dynamics.',
    accent: '#7b4bb4',
  },
  lysosome: {
    label: 'Wheels & Brakes',
    title: 'Wheels & Brakes',
    subtitle: 'Rolling stock and braking system',
    size: 'Four corner assemblies',
    location: 'At each corner of the chassis',
    visible: 'Always visible externally',
    note: 'Wheels and brakes define the car\'s stance and stopping power. Alloy designs are a key visual differentiator.',
    accent: '#8d58b8',
  },
  mitochondria: {
    label: 'Exhaust System',
    title: 'Exhaust System',
    subtitle: 'Exhaust routing and tips',
    size: 'Medium assembly along underside',
    location: 'Underbody to rear',
    visible: 'Visible at rear and underside',
    note: 'The exhaust system contributes to the car\'s acoustic signature and rear visual design through tip placement.',
    accent: '#df7046',
  },
  membrane: {
    label: 'Body Shell',
    title: 'Body Shell',
    subtitle: 'Exterior panels and silhouette',
    size: 'Full vehicle envelope',
    location: 'Entire exterior surface',
    visible: 'Always visible',
    note: 'The body shell defines the car\'s character lines, proportions, and aerodynamic profile. It\'s the primary visual identity.',
    accent: '#7aa4bf',
  },
  granules: {
    label: 'Interior & Trim',
    title: 'Interior & Trim',
    subtitle: 'Cabin, dashboard, and detail trim',
    size: 'Cabin volume and accent pieces',
    location: 'Inside the cabin and exterior trim',
    visible: 'Visible through windows and open views',
    note: 'Interior quality and trim details distinguish premium vehicles. Materials, stitching, and layout define the cabin experience.',
    accent: '#5b82c4',
  },
}

export const ORGANELLE_ORDER = ['nucleus', 'lysosome', 'mitochondria', 'membrane', 'granules']

export const MICROSCOPE_IMAGES = [
  { label: 'Studio Preview', tone: 'light', note: 'Clean presentation view for screenshots.' },
  { label: 'Texture Pass', tone: 'purple', note: 'Material and color separation preview.' },
  { label: 'Depth Preview', tone: 'mono', note: 'Shape and relief readability preview.' },
]

export const WORKSPACE_PANELS = {
  Gallery: 'Saved render angles, thumbnails, and exported presentation shots.',
  Library: 'Showroom models, generated assets, local imports, and reference GLB files.',
  Notebooks: 'Vehicle notes linked to the selected model and inspection part.',
  Logs: 'Diagnostics, API request logs, and generation troubleshooting.',
  Settings: 'Viewer quality, provider defaults, screenshot size, and export preferences.',
  Compare: 'Side-by-side model comparison for shape, material, and generation quality.',
  Profile: 'Current workspace: Auto Showroom 3D.',
}

export const CELL_PROFILES = {
  plant: {
    summary: 'Classic sedan with balanced proportions, comfortable cabin, and refined exterior lines.',
    occurs: 'Family sedans, executive cars, and daily drivers.',
    comparison: 'Balanced proportions and practical design; more refined than a compact, less aggressive than a sports car.',
    compareTarget: 'animal',
    organelles: ['membrane', 'nucleus', 'mitochondria', 'granules'],
  },
  'white-blood': {
    summary: 'Rugged SUV with high ground clearance, bold grille, and versatile off-road capability.',
    occurs: 'Urban SUVs, off-road vehicles, and crossovers.',
    comparison: 'Higher ride height and bolder stance than sedans; built for versatility and adventure.',
    compareTarget: 'epithelial',
    organelles: ['lysosome', 'nucleus', 'mitochondria', 'membrane', 'granules'],
  },
  neuron: {
    summary: 'Low-slung sports car with aerodynamic body, wide track, and performance-focused design.',
    occurs: 'Supercars, GT cars, and track-focused vehicles.',
    comparison: 'Aerodynamic silhouette and aggressive stance; optimized for speed and handling.',
    compareTarget: 'muscle',
    organelles: ['membrane', 'nucleus', 'mitochondria', 'granules'],
  },
  epithelial: {
    summary: 'Full-size pickup truck with rugged bed, strong towing capacity, and commanding presence.',
    occurs: 'Work trucks, lifestyle pickups, and commercial vehicles.',
    comparison: 'Built for utility with an open bed; more rugged and practical than SUVs.',
    compareTarget: 'white-blood',
    organelles: ['membrane', 'nucleus', 'mitochondria', 'granules'],
  },
  bacteria: {
    summary: 'Compact city car with efficient packaging, tight turning radius, and modern styling.',
    occurs: 'City cars, hatchbacks, and economy vehicles.',
    comparison: 'Small footprint ideal for urban environments; efficient and easy to park.',
    compareTarget: 'animal',
    organelles: ['membrane', 'granules'],
  },
  animal: {
    summary: 'Full-size luxury sedan with premium materials, smooth ride, and elegant proportions.',
    occurs: 'Luxury sedans, executive cars, and premium grand tourers.',
    comparison: 'Emphasis on comfort and prestige; more refined than standard sedans.',
    compareTarget: 'plant',
    organelles: ['membrane', 'nucleus', 'mitochondria', 'lysosome', 'granules'],
  },
  muscle: {
    summary: 'Classic muscle car with long hood, aggressive stance, and high-displacement V8 power.',
    occurs: 'American muscle cars, pony cars, and performance coupes.',
    comparison: 'Raw power and retro-inspired design; louder and more aggressive than modern sports cars.',
    compareTarget: 'neuron',
    organelles: ['membrane', 'nucleus', 'mitochondria', 'granules'],
  },
}

export const DEFAULT_ORGANELLE_BY_CELL = {
  plant: 'membrane',
  'white-blood': 'lysosome',
  neuron: 'nucleus',
  epithelial: 'membrane',
  bacteria: 'granules',
  animal: 'nucleus',
  muscle: 'mitochondria',
}

export const CELL_DETAIL_OVERRIDES = {
  plant: {
    nucleus: {
      subtitle: 'Inline-4 turbocharged engine',
      size: '1.5-2.5L displacement',
      location: 'Front-mounted, transverse',
      visible: 'Yes',
      note: 'The engine bay houses the turbocharged inline-4, delivering smooth power delivery ideal for daily driving with excellent fuel economy.',
      funFact: 'Modern turbocharged engines can produce more power than naturally aspirated V6s.',
    },
    membrane: {
      title: 'Body Panels',
      subtitle: 'Steel and aluminum exterior',
      size: 'Full sedan envelope',
      location: 'Entire exterior surface',
      visible: 'Yes',
      note: 'The sedan body features clean character lines, a subtle shoulder, and an aerodynamic roofline for low drag coefficient.',
      funFact: 'A well-designed sedan can achieve a drag coefficient below 0.25 Cd.',
    },
    mitochondria: {
      note: 'The exhaust system routes through a catalytic converter and muffler for clean, quiet operation suitable for daily commuting.',
      funFact: 'Modern exhaust systems can be made from stainless steel, titanium, or carbon fiber.',
    },
    granules: {
      title: 'Cabin & Dashboard',
      subtitle: 'Ergonomic interior layout',
      note: 'The cabin features a driver-focused dashboard with intuitive controls, comfortable seating for five, and quality soft-touch materials.',
      funFact: 'The average driver spends over 500 hours per year inside their car.',
    },
  },
  'white-blood': {
    lysosome: {
      note: 'The SUV rides on large all-terrain wheels with disc brakes at all four corners, providing confident stopping power on any surface.',
      funFact: 'Modern SUV brake systems can bring 2+ tons to a stop from 100 km/h in under 40 meters.',
    },
    nucleus: {
      note: 'A powerful engine — often a turbocharged V6 or inline-4 — delivers the torque needed for towing and off-road climbing.',
    },
  },
  neuron: {
    membrane: {
      title: 'Aero Body & Spoiler',
      subtitle: 'Wind-tunnel-tuned panels',
      location: 'Full exterior with active aero',
      note: 'Every surface is sculpted in the wind tunnel. The front splitter, side skirts, and rear diffuser work together to generate downforce.',
      funFact: 'A sports car at speed can generate enough downforce to drive upside down in a tunnel.',
    },
  },
  epithelial: {
    membrane: {
      title: 'Truck Bed & Cab',
      subtitle: 'Work-ready exterior panels',
      location: 'Cab and open bed',
      note: 'The pickup combines a sealed crew cab with an open bed featuring tie-down points and a durable bed liner for work duty.',
    },
  },
  bacteria: {
    granules: {
      title: 'Compact Cabin',
      subtitle: 'Efficient city car interior',
      size: 'Space-optimized packaging',
      location: 'Inside the compact body',
      note: 'Despite its small footprint, clever packaging provides surprising interior space with modern infotainment and connectivity.',
      funFact: 'The best compact cars can fit into parking spaces that sedans can\'t.',
    },
  },
  animal: {
    nucleus: {
      note: 'The luxury sedan\'s powertrain emphasizes refinement — a silky V6 or electric motor delivers effortless acceleration with near-silent operation.',
    },
  },
  muscle: {
    mitochondria: {
      note: 'A free-flowing dual exhaust system with large-diameter tips produces the signature V8 rumble that defines the muscle car experience.',
      funFact: 'The most iconic muscle car exhaust notes come from cross-plane and flat-plane crank V8 designs.',
    },
  },
}

export const CELL_BODY = {
  plant: { color: '#c8d8e8', scale: [1.38, 1.04, 0.76], kind: 'box' },
  'white-blood': { color: '#8b9dc3', scale: [1.34, 1.18, 0.92], kind: 'sphere' },
  neuron: { color: '#d42626', scale: [0.78, 0.68, 0.58], kind: 'sphere' },
  epithelial: { color: '#7a8b6e', scale: [1.22, 0.92, 0.52], kind: 'box' },
  bacteria: { color: '#f0c75e', scale: [0.9, 1, 0.56], kind: 'capsule' },
  animal: { color: '#2c2c2c', scale: [1.18, 1.08, 0.9], kind: 'sphere' },
  muscle: { color: '#e04040', scale: [0.82, 1.1, 0.48], kind: 'capsule' },
}
