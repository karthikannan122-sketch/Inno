import { Project } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_PROJECTS } from '../data/seedData';
import { OPEN_SOURCE_TOOLS } from '../data/openSourceDirectory';

export interface ExternalSourceItem {
  title: string;
  url: string;
  domain: string;
  sourceType: 
    | 'Official Website'
    | 'Official Documentation'
    | 'GitHub Repository'
    | 'Research Paper'
    | 'Technical Article'
    | 'Existing Product'
    | 'Dataset'
    | 'API Documentation'
    | 'Framework'
    | 'Library'
    | 'Tutorial'
    | 'Web Grounding Citation';
  description: string;
  relevance: number; // 0 - 100
}

export interface InnovexaMatchedProject {
  id: string;
  title: string;
  category: string;
  project_type: string;
  problem_title: string;
  problem_description: string;
  solution_description: string;
  target_audience: string;
  similarityScore: number;
  whyRelated: string[];
  readinessScore: number;
  upvotesCount: number;
}

export interface DetailedAIResearchReport {
  query: string;
  overview: string;
  concept: {
    title: string;
    description: string;
    problem_addressed: string;
    target_users: string;
    why_it_matters: string;
  };
  proposed_solution: {
    title: string;
    description: string;
    user_experience: string;
    core_utility: string;
  };
  how_it_works: {
    step_number: number;
    stage: string;
    action: string;
    technical_detail: string;
  }[];
  related_solutions: {
    name: string;
    description: string;
    what_it_does: string;
    why_related: string;
    url: string;
    source_type: string;
    domain: string;
    relevance: number;
  }[];
  related_innovexa_projects: InnovexaMatchedProject[];
  solution_comparison: {
    solution_name: string;
    problem_addressed: string;
    technical_approach: string;
    technology_stack: string;
    target_users: string;
    source_url: string;
  }[];
  comparative_insights: {
    common_approaches: string[];
    key_differences: string[];
    strengths: string[];
    limitations: string[];
    potential_gaps: string[];
  };
  technologies: {
    category: string;
    name: string;
    purpose: string;
    url: string;
  }[];
  resources_and_tools: {
    name: string;
    resource_type: string;
    description: string;
    url: string;
  }[];
  architecture_pipeline: {
    layer: string;
    components: string[];
    details: string;
  }[];
  implementation_phases: {
    phase_number: number;
    phase_name: string;
    steps: string[];
  }[];
  mvp_roadmap: {
    mvp_features: string[];
    version_2_features: string[];
    advanced_features: string[];
  };
  improvement_opportunities: string[];
  next_steps: string[];
  verified_sources: ExternalSourceItem[];
  searchDurationMs: number;
  hasLiveWebGrounding: boolean;
}

// Storage keys
export const STORAGE_RECENT_RESEARCH = 'innovexa_ai_recent_research';
export const STORAGE_SAVED_RESEARCH = 'innovexa_ai_saved_research';
export const STORAGE_SAVED_BLUEPRINTS = 'innovexa_saved_blueprints';

/**
 * Validates whether a URL is a real, safe http/https web link.
 */
export function isValidHttpUrl(stringUrl: string): boolean {
  if (!stringUrl || typeof stringUrl !== 'string') return false;
  try {
    const url = new URL(stringUrl);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.hostname.includes('example.com') &&
      !url.hostname.includes('fakedomain') &&
      !url.hostname.includes('localhost') &&
      url.hostname.includes('.')
    );
  } catch (_) {
    return false;
  }
}

/**
 * Extracts a clean hostname domain for display (e.g., "pytorch.org", "github.com").
 */
export function extractDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Web Resource';
  }
}

/**
 * Curated Verified Real-World Domain Grounding Database (guaranteed genuine URLs)
 */
const VERIFIED_DOMAIN_BENCHMARKS: Record<string, {
  keywords: string[];
  overview: string;
  concept: {
    title: string;
    description: string;
    problem_addressed: string;
    target_users: string;
    why_it_matters: string;
  };
  proposed_solution: {
    title: string;
    description: string;
    user_experience: string;
    core_utility: string;
  };
  how_it_works: { step_number: number; stage: string; action: string; technical_detail: string }[];
  related_solutions: {
    name: string;
    description: string;
    what_it_does: string;
    why_related: string;
    url: string;
    source_type: string;
    domain: string;
    relevance: number;
  }[];
  solution_comparison: {
    solution_name: string;
    problem_addressed: string;
    technical_approach: string;
    technology_stack: string;
    target_users: string;
    source_url: string;
  }[];
  comparative_insights: {
    common_approaches: string[];
    key_differences: string[];
    strengths: string[];
    limitations: string[];
    potential_gaps: string[];
  };
  technologies: { category: string; name: string; purpose: string; url: string }[];
  resources_and_tools: { name: string; resource_type: string; description: string; url: string }[];
  architecture_pipeline: { layer: string; components: string[]; details: string }[];
  implementation_phases: { phase_number: number; phase_name: string; steps: string[] }[];
  mvp_roadmap: { mvp_features: string[]; version_2_features: string[]; advanced_features: string[] };
  improvement_opportunities: string[];
  next_steps: string[];
}> = {
  agriculture: {
    keywords: ['crop', 'plant', 'disease', 'leaf', 'farming', 'farmer', 'agriculture', 'agtech', 'soil', 'harvest', 'pest', 'blight', 'fertilizer'],
    overview: 'Crop diseases cause up to 40% of global food production losses annually. Smallholder farmers often lack immediate access to certified agronomists, leading to delayed disease identification, over-use of chemical pesticides, and irreversible yield loss. Computer vision and edge-deployed deep learning allow real-time leaf pathology diagnostics in seconds from a mobile smartphone camera.',
    concept: {
      title: 'Autonomous Mobile Plant & Crop Disease Diagnostics',
      description: 'An AI-powered computer vision system that classifies leaf lesions, fungal infections, and bacterial blights in real time from camera images and generates localized, eco-friendly treatment advice.',
      problem_addressed: 'Lack of timely, accurate crop disease detection in rural agricultural communities, leading to crop failure and food insecurity.',
      target_users: 'Smallholder farmers, agronomists, agricultural extension workers, and greenhouse managers.',
      why_it_matters: 'Early detection protects food security, reduces unnecessary chemical runoff into watersheds, and improves farmer household income by 25%–35%.'
    },
    proposed_solution: {
      title: 'Edge-First Agricultural Vision Companion',
      description: 'A mobile-accessible web application and edge scanner that identifies 38+ crop disease classes in offline and low-bandwidth environments.',
      user_experience: 'The farmer snaps a photo of an infected leaf. Within 1.5 seconds, the app displays the disease name, confidence score, pathogen type, and step-by-step organic or chemical treatment dosage.',
      core_utility: 'Provides immediate, actionable agronomy expertise right in the field without requiring costly lab tests.'
    },
    how_it_works: [
      { step_number: 1, stage: 'Image Ingestion', action: 'Farmer captures leaf photograph via smartphone camera', technical_detail: 'High-resolution JPEG/PNG with EXIF geo-coordinates' },
      { step_number: 2, stage: 'Preprocessing', action: 'Background segmentation, color space normalization & noise removal', technical_detail: 'OpenCV CLAHE contrast adjustment and 256x256 tensor resizing' },
      { step_number: 3, stage: 'Vision Classification', action: 'Convolutional neural network / Vision Transformer feature extraction', technical_detail: 'Fine-tuned MobileNetV3 / EfficientNet-B4 backbone with PyTorch' },
      { step_number: 4, stage: 'Confidence Calibration', action: 'Softmax probability calculation and anomaly out-of-distribution check', technical_detail: 'Thresholding at >85% confidence to minimize false alarms' },
      { step_number: 5, stage: 'Agronomy Prescription', action: 'Maps diagnosed pathogen to localized treatment registry', technical_detail: 'Retrieves organic biological remedies and approved fungicides' },
      { step_number: 6, stage: 'Farmer Action & Telemetry', action: 'Farmer applies remedy and logs recovery outcome', technical_detail: 'Crowdsourced disease outbreak heatmaps for regional agronomists' }
    ],
    related_solutions: [
      {
        name: 'Plantix',
        description: 'Global AI mobile application for crop diagnosis used by over 30 million farmers across India and Latin America.',
        what_it_does: 'Instant image-based crop disease diagnosis and automated fertilizer calculator.',
        why_related: 'Directly solves mobile crop disease identification and agronomic advisory.',
        url: 'https://plantix.net/',
        source_type: 'Existing Product',
        domain: 'plantix.net',
        relevance: 98
      },
      {
        name: 'PlantVillage (Penn State University)',
        description: 'Open-access agricultural intelligence platform using computer vision and machine learning for sub-Saharan Africa.',
        what_it_does: 'Provides the world standard benchmark open dataset of 54,000+ annotated healthy and diseased crop images.',
        why_related: 'Primary foundational dataset and academic validation for deep learning in plant pathology.',
        url: 'https://plantvillage.psu.edu/',
        source_type: 'Official Website',
        domain: 'plantvillage.psu.edu',
        relevance: 96
      },
      {
        name: 'Agrio by Precision Crop Protection',
        description: 'Satellite and smartphone-based crop monitoring and pest epidemiology platform.',
        what_it_does: 'Combines Sentinel satellite indices with close-range leaf vision.',
        why_related: 'Demonstrates multi-scale crop health tracking from field to satellite.',
        url: 'https://agrio.app/',
        source_type: 'Existing Product',
        domain: 'agrio.app',
        relevance: 91
      },
      {
        name: 'PyTorch Vision Plant Disease Classifier (GitHub)',
        description: 'Open-source deep learning repository with pre-trained weights for 38 plant disease classes.',
        what_it_does: 'Turnkey PyTorch and ONNX inference pipeline for leaf image segmentation.',
        why_related: 'Open-source reference implementation ready for developer adaptation.',
        url: 'https://github.com/topics/plant-disease-detection',
        source_type: 'GitHub Repository',
        domain: 'github.com',
        relevance: 94
      }
    ],
    solution_comparison: [
      {
        solution_name: 'Plantix',
        problem_addressed: 'Farmer pest and disease recognition in emerging markets',
        technical_approach: 'Cloud-based CNN image classification + Agronomy DB',
        technology_stack: 'TensorFlow, Android Native, AWS',
        target_users: 'Smallholder farmers in South Asia & Africa',
        source_url: 'https://plantix.net/'
      },
      {
        solution_name: 'PlantVillage Nuru',
        problem_addressed: 'Cassava and maize viral disease detection in Africa',
        technical_approach: 'Offline MobileNet edge inference on low-cost Androids',
        technology_stack: 'TensorFlow Lite, Python, PyTorch',
        target_users: 'African agricultural extension workers',
        source_url: 'https://plantvillage.psu.edu/'
      },
      {
        solution_name: 'Agrio',
        problem_addressed: 'Multi-acre farm monitoring and preventive pest forecasting',
        technical_approach: 'Satellite NDVI + Mobile leaf scanner',
        technology_stack: 'Google Earth Engine, PyTorch, React Native',
        target_users: 'Commercial farmers and precision agronomists',
        source_url: 'https://agrio.app/'
      }
    ],
    comparative_insights: {
      common_approaches: [
        'Supervised image classification on RGB leaf photographs.',
        'Pre-training on ImageNet followed by transfer learning on annotated leaf datasets.',
        'Mobile-first responsive capture UI.'
      ],
      key_differences: [
        'PlantVillage prioritizes offline edge inference in rural areas with zero cellular connectivity.',
        'Commercial SaaS apps (Agrio) monetize satellite imagery integration.',
        'Open-source toolkits focus on modular ONNX weights for easy web deployment.'
      ],
      strengths: [
        'High diagnostic accuracy (>95%) for classic blights and leaf spots.',
        'Zero hardware cost other than an existing smartphone.'
      ],
      limitations: [
        'Difficulty distinguishing nutrient deficiencies (e.g. nitrogen vs iron chlorosis) from viral blights under direct harsh sunlight.',
        'Limited multi-disease co-infection detection on a single leaf.'
      ],
      potential_gaps: [
        'Opportunity for automated local remedy compounding based on available regional fertilizers.',
        'Opportunity for crowdsourced peer validation by nearby verified farmers.'
      ]
    },
    technologies: [
      { category: 'AI & Machine Learning', name: 'PyTorch / torchvision', purpose: 'Training and fine-tuning transfer learning vision backbones (MobileNetV3, ResNet-50).', url: 'https://pytorch.org/vision/stable/models.html' },
      { category: 'Edge Optimization', name: 'TensorFlow Lite / ONNX Runtime', purpose: 'Quantizing neural models to INT8 for 50ms in-browser or on-device inference.', url: 'https://onnxruntime.ai/' },
      { category: 'Backend API', name: 'FastAPI (Python)', purpose: 'High-throughput async REST server for model serving and agronomy database queries.', url: 'https://fastapi.tiangolo.com/' },
      { category: 'Frontend UI', name: 'React + Vite', purpose: 'Responsive web scanner with HTML5 Camera API access and instant client-side preview.', url: 'https://react.dev/' },
      { category: 'Image Processing', name: 'OpenCV (Python / JS)', purpose: 'Bounding-box cropping, glare reduction, and color segmentation.', url: 'https://opencv.org/' }
    ],
    resources_and_tools: [
      { name: 'PlantVillage Dataset (Kaggle)', resource_type: 'Dataset', description: '54,306 images of 14 crop species with 26 distinct diseases and 12 healthy classes.', url: 'https://www.kaggle.com/datasets/emmarex/plantdisease' },
      { name: 'Plant Pathology 2020 (FGVC7 Competition)', resource_type: 'Dataset', description: 'High-resolution apple leaf pathology benchmark dataset from Cornell AgriTech.', url: 'https://www.kaggle.com/c/plant-pathology-2020-fgvc7' },
      { name: 'Deep Learning for Plant Disease Detection (arXiv:1604.03169)', resource_type: 'Research Paper', description: 'Seminal paper evaluating deep CNN architectures across 38 crop disease categories.', url: 'https://arxiv.org/abs/1604.03169' }
    ],
    architecture_pipeline: [
      { layer: 'Client Tier', components: ['React Web UI', 'HTML5 MediaStream Camera'], details: 'Zero-install mobile web scanner' },
      { layer: 'Inference Tier', components: ['FastAPI Server', 'ONNX Runtime / TensorRT'], details: 'Sub-second model execution with GPU acceleration' },
      { layer: 'Agronomy Knowledge Base', components: ['PostgreSQL', 'Pathogen Registry'], details: 'Curated organic and chemical remediation protocols' },
      { layer: 'Community Signals Tier', components: ['INNOVEXA Peer Network', 'Disease Heatmap'], details: 'Regional outbreak alerts and farmer feedback' }
    ],
    implementation_phases: [
      { phase_number: 1, phase_name: 'Problem Definition & Class Taxonomy', steps: ['Select 5–10 core regional crops (e.g. Tomato, Potato, Corn)', 'Map specific target fungal/bacterial leaf lesions', 'Define precision metrics (>90% F1-score)'] },
      { phase_number: 2, phase_name: 'Data Preparation & Augmentation', steps: ['Download PlantVillage dataset from Kaggle', 'Apply random rotations, brightness jitter, and perspective distortion', 'Split data into 70% train / 15% validation / 15% test'] },
      { phase_number: 3, phase_name: 'Model Training & Quantization', steps: ['Load pre-trained MobileNetV3 in PyTorch', 'Train for 25 epochs with AdamW and Cosine Annealing', 'Export model to ONNX and quantize to INT8'] },
      { phase_number: 4, phase_name: 'FastAPI Backend Service', steps: ['Implement `/predict` multipart endpoint', 'Add image validation and memory caching', 'Write unit tests for inference latency'] },
      { phase_number: 5, phase_name: 'Frontend Scanner Interface', steps: ['Build responsive React camera upload widget', 'Render prediction probability badges and confidence meters', 'Display curated remediation steps'] },
      { phase_number: 6, phase_name: 'Persistence & Historical Logs', steps: ['Configure PostgreSQL database schema', 'Store scan history, geo-tags, and farmer follow-up notes'] },
      { phase_number: 7, phase_name: 'Field Testing & Outlier Handling', steps: ['Test with blurred photos, low-light conditions, and non-leaf objects', 'Add an "unrecognized object" confidence fallback'] },
      { phase_number: 8, phase_name: 'Deployment & Community Launch', steps: ['Deploy backend on Docker / Render / AWS', 'Publish project on INNOVEXA for peer validation'] }
    ],
    mvp_roadmap: {
      mvp_features: [
        'Single image upload or camera snapshot',
        'Top-1 disease prediction with confidence percentage',
        'Basic organic treatment description',
        'FastAPI backend with PyTorch model'
      ],
      version_2_features: [
        'Offline in-browser ONNX model execution (zero internet required)',
        'Multi-crop selection menu',
        'Historical scan log with symptom progression tracking'
      ],
      advanced_features: [
        'Multi-spectral camera and drone imagery ingestion',
        'Real-time regional disease outbreak alerts via SMS/WhatsApp',
        'Direct connection to matched local agricultural experts on INNOVEXA'
      ]
    },
    improvement_opportunities: [
      'Potential opportunity to add soil pH and weather data inputs to boost diagnostic accuracy.',
      'Potential opportunity to offer automated pesticide dosage calculations based on farm acreage.',
      'Potential opportunity to run 100% locally in the browser with zero cloud server costs.'
    ],
    next_steps: [
      'Inspect the PlantVillage dataset on Kaggle to understand the image structure.',
      'Test the pre-trained PyTorch model baseline in a local Python virtual environment.',
      'Build a lightweight React frontend with HTML5 camera capture.',
      'Create and publish your project on INNOVEXA to receive peer reviews from domain agronomists.'
    ]
  },

  waste_management: {
    keywords: ['waste', 'recycling', 'garbage', 'bin', 'trash', 'compost', 'circular', 'plastic', 'landfill', 'smart city', 'clean energy', 'sustainability', 'emission'],
    overview: 'Municipal waste generation exceeds 2.1 billion tons annually, with over 33% mismanaged in open dumps. Traditional waste collection relies on fixed static routes, resulting in overflowing bins or fuel-wasting pickups of half-empty containers. Smart waste systems combine IoT fill-level sensors, computer vision sorting, and dynamic route optimization algorithms to reduce collection costs by 40%.',
    concept: {
      title: 'AI-Powered Smart Waste Classification & Dynamic Collection Routing',
      description: 'An integrated intelligent waste management platform that uses optical sensors and fill-level telemetry to automate trash categorization and dynamically calculate optimal municipal truck routes.',
      problem_addressed: 'Inefficient municipal waste logistics, landfill contamination from unsorted recyclables, and greenhouse gas emissions from static collection schedules.',
      target_users: 'City municipalities, university campuses, waste management contractors, and recycling facilities.',
      why_it_matters: 'Decreases municipal fuel consumption by up to 30%, prevents street overflow, and increases recycling diversion rates by 50%.'
    },
    proposed_solution: {
      title: 'Zero-Waste Municipal Telemetry & Route Engine',
      description: 'A real-time IoT and computer vision hub that monitors bin fill levels, classifies recyclable materials, and provides dispatchers with turn-by-turn route optimizations.',
      user_experience: 'Sensors report fill status every 15 minutes. Dispatchers view a live 3D city heatmap of bin readiness and generate one-click optimized routing schedules for collection drivers.',
      core_utility: 'Transforms reactive manual trash collection into a proactive, data-driven municipal operation.'
    },
    how_it_works: [
      { step_number: 1, stage: 'IoT Telemetry Ingestion', action: 'Ultrasonic and optical sensors capture bin fullness and weight', technical_detail: 'MQTT over LoRaWAN or Cellular NB-IoT' },
      { step_number: 2, stage: 'Edge Object Classification', action: 'Micro-camera on recycling chute classifies material type (plastic, glass, paper, organic)', technical_detail: 'Edge YOLOv8-nano model on Raspberry Pi / ESP32-CAM' },
      { step_number: 3, stage: 'Central Telemetry Stream', action: 'Ingests real-time bin status into time-series database', technical_detail: 'PostgreSQL with TimescaleDB extension' },
      { step_number: 4, stage: 'Route Optimization Algorithm', action: 'Solves Capacitated Vehicle Routing Problem (CVRP)', technical_detail: 'Google OR-Tools with OpenStreetMap road network matrix' },
      { step_number: 5, stage: 'Dispatcher & Driver Dispatch', action: 'Pushes dynamic route turn-by-turn directions to driver tablets', technical_detail: 'WebSocket push notifications with Mapbox navigation' },
      { step_number: 6, stage: 'Analytics & Diversion Reporting', action: 'Generates carbon offset metrics and recycling audits', technical_detail: 'Automated municipal ESG compliance dashboards' }
    ],
    related_solutions: [
      {
        name: 'AMP Robotics',
        description: 'Industrial AI-guided robotic sorting systems deployed in hundreds of recycling facilities globally.',
        what_it_does: 'High-speed robotic delta arms that identify and separate recyclable materials on conveyor belts at 80 picks/minute.',
        why_related: 'Leading global benchmark for computer vision in municipal and industrial waste sorting.',
        url: 'https://www.amprobotics.com/',
        source_type: 'Existing Product',
        domain: 'amprobotics.com',
        relevance: 97
      },
      {
        name: 'CleanRobotics TrashBot',
        description: 'Zero-waste autonomous smart recycling bin for airports, universities, and corporate offices.',
        what_it_does: 'Uses internal cameras and AI to sort trash, recyclables, and compost at the point of disposal with 90%+ accuracy.',
        why_related: 'Commercial point-of-disposal computer vision sorting benchmark.',
        url: 'https://cleanrobotics.com/',
        source_type: 'Existing Product',
        domain: 'cleanrobotics.com',
        relevance: 95
      },
      {
        name: 'Recycleye',
        description: 'Affordable computer vision AI sorting system developed with Imperial College London.',
        what_it_does: 'Combines proprietary spatial AI hardware with cloud telemetry for municipal recycling facilities.',
        why_related: 'Leading European reference for scalable waste classification vision models.',
        url: 'https://recycleye.com/',
        source_type: 'Official Website',
        domain: 'recycleye.com',
        relevance: 93
      },
      {
        name: 'TACO: Trash Annotations in Context (Dataset)',
        description: 'Open-source image dataset for waste detection in diverse environments with bounding box annotations.',
        what_it_does: 'Provides thousands of annotated waste photographs spanning plastics, cans, bottles, and cartons.',
        why_related: 'Open-access benchmark training dataset for trash classification algorithms.',
        url: 'http://tacodataset.org/',
        source_type: 'Dataset',
        domain: 'tacodataset.org',
        relevance: 96
      }
    ],
    solution_comparison: [
      {
        solution_name: 'AMP Robotics',
        problem_addressed: 'Industrial recycling facility material recovery',
        technical_approach: 'High-speed GPU vision + Delta robotic arms',
        technology_stack: 'Custom Vision, ROS (Robot Operating System), C++',
        target_users: 'Material Recovery Facilities (MRFs)',
        source_url: 'https://www.amprobotics.com/'
      },
      {
        solution_name: 'CleanRobotics TrashBot',
        problem_addressed: 'Point-of-disposal consumer recycling confusion',
        technical_approach: 'Enclosed optical sorting chamber with mechanical flippers',
        technology_stack: 'Embedded Linux, Python, AWS IoT',
        target_users: 'Airports, stadiums, enterprise campuses',
        source_url: 'https://cleanrobotics.com/'
      },
      {
        solution_name: 'Recycleye',
        problem_addressed: 'Retrofit optical waste audits for legacy sorting plants',
        technical_approach: 'Modular camera gantry + SaaS analytics',
        technology_stack: 'PyTorch, Docker, Next.js',
        target_users: 'Waste management contractors',
        source_url: 'https://recycleye.com/'
      }
    ],
    comparative_insights: {
      common_approaches: [
        'Convolutional networks for multi-class packaging material recognition.',
        'IoT telemetry tracking volumetric bin levels.',
        'Cloud dashboards for facility dispatchers.'
      ],
      key_differences: [
        'Industrial solutions (AMP Robotics) require heavy capital expenditure on robotics hardware.',
        'Smart bins (TrashBot) focus on educating consumers at the moment of disposal.',
        'Routing engines optimize fleet vehicles across city streets.'
      ],
      strengths: [
        'Proven 30% reduction in municipal diesel fuel consumption.',
        'Significant reduction in landfill contamination.'
      ],
      limitations: [
        'Sensors in public bins are susceptible to vandalism and battery drain in freezing weather.',
        'Dirty or crushed containers can deceive basic RGB cameras.'
      ],
      potential_gaps: [
        'Potential opportunity to incorporate citizen incentive rewards (micro-credits for verified clean recycling).',
        'Potential opportunity to provide low-cost ESP32 ultrasonic retrofit kits for existing municipal bins.'
      ]
    },
    technologies: [
      { category: 'Routing Optimization', name: 'Google OR-Tools (Python)', purpose: 'Solving Vehicle Routing Problem (VRP) with capacity and time-window constraints.', url: 'https://developers.google.com/optimization' },
      { category: 'AI Object Detection', name: 'YOLOv8 by Ultralytics', purpose: 'Real-time waste item classification into recyclable, organic, and hazardous categories.', url: 'https://docs.ultralytics.com/' },
      { category: 'IoT Protocol', name: 'MQTT Protocol', purpose: 'Lightweight publish/subscribe messaging for low-power bin telemetry.', url: 'https://mqtt.org/' },
      { category: 'Backend & Time-Series', name: 'FastAPI + PostgreSQL (TimescaleDB)', purpose: 'Storing sensor telemetry streams and calculating live city fill rates.', url: 'https://www.timescale.com/' },
      { category: 'Mapping UI', name: 'Mapbox GL JS / Leaflet', purpose: 'Interactive geospatial map of city bins and optimized truck routes.', url: 'https://www.mapbox.com/' }
    ],
    resources_and_tools: [
      { name: 'TACO Dataset', resource_type: 'Dataset', description: 'Open-image dataset for waste detection in real-world contexts.', url: 'http://tacodataset.org/' },
      { name: 'TrashNet Dataset (GitHub)', resource_type: 'Dataset', description: 'Curated 2,500+ image dataset spanning glass, paper, cardboard, plastic, metal, and trash.', url: 'https://github.com/garythung/trashnet' },
      { name: 'EPA Waste & Recycling Guidelines', resource_type: 'Official Documentation', description: 'U.S. EPA technical standards on municipal solid waste metrics and diversion rates.', url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling' }
    ],
    architecture_pipeline: [
      { layer: 'IoT & Edge Tier', components: ['Ultrasonic Sensors', 'ESP32 Microcontroller', 'LoRaWAN Gateway'], details: 'Bin fill detection' },
      { layer: 'Ingestion Tier', components: ['EMQX MQTT Broker', 'FastAPI Webhook'], details: 'Stream ingestion' },
      { layer: 'Routing & Optimization', components: ['Google OR-Tools', 'OpenStreetMap Matrix Engine'], details: 'Daily route generation' },
      { layer: 'Dispatcher Dashboard', components: ['React 18', 'Mapbox GL JS', 'WebSocket Feed'], details: 'Real-time fleet tracking' }
    ],
    implementation_phases: [
      { phase_number: 1, phase_name: 'Scope & Sensor Specification', steps: ['Define bin density and communication protocol (LoRaWAN vs Cellular)', 'Determine fill threshold triggers (e.g. 80% full)'] },
      { phase_number: 2, phase_name: 'Sensor Firmware & Simulator', steps: ['Program ESP32 to read ultrasonic distance sensor', 'Write Python mock script to simulate 50 virtual city bins'] },
      { phase_number: 3, phase_name: 'Telemetry Ingestion Service', steps: ['Setup FastAPI server with MQTT listener', 'Store timestamped sensor readings in PostgreSQL'] },
      { phase_number: 4, phase_name: 'OR-Tools Optimization Engine', steps: ['Implement Capacitated Vehicle Routing Problem logic', 'Calculate matrix distances using OpenStreetMap road network'] },
      { phase_number: 5, phase_name: 'Dispatcher Geospatial UI', steps: ['Build React map view showing color-coded bins (Green: Empty, Red: Full)', 'Render route polylines for municipal trucks'] },
      { phase_number: 6, phase_name: 'Driver Mobile Companion', steps: ['Build mobile responsive view with turn-by-turn stop checklist', 'Enable drivers to mark bin as "Collected" in real time'] },
      { phase_number: 7, phase_name: 'Field Pilot & Fuel Audit', steps: ['Deploy 10 physical sensors on campus bins', 'Measure fuel and time savings over a 2-week baseline'] },
      { phase_number: 8, phase_name: 'Launch & Community Engagement', steps: ['Publish project specifications on INNOVEXA', 'Gather feedback from city sustainability researchers'] }
    ],
    mvp_roadmap: {
      mvp_features: [
        'Web simulator with 20 virtual bins and random fill rates',
        'Google OR-Tools route generator with map display',
        'FastAPI backend with PostgreSQL storage',
        'Basic driver stop list view'
      ],
      version_2_features: [
        'Hardware ESP32 ultrasonic integration over WiFi/MQTT',
        'Push notifications when bins reach critical overflow',
        'Historical waste trend analytics'
      ],
      advanced_features: [
        'On-bin camera optical sorting verification',
        'Citizen app showing nearby non-overflowing recycling points',
        'Integration with municipal smart city ERP systems'
      ]
    },
    improvement_opportunities: [
      'Potential opportunity to add solar-powered bin compactor controls to increase holding capacity 5x.',
      'Potential opportunity to gamify citizen recycling participation via QR-code scan rewards.',
      'Potential opportunity to integrate weather forecasts (e.g. avoiding collection before rainstorms).'
    ],
    next_steps: [
      'Experiment with Google OR-Tools routing examples in Python.',
      'Test the TrashNet dataset for packaging classification.',
      'Build the interactive Mapbox dispatcher dashboard.',
      'Publish your architecture on INNOVEXA to collaborate with environmental engineers.'
    ]
  },

  interview_prep: {
    keywords: ['interview', 'prep', 'mock', 'resume', 'career', 'job', 'hiring', 'applicant', 'coding challenge', 'behavioral', 'recruiting'],
    overview: 'Technical and behavioral job interviews are notoriously stressful for graduating students and career switchers. Traditional prep relies on expensive human coaching ($150–$300/hour) or passive problem lists without feedback. Modern AI interview platforms combine multimodal speech analysis, real-time code evaluation, and simulated STAR-method behavioral probes to deliver affordable, instant coaching.',
    concept: {
      title: 'Multimodal AI Mock Interviewer & Cognitive Career Coach',
      description: 'An autonomous, conversational interview simulator that conducts real-time video/audio technical and behavioral mock interviews with instant speech, rubric-based grading, and code feedback.',
      problem_addressed: 'High cost and limited availability of personalized 1-on-1 interview practice for students and early-career software engineers.',
      target_users: 'College students, software engineering applicants, career switchers, and university placement cells.',
      why_it_matters: 'Levels the playing field by providing top-tier interview practice, reducing anxiety, and improving job placement rates by 45%.'
    },
    proposed_solution: {
      title: 'Adaptive AI Technical & Behavioral Interview Copilot',
      description: 'A browser-based interactive mock interview simulator that asks role-specific questions, evaluates technical code or spoken answers against industry rubrics, and provides actionable improvement plans.',
      user_experience: 'The candidate selects a target role (e.g. Frontend Engineer at a Tech Startup). An AI interviewer conducts a 20-minute voice interview, asking follow-up probes based on the candidate’s exact answers, and generates a detailed rubric score card upon completion.',
      core_utility: 'Delivers realistic, high-fidelity interview simulations with immediate, objective feedback.'
    },
    how_it_works: [
      { step_number: 1, stage: 'Role & Job Spec Selection', action: 'Candidate selects target job description, seniority, and interview format', technical_detail: 'Role taxonomy and customized rubric configuration' },
      { step_number: 2, stage: 'Audio/Video Ingestion', action: 'Captures candidate voice stream in real-time', technical_detail: 'WebRTC audio stream with noise suppression' },
      { step_number: 3, stage: 'Speech-to-Text & Sentiment', action: 'Transcribes spoken answers and analyzes filler words, pacing, and tone', technical_detail: 'OpenAI Whisper / Google Speech-to-Text API' },
      { step_number: 4, stage: 'LLM Adaptive Probing', action: 'Evaluates answer completeness against STAR framework and generates follow-up question', technical_detail: 'Gemini 1.5 Flash with structured interview rubric context' },
      { step_number: 5, stage: 'Code & Technical Evaluation', action: 'Runs sandboxed code execution for technical coding rounds', technical_detail: 'Monaco Editor with Pyodide / Judge0 sandboxed test runner' },
      { step_number: 6, stage: 'Comprehensive Rubric Report', action: 'Generates detailed breakdown of strengths, communication clarity, and ideal answers', technical_detail: 'PDF exportable report with radar performance chart' }
    ],
    related_solutions: [
      {
        name: 'Pramp',
        description: 'Free peer-to-peer mock interview platform for software engineers and product managers.',
        what_it_does: 'Pairs candidates with human peers for live coding and behavioral mock interviews.',
        why_related: 'Established community benchmark for peer-to-peer interview preparation.',
        url: 'https://www.pramp.com/',
        source_type: 'Existing Product',
        domain: 'pramp.com',
        relevance: 96
      },
      {
        name: 'Interviewing.io',
        description: 'Anonymous mock interviews with senior engineers from Google, Meta, and Amazon.',
        what_it_does: 'Provides realistic technical interviews with verified FAANG engineers.',
        why_related: 'Premier commercial benchmark for senior technical interview coaching.',
        url: 'https://interviewing.io/',
        source_type: 'Existing Product',
        domain: 'interviewing.io',
        relevance: 94
      },
      {
        name: 'LeetCode',
        description: 'Leading global developer platform for algorithmic problem solving and coding interviews.',
        what_it_does: 'Provides 3,000+ coding challenges with automated unit test grading.',
        why_related: 'Industry standard benchmark for algorithmic interview preparation.',
        url: 'https://leetcode.com/',
        source_type: 'Official Website',
        domain: 'leetcode.com',
        relevance: 95
      },
      {
        name: 'OpenAI Whisper Speech-to-Text (GitHub)',
        description: 'State-of-the-art open-source speech recognition model.',
        what_it_does: 'Provides robust multi-lingual speech transcription with timestamps.',
        why_related: 'Core foundational open-source technology for real-time voice interview processing.',
        url: 'https://github.com/openai/whisper',
        source_type: 'GitHub Repository',
        domain: 'github.com',
        relevance: 98
      }
    ],
    solution_comparison: [
      {
        solution_name: 'Pramp',
        problem_addressed: 'Lack of human practice partners for mock interviews',
        technical_approach: 'Peer-to-peer video pairing + collaborative code editor',
        technology_stack: 'WebRTC, Node.js, React',
        target_users: 'Software developers and students',
        source_url: 'https://www.pramp.com/'
      },
      {
        solution_name: 'Interviewing.io',
        problem_addressed: 'Access to elite senior FAANG interviewer feedback',
        technical_approach: 'Anonymous human-to-human paid coaching sessions',
        technology_stack: 'Voice masking, WebRTC, Django',
        target_users: 'Mid-level and senior software engineers',
        source_url: 'https://interviewing.io/'
      },
      {
        solution_name: 'LeetCode',
        problem_addressed: 'Algorithmic mastery and code verification',
        technical_approach: 'Browser IDE + Automated backend judge engine',
        technology_stack: 'React, Monaco Editor, Go, Docker',
        target_users: 'Global software engineers and interview candidates',
        source_url: 'https://leetcode.com/'
      }
    ],
    comparative_insights: {
      common_approaches: [
        'Role-specific coding and behavioral question banks.',
        'Collaborative coding environments with test suites.',
        'Post-interview score cards.'
      ],
      key_differences: [
        'Pramp relies on finding human scheduling availability.',
        'LeetCode focuses strictly on algorithmic code submission without conversational pacing.',
        'AI mock interviewers provide 24/7 on-demand practice with zero scheduling friction.'
      ],
      strengths: [
        'Zero human scheduling delays — available 24/7 on demand.',
        'Objective, unhurried feedback with speech pacing analysis (filler words per minute).'
      ],
      limitations: [
        'AI may lack subtle human nuance during highly creative or non-standard architectural discussions.',
        'Requires reliable browser microphone access and low-latency audio processing.'
      ],
      potential_gaps: [
        'Potential opportunity to provide live resume parsing to customize questions directly around candidate past projects.',
        'Potential opportunity to simulate stressful interviewer interruptions and dynamic whiteboard sketches.'
      ]
    },
    technologies: [
      { category: 'Conversational AI', name: 'Google Gemini API / OpenAI API', purpose: 'Conducting dynamic roleplay, assessing STAR criteria, and generating follow-up questions.', url: 'https://ai.google.dev/' },
      { category: 'Speech Transcription', name: 'Whisper API / Web Speech API', purpose: 'Real-time spoken response transcription and speech rate measurement.', url: 'https://github.com/openai/whisper' },
      { category: 'Code Editor', name: 'Monaco Editor (VS Code in Browser)', purpose: 'Interactive syntax-highlighted code editor for technical challenges.', url: 'https://microsoft.github.io/monaco-editor/' },
      { category: 'Sandboxed Code Execution', name: 'Pyodide / Judge0 API', purpose: 'Secure client-side and cloud Python/JS code execution against unit tests.', url: 'https://judge0.com/' },
      { category: 'Frontend UI', name: 'Next.js 15 / React + Tailwind CSS', purpose: 'Modern, low-latency audio/video interview interface with audio visualizer wave.', url: 'https://nextjs.org/' }
    ],
    resources_and_tools: [
      { name: 'Monaco Editor Documentation', resource_type: 'Official Documentation', description: 'Complete API reference for embedding the VS Code code editor in web apps.', url: 'https://microsoft.github.io/monaco-editor/' },
      { name: 'HuggingFace Audio Models Hub', resource_type: 'Framework', description: 'Pre-trained models for emotion analysis, speech pacing, and noise reduction.', url: 'https://huggingface.co/models?pipeline_tag=automatic-speech-recognition' },
      { name: 'STAR Interview Method Framework', resource_type: 'Technical Article', description: 'Standard behavioral assessment rubric (Situation, Task, Action, Result).', url: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique' }
    ],
    architecture_pipeline: [
      { layer: 'Media & Voice Layer', components: ['Web Audio API', 'MediaStream Recorder'], details: 'Voice input and audio waveform animation' },
      { layer: 'Transcription Tier', components: ['Whisper Speech-to-Text', 'Filler Word Parser'], details: 'Speech-to-text pipeline' },
      { layer: 'Agentic LLM Coach', components: ['Gemini 1.5 Flash', 'System Prompt Rubrics'], details: 'Adaptive conversational logic' },
      { layer: 'Code Sandbox Tier', components: ['Monaco Editor', 'Judge0 Sandboxed Runner'], details: 'Algorithm testing and execution' },
      { layer: 'Analytics & Scorecard', components: ['PostgreSQL', 'Radar Performance Chart'], details: 'Comprehensive evaluation report' }
    ],
    implementation_phases: [
      { phase_number: 1, phase_name: 'Interview Taxonomy & Rubric Design', steps: ['Define 5 roles (Frontend, Backend, Fullstack, Data Science, Product Manager)', 'Create standard STAR rubric weighting (Content: 40%, Clarity: 30%, Pacing: 30%)'] },
      { phase_number: 2, phase_name: 'Browser Audio Recorder & Visualizer', steps: ['Implement Web Audio API hook in React', 'Render real-time audio waveform canvas during candidate speech'] },
      { phase_number: 3, phase_name: 'Speech-to-Text Integration', steps: ['Connect Whisper transcription pipeline', 'Extract speech rate (words per minute) and filler word frequency (um, ah, like)'] },
      { phase_number: 4, phase_name: 'Adaptive LLM Interview Agent', steps: ['Construct system prompt with target job description context', 'Implement structured JSON response parsing for interviewer replies and score tracking'] },
      { phase_number: 5, phase_name: 'Monaco Code Editor & Sandbox', steps: ['Embed Monaco Editor in React', 'Implement client-side test execution with Pyodide / Judge0'] },
      { phase_number: 6, phase_name: 'Performance Scorecard & Feedback UI', steps: ['Build detailed results page with category score breakdowns', 'Provide ideal sample answers and specific improvement recommendations'] },
      { phase_number: 7, phase_name: 'Resume Parser Integration', steps: ['Allow users to upload PDF resume to extract projects and customize question prompts'] },
      { phase_number: 8, phase_name: 'Production Deployment & INNOVEXA Launch', steps: ['Deploy frontend on Vercel / Cloudflare', 'Publish project on INNOVEXA to invite peer reviews from active hiring managers'] }
    ],
    mvp_roadmap: {
      mvp_features: [
        'Text/Voice input for 5 standard behavioral questions',
        'LLM-generated STAR feedback score for each answer',
        'Simple Monaco coding challenge with 2 test cases',
        'Summary score card'
      ],
      version_2_features: [
        'Live speech-to-text with filler word count and pacing meter',
        'Resume PDF upload to tailor questions to user experience',
        'Exportable PDF evaluation report'
      ],
      advanced_features: [
        'AI Avatar voice synthesis (Text-to-Speech video stream)',
        'Simulated system architecture whiteboard challenge',
        'Direct referral match to hiring companies on INNOVEXA'
      ]
    },
    improvement_opportunities: [
      'Potential opportunity to add real-time emotional and confidence modulation suggestions.',
      'Potential opportunity to integrate company-specific interview question archives (e.g. Google, Amazon, Microsoft styles).',
      'Potential opportunity to offer peer review verification where verified engineers review AI-generated scorecards.'
    ],
    next_steps: [
      'Review Monaco Editor and Web Audio API integration tutorials.',
      'Test the Gemini 1.5 Flash prompt structure for roleplay interviewers.',
      'Build the core React mock interview session workspace.',
      'Publish your project on INNOVEXA to collect feedback from student peer communities.'
    ]
  }
};

/**
 * Searches and ranks Supabase / Local Context projects genuinely matching the query.
 */
export async function searchRelatedInnovexaProjects(
  query: string,
  contextProjects: Project[] = []
): Promise<InnovexaMatchedProject[]> {
  const cleanTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let poolOfProjects: Project[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data: dbProjects } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles(id, full_name, avatar_url, username),
          tags:project_tags(tag),
          signals:innovation_signals(*),
          votes:project_votes(*)
        `)
        .limit(30);

      if (dbProjects && dbProjects.length > 0) {
        poolOfProjects = dbProjects.map((p: any) => ({
          id: p.id,
          owner_id: p.owner_id,
          owner_name: p.owner?.full_name || 'Innovator',
          owner_avatar: p.owner?.avatar_url,
          title: p.title,
          project_type: p.project_type,
          category: p.category,
          problem_title: p.problem_title,
          problem_description: p.problem_description,
          solution_description: p.solution_description,
          target_audience: p.target_audience,
          value_proposition: p.value_proposition,
          differentiation: p.differentiation,
          live_url: p.live_url,
          github_url: p.github_url,
          cover_image_url: p.cover_image_url,
          status: p.status,
          validation_status: p.validation_status,
          visibility: p.visibility,
          tags: p.tags?.map((t: any) => t.tag) || ['Innovation'],
          current_version: p.current_version || 1,
          created_at: p.created_at,
          updated_at: p.updated_at,
          validation_score: p.validation_score || 50,
          readiness_score: p.signals?.[0]?.readiness_score || p.validation_score || 50,
          reviews_count: 0,
          upvotes_count: p.votes?.filter((v: any) => v.vote_type === 'up').length || 0,
          downvotes_count: p.votes?.filter((v: any) => v.vote_type === 'down').length || 0
        }));
      }
    } catch (e) {
      console.warn('Failed to query Supabase projects, using local context:', e);
    }
  }

  if (poolOfProjects.length === 0) {
    poolOfProjects = [...contextProjects, ...SEED_PROJECTS];
  }

  const scored = poolOfProjects.map(p => {
    let score = 0;
    const whyRelated: string[] = [];

    const titleLower = p.title.toLowerCase();
    const probLower = (p.problem_description + ' ' + p.problem_title).toLowerCase();
    const solLower = (p.solution_description + ' ' + p.value_proposition).toLowerCase();
    const catLower = p.category.toLowerCase();
    const tagsLower = (p.tags || []).join(' ').toLowerCase();

    cleanTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 35;
        whyRelated.push(`Project title matches "${term}"`);
      }
      if (probLower.includes(term)) {
        score += 25;
        whyRelated.push(`Problem statement addresses "${term}"`);
      }
      if (solLower.includes(term)) {
        score += 20;
        whyRelated.push(`Proposed solution incorporates "${term}"`);
      }
      if (tagsLower.includes(term)) {
        score += 15;
        whyRelated.push(`Tagged with #${term}`);
      }
      if (catLower.includes(term)) {
        score += 15;
        whyRelated.push(`Belongs to ${p.category} category`);
      }
    });

    const normalizedScore = Math.min(98, score);

    return {
      id: p.id,
      title: p.title,
      category: p.category,
      project_type: p.project_type,
      problem_title: p.problem_title,
      problem_description: p.problem_description,
      solution_description: p.solution_description,
      target_audience: p.target_audience || 'Domain Users',
      similarityScore: normalizedScore,
      whyRelated: Array.from(new Set(whyRelated)).slice(0, 3),
      readinessScore: p.readiness_score || 50,
      upvotesCount: p.upvotes_count || 0
    };
  })
  .filter(p => p.similarityScore >= 30)
  .sort((a, b) => b.similarityScore - a.similarityScore);

  return scored.slice(0, 4);
}

/**
 * Executes the complete AI Research & Project-Building pipeline.
 */
export async function executeAIResearch(
  rawQuery: string,
  contextProjects: Project[] = []
): Promise<DetailedAIResearchReport> {
  const startTime = Date.now();
  const query = rawQuery.trim();

  const relatedInnovexaProjects = await searchRelatedInnovexaProjects(query, contextProjects);

  const qLower = query.toLowerCase();
  let matchedBenchmark = Object.values(VERIFIED_DOMAIN_BENCHMARKS).find(b => 
    b.keywords.some(k => qLower.includes(k))
  );

  if (!matchedBenchmark) {
    const words = query.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    matchedBenchmark = {
      keywords: [],
      overview: `Researching the domain of "${query}". This initiative explores automated solutions, technical workflows, and scalable architectures designed to address core inefficiencies in this domain.`,
      concept: {
        title: `${words} System`,
        description: `A specialized system designed to streamline and automate core workflows in "${query}".`,
        problem_addressed: `Inefficient, manual, or fragmented processes currently facing practitioners and users in ${query}.`,
        target_users: `Direct practitioners, domain specialists, and organizations operating in ${query}.`,
        why_it_matters: `Automating and optimizing this workflow creates quantifiable time savings, lowers operational overhead, and drives measurable impact.`
      },
      proposed_solution: {
        title: `Intelligent ${words} Architecture`,
        description: `A fullstack modular application that combines real-time data ingestion, intelligent logic processing, and user-friendly dashboards.`,
        user_experience: `Users interact with a clean web interface to configure parameters, ingest data, and receive automated recommendations.`,
        core_utility: `Centralizes fragmented processes into a single verifiable execution engine.`
      },
      how_it_works: [
        { step_number: 1, stage: 'Data Ingestion', action: 'User inputs requirements or uploads domain data', technical_detail: 'REST / GraphQL JSON payload ingestion' },
        { step_number: 2, stage: 'Preprocessing & Validation', action: 'Sanitizes input data and validates schema constraints', technical_detail: 'Pydantic / Zod schema validation' },
        { step_number: 3, stage: 'Core Logic & Intelligence', action: 'Executes domain algorithms and heuristic analysis', technical_detail: 'Modular Python execution engine' },
        { step_number: 4, stage: 'Decision & Formatting', action: 'Synthesizes findings into actionable recommendations', technical_detail: 'Confidence scoring and prioritization' },
        { step_number: 5, stage: 'Dashboard Delivery', action: 'Renders intuitive interactive views and exportable reports', technical_detail: 'React UI visualization' },
        { step_number: 6, stage: 'Feedback Loop', action: 'User reviews outcome and logs feedback signals', technical_detail: 'Continuous learning telemetry' }
      ],
      related_solutions: [
        {
          name: `arXiv Scientific Research Hub`,
          description: `Open-access archive for thousands of scholarly articles covering computer science, ML, and applied technologies.`,
          what_it_does: `Peer-reviewed scientific literature and state-of-the-art methodology search.`,
          why_related: `Primary source for academic papers related to ${query}.`,
          url: `https://arxiv.org/`,
          source_type: 'Research Paper',
          domain: 'arxiv.org',
          relevance: 90
        },
        {
          name: `GitHub Open Source Explore`,
          description: `Global repository network hosting open-source software libraries, frameworks, and developer tools.`,
          what_it_does: `Source code repositories and developer documentation.`,
          why_related: `Find active open-source projects addressing ${query}.`,
          url: `https://github.com/`,
          source_type: 'GitHub Repository',
          domain: 'github.com',
          relevance: 92
        },
        {
          name: `Hugging Face Models Hub`,
          description: `Open ecosystem of AI/ML models, datasets, and collaborative web applications.`,
          what_it_does: `Pre-trained machine learning checkpoints and public datasets.`,
          why_related: `Access ready-to-use AI pipelines for ${query}.`,
          url: `https://huggingface.co/models`,
          source_type: 'Framework',
          domain: 'huggingface.co',
          relevance: 89
        }
      ],
      solution_comparison: [
        {
          solution_name: 'arXiv Open Research',
          problem_addressed: `Academic and scientific grounding for ${query}`,
          technical_approach: 'Peer-reviewed preprints and algorithmic benchmarks',
          technology_stack: 'LaTeX, PDF, Open Indexing',
          target_users: 'Researchers and technical architects',
          source_url: 'https://arxiv.org/'
        },
        {
          solution_name: 'GitHub Open Source',
          problem_addressed: `Software implementation primitives for ${query}`,
          technical_approach: 'Modular codebases with permissive open-source licenses',
          technology_stack: 'Git, Multi-language SDKs',
          target_users: 'Software engineers and developers',
          source_url: 'https://github.com/'
        }
      ],
      comparative_insights: {
        common_approaches: [
          'Modular service-oriented architecture.',
          'Open REST API communication and JSON payloads.',
          'Cloud-native containerized deployments.'
        ],
        key_differences: [
          'Academic research prioritizes algorithmic rigor over production UI.',
          'Open-source libraries provide raw building blocks that require tailored UX integration.'
        ],
        strengths: [
          'Broad availability of modern open-source toolkits.',
          'Rapid prototyping capabilities with modern web frameworks.'
        ],
        limitations: [
          'Generalist tools require domain-specific customization to meet end-user needs.'
        ],
        potential_gaps: [
          `Opportunity to build a unified, turnkey consumer application specifically tailored for ${query}.`
        ]
      },
      technologies: [
        { category: 'Frontend UI', name: 'React + Vite', purpose: 'Rapid, responsive single-page application development with modern component architecture.', url: 'https://react.dev/' },
        { category: 'Backend API', name: 'FastAPI (Python)', purpose: 'High-performance async web framework for business logic and model orchestration.', url: 'https://fastapi.tiangolo.com/' },
        { category: 'Database & Auth', name: 'PostgreSQL / Supabase', purpose: 'Scalable relational database with row-level security and real-time synchronization.', url: 'https://supabase.com/' },
        { category: 'Deployment', name: 'Docker & Cloud Containers', purpose: 'Reproducible environment packaging and scalable cloud hosting.', url: 'https://www.docker.com/' }
      ],
      resources_and_tools: [
        { name: 'FastAPI Documentation', resource_type: 'Official Documentation', description: 'Official guide for building production Python APIs.', url: 'https://fastapi.tiangolo.com/' },
        { name: 'React Documentation', resource_type: 'Official Documentation', description: 'Modern React documentation and hooks reference.', url: 'https://react.dev/' },
        { name: 'PostgreSQL Official Documentation', resource_type: 'Official Documentation', description: 'Comprehensive relational database reference.', url: 'https://www.postgresql.org/docs/' }
      ],
      architecture_pipeline: [
        { layer: 'Client Presentation', components: ['React 18', 'Tailwind CSS', 'Responsive UI'], details: 'User interaction and state management' },
        { layer: 'API Gateway', components: ['FastAPI Server', 'Pydantic Models', 'JWT Auth'], details: 'Endpoint handling and security' },
        { layer: 'Business & AI Logic', components: ['Python Engine', 'Background Tasks'], details: 'Core algorithm execution' },
        { layer: 'Data Persistence', components: ['PostgreSQL', 'S3 Object Storage'], details: 'Secure data storage' }
      ],
      implementation_phases: [
        { phase_number: 1, phase_name: 'Requirements & Scope', steps: ['Define core user stories and target pain points', 'Map input and output data structures'] },
        { phase_number: 2, phase_name: 'Architecture & Tech Selection', steps: ['Select frontend and backend libraries', 'Initialize version control repository'] },
        { phase_number: 3, phase_name: 'Core Logic & Engine Prototype', steps: ['Implement processing logic and heuristics', 'Write automated unit tests'] },
        { phase_number: 4, phase_name: 'API Service Layer', steps: ['Build REST endpoints in FastAPI', 'Document OpenAPI schemas'] },
        { phase_number: 5, phase_name: 'Frontend Application', steps: ['Build user interface and input forms', 'Connect API endpoints'] },
        { phase_number: 6, phase_name: 'Database & Persistence', steps: ['Setup schema migrations in PostgreSQL', 'Implement user authentication'] },
        { phase_number: 7, phase_name: 'Testing & Hardening', steps: ['Conduct usability testing', 'Optimize response times and error handling'] },
        { phase_number: 8, phase_name: 'Deployment & INNOVEXA Launch', steps: ['Deploy application to cloud provider', 'Publish project on INNOVEXA for community feedback'] }
      ],
      mvp_roadmap: {
        mvp_features: [
          'Core input interface',
          'Primary processing pipeline',
          'Results summary dashboard',
          'Basic user authentication'
        ],
        version_2_features: [
          'Historical data logging and exports',
          'Batch processing capabilities',
          'Customizable user preferences'
        ],
        advanced_features: [
          'Multi-user team collaboration',
          'Automated background anomaly monitoring',
          'Public API access for third-party integrations'
        ]
      },
      improvement_opportunities: [
        `Opportunity for specialized UX depth tailored exclusively to ${query}.`,
        'Opportunity for self-hosted, privacy-first deployment with zero external vendor lock-in.',
        'Opportunity for automated peer review and validation on INNOVEXA.'
      ],
      next_steps: [
        'Review the recommended technology stack and documentation.',
        'Initialize your local development environment.',
        'Build the MVP core pipeline according to the implementation roadmap.',
        'Create your project on INNOVEXA to receive structured feedback from community reviewers.'
      ]
    };
  }

  let liveAiData: any = null;
  let groundingSources: ExternalSourceItem[] = [];
  let hasLiveWebGrounding = false;

  try {
    const response = await fetch('/api/ai-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        matchedInnovexaProjects: relatedInnovexaProjects
      })
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        liveAiData = resJson.data;
        if (resJson.groundingSources && Array.isArray(resJson.groundingSources)) {
          groundingSources = resJson.groundingSources.filter((s: any) => isValidHttpUrl(s.url));
          hasLiveWebGrounding = groundingSources.length > 0;
        }
      }
    }
  } catch (err) {
    console.warn('AI research backend request failed, using verified domain benchmark:', err);
  }

  const verifiedRelatedSolutions = (liveAiData?.related_solutions && Array.isArray(liveAiData.related_solutions)
    ? liveAiData.related_solutions.map((sol: any) => {
        const isUrlValid = isValidHttpUrl(sol.url);
        return {
          name: sol.name || 'Discovered Solution',
          description: sol.description || 'Existing market solution.',
          what_it_does: sol.what_it_does || sol.description || 'Domain capabilities.',
          why_related: sol.why_related || `Relevant to "${query}".`,
          url: isUrlValid ? sol.url : (matchedBenchmark.related_solutions[0]?.url || 'https://github.com/'),
          source_type: sol.source_type || 'Existing Product',
          domain: isUrlValid ? extractDomain(sol.url) : extractDomain(matchedBenchmark.related_solutions[0]?.url || 'https://github.com/'),
          relevance: typeof sol.relevance === 'number' ? sol.relevance : 90
        };
      })
    : matchedBenchmark.related_solutions
  );

  const verifiedTechnologies = (liveAiData?.technologies && Array.isArray(liveAiData.technologies)
    ? liveAiData.technologies.map((t: any) => ({
        category: t.category || 'Framework',
        name: t.name || 'Technology',
        purpose: t.purpose || 'Recommended component for this architecture.',
        url: isValidHttpUrl(t.url) ? t.url : 'https://github.com/'
      }))
    : matchedBenchmark.technologies
  );

  const verifiedResources = (liveAiData?.resources_and_tools && Array.isArray(liveAiData.resources_and_tools)
    ? liveAiData.resources_and_tools.map((r: any) => ({
        name: r.name || 'Resource',
        resource_type: r.resource_type || 'Documentation',
        description: r.description || 'Technical asset.',
        url: isValidHttpUrl(r.url) ? r.url : 'https://arxiv.org/'
      }))
    : matchedBenchmark.resources_and_tools
  );

  const allVerifiedSources: ExternalSourceItem[] = [
    ...groundingSources,
    ...verifiedRelatedSolutions.map((s: any) => ({
      title: s.name,
      url: s.url,
      domain: s.domain,
      sourceType: (s.source_type as any) || 'Existing Product',
      description: s.description,
      relevance: s.relevance
    })),
    ...verifiedTechnologies.map((t: any) => ({
      title: t.name,
      url: t.url,
      domain: extractDomain(t.url),
      sourceType: 'Official Documentation' as const,
      description: t.purpose,
      relevance: 90
    })),
    ...verifiedResources.map((r: any) => ({
      title: r.name,
      url: r.url,
      domain: extractDomain(r.url),
      sourceType: (r.resource_type as any) || 'Dataset',
      description: r.description,
      relevance: 92
    }))
  ].filter((s: ExternalSourceItem, idx: number, arr: ExternalSourceItem[]) => 
    isValidHttpUrl(s.url) && arr.findIndex(item => item.url.toLowerCase() === s.url.toLowerCase()) === idx
  );

  const report: DetailedAIResearchReport = {
    query,
    overview: liveAiData?.overview || matchedBenchmark.overview,
    concept: {
      title: liveAiData?.concept?.title || matchedBenchmark.concept.title,
      description: liveAiData?.concept?.description || matchedBenchmark.concept.description,
      problem_addressed: liveAiData?.concept?.problem_addressed || matchedBenchmark.concept.problem_addressed,
      target_users: liveAiData?.concept?.target_users || matchedBenchmark.concept.target_users,
      why_it_matters: liveAiData?.concept?.why_it_matters || matchedBenchmark.concept.why_it_matters
    },
    proposed_solution: {
      title: liveAiData?.proposed_solution?.title || matchedBenchmark.proposed_solution.title,
      description: liveAiData?.proposed_solution?.description || matchedBenchmark.proposed_solution.description,
      user_experience: liveAiData?.proposed_solution?.user_experience || matchedBenchmark.proposed_solution.user_experience,
      core_utility: liveAiData?.proposed_solution?.core_utility || matchedBenchmark.proposed_solution.core_utility
    },
    how_it_works: (liveAiData?.how_it_works && Array.isArray(liveAiData.how_it_works) && liveAiData.how_it_works.length >= 3)
      ? liveAiData.how_it_works
      : matchedBenchmark.how_it_works,
    related_solutions: verifiedRelatedSolutions,
    related_innovexa_projects: relatedInnovexaProjects,
    solution_comparison: (liveAiData?.solution_comparison && Array.isArray(liveAiData.solution_comparison) && liveAiData.solution_comparison.length > 0)
      ? liveAiData.solution_comparison.map((sc: any) => ({
          ...sc,
          source_url: isValidHttpUrl(sc.source_url) ? sc.source_url : 'https://github.com/'
        }))
      : matchedBenchmark.solution_comparison,
    comparative_insights: {
      common_approaches: liveAiData?.comparative_insights?.common_approaches || matchedBenchmark.comparative_insights.common_approaches,
      key_differences: liveAiData?.comparative_insights?.key_differences || matchedBenchmark.comparative_insights.key_differences,
      strengths: liveAiData?.comparative_insights?.strengths || matchedBenchmark.comparative_insights.strengths,
      limitations: liveAiData?.comparative_insights?.limitations || matchedBenchmark.comparative_insights.limitations,
      potential_gaps: liveAiData?.comparative_insights?.potential_gaps || matchedBenchmark.comparative_insights.potential_gaps
    },
    technologies: verifiedTechnologies,
    resources_and_tools: verifiedResources,
    architecture_pipeline: (liveAiData?.architecture_pipeline && Array.isArray(liveAiData.architecture_pipeline) && liveAiData.architecture_pipeline.length > 0)
      ? liveAiData.architecture_pipeline
      : matchedBenchmark.architecture_pipeline,
    implementation_phases: (liveAiData?.implementation_phases && Array.isArray(liveAiData.implementation_phases) && liveAiData.implementation_phases.length >= 4)
      ? liveAiData.implementation_phases
      : matchedBenchmark.implementation_phases,
    mvp_roadmap: {
      mvp_features: liveAiData?.mvp_roadmap?.mvp_features || matchedBenchmark.mvp_roadmap.mvp_features,
      version_2_features: liveAiData?.mvp_roadmap?.version_2_features || matchedBenchmark.mvp_roadmap.version_2_features,
      advanced_features: liveAiData?.mvp_roadmap?.advanced_features || matchedBenchmark.mvp_roadmap.advanced_features
    },
    improvement_opportunities: liveAiData?.improvement_opportunities || matchedBenchmark.improvement_opportunities,
    next_steps: liveAiData?.next_steps || matchedBenchmark.next_steps,
    verified_sources: allVerifiedSources,
    searchDurationMs: Date.now() - startTime,
    hasLiveWebGrounding
  };

  saveRecentSearch(query);

  return report;
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_RESEARCH);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): void {
  try {
    const current = getRecentSearches().filter(q => q.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...current].slice(0, 8);
    localStorage.setItem(STORAGE_RECENT_RESEARCH, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent search:', e);
  }
}

export function getSavedResearch(): DetailedAIResearchReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_RESEARCH);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveResearch(report: DetailedAIResearchReport): boolean {
  try {
    const current = getSavedResearch();
    const existingIndex = current.findIndex(r => r.query.toLowerCase() === report.query.toLowerCase());
    let updated: DetailedAIResearchReport[];
    let nowSaved: boolean;

    if (existingIndex >= 0) {
      updated = current.filter((_, idx) => idx !== existingIndex);
      nowSaved = false;
    } else {
      updated = [report, ...current];
      nowSaved = true;
    }

    localStorage.setItem(STORAGE_SAVED_RESEARCH, JSON.stringify(updated));
    return nowSaved;
  } catch {
    return false;
  }
}

export function isResearchSaved(query: string): boolean {
  try {
    const current = getSavedResearch();
    return current.some(r => r.query.toLowerCase() === query.toLowerCase());
  } catch {
    return false;
  }
}

// ====================================================
// BACKWARD COMPATIBILITY TYPES & METHODS (for studio/blueprints)
// ====================================================

export interface RelatedSolutionApproach {
  id: string;
  title: string;
  name?: string;
  tag: string;
  tagColor?: string;
  badge?: string;
  summary: string;
  architectureSummary?: string;
  feasibilityScore: number;
  speedToMarketDays: number;
  estimatedCloudCost: string;
  securityPrivacy?: string;
  coreStack: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  whyChooseThis?: string;
  speedRating: number;
  privacyRating: number;
  costRating: number;
  scalabilityRating: number;
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  category: 'Feature' | 'Performance' | 'UI/UX' | 'Security' | 'Monetization' | 'DevOps';
  categoryLabel?: string;
  badgeColor?: string;
  impact: 'High' | 'Medium' | 'Quick Win';
  effort?: string;
  description: string;
  actionableStep: string;
  codeSnippet?: string;
  language?: string;
}

export interface ResearchConstraints {
  techStackPreference?: string;
  deploymentTarget?: string;
  privacyLevel?: string;
  costBudget?: string;
  projectScale?: string;
  targetPlatform?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  phase?: number | string;
  title: string;
  duration: string;
  goals: string[];
  deliverables: string[];
  deliverable?: string;
  tasks?: any[];
  keyTools: string[];
  isLocked?: boolean;
}

export interface ResearchSolution {
  id: string;
  query: string;
  queryTitle?: string;
  title: string;
  executiveSummary: string;
  problemStatement: string;
  projectCategory?: string;
  constraints?: ResearchConstraints;
  feasibilityScore?: number;
  speedToMarketDays?: number;
  estimatedCloudCost?: string;
  keyTakeaways?: string[];
  proposedArchitecture: {
    frontend: string;
    backend: string;
    database: string;
    aiEngine: string;
    deployment: string;
  };
  architecture?: any[];
  recommendedStack: {
    category: string;
    toolName: string;
    reason: string;
    githubStars?: number;
    officialUrl: string;
  }[];
  openSourceStack?: any[];
  roadmap: RoadmapPhase[];
  starterCodeSnippets: {
    filename: string;
    language: string;
    code: string;
    explanation: string;
  }[];
  codeBundle?: CodeBundle;
  tradeoffAnalysis: {
    dimension: string;
    recommendation: string;
    alternative: string;
    tradeoffVerdict: string;
  }[];
  tradeoffs?: any[];
  pitfallsAndMitigations?: any[];
  suggestions: ProjectSuggestion[];
  relatedSolutions?: RelatedSolutionApproach[];
  activeApproachId?: string;
}

export interface ConceptCategory {
  id: string;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
}

export const CONCEPT_CATEGORIES: ConceptCategory[] = [
  {
    id: 'arch-backend',
    label: 'Architecture & Backend',
    shortLabel: 'Backend & APIs',
    badgeColor: '#6875E8',
    description: 'Server logic, REST/gRPC endpoints, microservices, and compute jobs.'
  },
  {
    id: 'frontend-ux',
    label: 'Frontend & UX',
    shortLabel: 'Frontend UI',
    badgeColor: '#4FA89B',
    description: 'User interface components, responsive design, and state management.'
  },
  {
    id: 'ai-analytics',
    label: 'AI & Analytics Engine',
    shortLabel: 'AI / ML Models',
    badgeColor: '#E8B653',
    description: 'Inference pipelines, embeddings, prompt engineering, and training.'
  },
  {
    id: 'database-vector',
    label: 'Database & Vector Search',
    shortLabel: 'Data & DB',
    badgeColor: '#E66F82',
    description: 'Schemas, migrations, vector indexing, caching, and persistence.'
  },
  {
    id: 'devops-deploy',
    label: 'DevOps & Deployment',
    shortLabel: 'Cloud & DevOps',
    badgeColor: '#8E90A2',
    description: 'Docker containers, CI/CD pipelines, cloud hosting, and environment configs.'
  },
  {
    id: 'security-compliance',
    label: 'Security & Compliance',
    shortLabel: 'Security & Auth',
    badgeColor: '#E66F82',
    description: 'Authentication, authorization, secrets management, and encryption.'
  },
  {
    id: 'testing-qa',
    label: 'Testing & QA',
    shortLabel: 'Testing & QA',
    badgeColor: '#4FA89B',
    description: 'Unit tests, end-to-end testing, load tests, and reliability checks.'
  }
];

export interface StarterSnippet {
  filename: string;
  language: string;
  code: string;
  title?: string;
  description?: string;
  explanation?: string;
  installCli?: string;
}

export interface CodeBundle {
  python: StarterSnippet;
  typescript: StarterSnippet;
  sql: StarterSnippet;
  docker: StarterSnippet;
  bash?: StarterSnippet;
  files?: StarterSnippet[];
}

export interface QuickAnswer {
  answer: string;
  recommendations: string[];
  suggestedStack?: string[];
  codeSnippet?: { language: string; code: string } | null;
  recommendedTools: { id: string; name: string; stars: string; description: string; installCommand: string }[];
  relatedQuestions: string[];
  sources?: ExternalSourceItem[];
}

export async function askResearchQuestion(
  question: string,
  _context?: string
): Promise<QuickAnswer> {
  return {
    answer: `Here is architectural guidance for "${question}". Prioritize separation of concerns, containerized micro-services, and structured state flows.`,
    recommendations: [
      'Use modular handler functions for high cohesion.',
      'Leverage async/await with connection pooling for database queries.',
      'Implement structured telemetry and error logging.'
    ],
    suggestedStack: ['TypeScript', 'FastAPI', 'PostgreSQL'],
    codeSnippet: {
      language: 'TypeScript',
      code: `// Suggested implementation pattern\nexport async function handleRequest(payload: any) {\n  return { success: true, processedAt: new Date().toISOString() };\n}`
    },
    recommendedTools: [
      { id: 'tool-fastapi', name: 'FastAPI', stars: '75k', description: 'Async Python framework with OpenAPI generation.', installCommand: 'pip install fastapi uvicorn' },
      { id: 'tool-pg', name: 'PostgreSQL', stars: '45k', description: 'Robust relational database with vector search.', installCommand: 'docker run -p 5432:5432 postgres' }
    ],
    relatedQuestions: [
      'How to scale vector index queries in PostgreSQL?',
      'What are the best authentication patterns for this API?'
    ]
  };
}

export interface GeneratedConceptTaskOption {
  id: string;
  title: string;
  description: string;
  category: string;
  conceptId?: string;
  conceptLabel: string;
  badgeColor: string;
  priority: 'Low' | 'Medium' | 'High' | 'low' | 'medium' | 'high';
  estimatedHours: number;
  deliverable: string;
  suggestedTools: string[];
  targetPhaseNumber: number;
}

export function isTaskDuplicate(existingTasks: { title: string }[], candidateTitle: string): boolean {
  const norm = candidateTitle.trim().toLowerCase();
  return existingTasks.some(t => t.title.trim().toLowerCase() === norm);
}

export function generateConceptBasedTasks(
  arg1?: any,
  arg2?: any,
  arg3?: any,
  arg4?: any,
  arg5?: any
): GeneratedConceptTaskOption[] {
  let categoryId = 'arch-backend';
  let phaseNumber = 1;

  if (typeof arg1 === 'string') {
    categoryId = arg1;
  } else if (arg1 && typeof arg1 === 'object' && arg1.id) {
    categoryId = arg1.id;
  } else if (typeof arg2 === 'string') {
    categoryId = arg2;
  }

  if (typeof arg3 === 'number') {
    phaseNumber = arg3;
  } else if (typeof arg4 === 'number') {
    phaseNumber = arg4;
  }

  const matched = CONCEPT_CATEGORIES.find(c => c.id === categoryId || c.label === categoryId) || CONCEPT_CATEGORIES[0];

  return [
    {
      id: `gen-task-${Date.now()}-1`,
      title: `Implement ${matched.shortLabel} baseline`,
      description: `Setup foundational boilerplate and unit test specs for ${matched.label}.`,
      category: matched.id,
      conceptId: matched.id,
      conceptLabel: matched.shortLabel,
      badgeColor: matched.badgeColor,
      priority: 'High',
      estimatedHours: 6,
      deliverable: `${matched.shortLabel} baseline module`,
      suggestedTools: ['TypeScript', 'FastAPI', 'Docker'],
      targetPhaseNumber: phaseNumber
    },
    {
      id: `gen-task-${Date.now()}-2`,
      title: `Optimize ${matched.shortLabel} throughput & telemetry`,
      description: `Add caching and telemetry instrumentation for ${matched.label}.`,
      category: matched.id,
      conceptId: matched.id,
      conceptLabel: matched.shortLabel,
      badgeColor: matched.badgeColor,
      priority: 'Medium',
      estimatedHours: 4,
      deliverable: `Optimized ${matched.shortLabel} benchmarks`,
      suggestedTools: ['Redis', 'Prometheus'],
      targetPhaseNumber: phaseNumber
    }
  ];
}

export async function performProjectDeepResearch(
  project: any,
  customPrompt?: string
): Promise<ResearchSolution> {
  const title = project.title || customPrompt || 'Innovation Platform';
  const category = project.category || project.projectCategory || 'Technology';

  return {
    id: `research-${Date.now()}`,
    query: title,
    queryTitle: title,
    title: `${title} Architecture & Blueprint`,
    executiveSummary: `Technical specifications and phased roadmap for "${title}" in the ${category} domain.`,
    problemStatement: project.problem_description || project.problem_title || 'Addressing domain workflow friction.',
    projectCategory: category,
    feasibilityScore: 88,
    speedToMarketDays: 30,
    estimatedCloudCost: '$25–$50/mo',
    keyTakeaways: [
      'Focus on modular micro-architecture to isolate frontend from model inference.',
      'Deploy on serverless containers to minimize idle compute expenses.'
    ],
    proposedArchitecture: {
      frontend: 'React 18 + Vite + Tailwind CSS',
      backend: 'FastAPI (Python 3.11)',
      database: 'PostgreSQL + pgvector',
      aiEngine: 'Google Gemini 1.5 Flash / ONNX Runtime',
      deployment: 'Docker + Render / Vercel'
    },
    architecture: [
      { layer: 'Client Tier', name: 'Presentation Layer', component: 'React 18 Client', components: ['React 18', 'Tailwind CSS'], technology: 'React + TypeScript', role: 'Interactive responsive user interface', badgeColor: '#4FA89B', description: 'Responsive web UI' },
      { layer: 'API Gateway', name: 'Service Layer', component: 'FastAPI Backend', components: ['FastAPI', 'Pydantic'], technology: 'Python 3.11', role: 'REST APIs and inference router', badgeColor: '#6875E8', description: 'REST APIs and validation' },
      { layer: 'Persistence', name: 'Database Tier', component: 'PostgreSQL DB', components: ['PostgreSQL', 'pgvector'], technology: 'PostgreSQL', role: 'Structured project metadata and vectors', badgeColor: '#E8B653', description: 'Structured storage' }
    ],
    recommendedStack: [
      { category: 'Frontend', toolName: 'React 18', reason: 'High performance component state management.', officialUrl: 'https://react.dev/' },
      { category: 'Backend', toolName: 'FastAPI', reason: 'Async Python performance with automatic OpenAPI docs.', officialUrl: 'https://fastapi.tiangolo.com/' },
      { category: 'Database', toolName: 'PostgreSQL', reason: 'Scalable relational data storage with pgvector support.', officialUrl: 'https://www.postgresql.org/' }
    ],
    openSourceStack: [
      { category: 'Frontend', name: 'React 18', stars: '220k', license: 'MIT', description: 'Component architecture.', installCommand: 'npm install react react-dom', toolName: 'React 18', reason: 'Component architecture.', officialUrl: 'https://react.dev/' },
      { category: 'Backend', name: 'FastAPI', stars: '75k', license: 'MIT', description: 'Modern high-performance web framework.', installCommand: 'pip install fastapi uvicorn', toolName: 'FastAPI', reason: 'Fast async APIs', officialUrl: 'https://fastapi.tiangolo.com/' }
    ],
    roadmap: [
      {
        id: 'phase-1',
        phaseNumber: 1,
        phase: 1,
        title: 'MVP Pipeline & Architecture',
        duration: 'Weeks 1–2',
        goals: ['Setup development environment', 'Implement core input handlers'],
        deliverables: ['Working prototype repository', 'API endpoints'],
        deliverable: 'Working prototype repository',
        tasks: ['Initialize project boilerplate', 'Configure environment variables', 'Build baseline API route'],
        keyTools: ['Git', 'FastAPI', 'React']
      },
      {
        id: 'phase-2',
        phaseNumber: 2,
        phase: 2,
        title: 'Core Engine & Persistence',
        duration: 'Weeks 3–4',
        goals: ['Connect database migrations', 'Implement business logic'],
        deliverables: ['Database schemas', 'Test suite'],
        deliverable: 'Database schemas and migrations',
        tasks: ['Setup database tables', 'Connect ORM layer', 'Implement authentication'],
        keyTools: ['PostgreSQL', 'PyTest']
      }
    ],
    starterCodeSnippets: [
      {
        filename: 'main.py',
        language: 'python',
        code: `from fastapi import FastAPI\n\napp = FastAPI(title="${title} API")\n\n@app.get("/health")\ndef health():\n    return {"status": "healthy", "service": "${title}"}\n`,
        explanation: 'FastAPI starter endpoint'
      }
    ],
    codeBundle: {
      python: {
        filename: 'main.py',
        language: 'python',
        title: 'FastAPI Backend Core',
        description: 'Async REST API application with healthcheck and inference route.',
        installCli: 'pip install fastapi uvicorn pydantic',
        code: `from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI(title="${title} Engine")\n\n@app.get("/health")\ndef health():\n    return {"status": "healthy", "service": "${title}"}\n`
      },
      typescript: {
        filename: 'useInference.ts',
        language: 'typescript',
        title: 'React Client Hook',
        description: 'Type-safe custom React hook for communicating with the backend API.',
        installCli: 'npm install axios @tanstack/react-query',
        code: `import { useState, useCallback } from 'react';\n\nexport function useInference() {\n  const [loading, setLoading] = useState(false);\n  return { loading };\n}\n`
      },
      sql: {
        filename: 'schema.sql',
        language: 'sql',
        title: 'PostgreSQL Database Schema',
        description: 'Optimized schema tables and vector index.',
        installCli: 'docker run --name pg-vector -p 5432:5432 -d ankane/pgvector',
        code: `-- PostgreSQL Initial Schema\nCREATE TABLE IF NOT EXISTS projects (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  title TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n`
      },
      docker: {
        filename: 'docker-compose.yml',
        language: 'yaml',
        title: 'Docker Compose Stack',
        description: 'Containerized orchestration for backend and database.',
        installCli: 'docker compose up -d --build',
        code: `version: '3.8'\nservices:\n  api:\n    build: .\n    ports:\n      - "8000:8000"\n`
      }
    },
    tradeoffAnalysis: [
      {
        dimension: 'Deployment Architecture',
        recommendation: 'Cloud Container Service',
        alternative: 'Bare Metal Server',
        tradeoffVerdict: 'Cloud containers provide 10x faster iteration with zero hardware maintenance.'
      }
    ],
    tradeoffs: [
      { dimension: 'Hosting', optionA: 'Managed Cloud', optionB: 'Self-Hosted', verdict: 'Managed cloud speeds initial time-to-market.' }
    ],
    pitfallsAndMitigations: [
      { pitfall: 'Over-engineering early features', mitigation: 'Stick strictly to the 4-phase MVP scope.', risk: 'Schedule delay', severity: 'Medium' }
    ],
    suggestions: [
      {
        id: 'sug-1',
        title: 'Add Client-Side Input Caching',
        category: 'Performance',
        categoryLabel: 'Performance',
        badgeColor: 'blue',
        impact: 'Quick Win',
        effort: 'Low',
        description: 'Store form state in localStorage to prevent data loss on browser refresh.',
        actionableStep: 'Implement useLocalStorage custom hook in React.'
      }
    ],
    relatedSolutions: [
      {
        id: 'approach-1',
        title: 'Fullstack Open Source Blueprint',
        name: 'Fullstack Open Source Blueprint',
        tag: 'OPEN_SOURCE',
        tagColor: 'emerald',
        badge: 'HIGH ADOPTION',
        summary: 'Standard modular microservice architecture built with permissive open source tools.',
        architectureSummary: 'React 18 + FastAPI + PostgreSQL',
        feasibilityScore: 92,
        speedToMarketDays: 21,
        estimatedCloudCost: '$15–$30/mo',
        securityPrivacy: 'Full Data Ownership',
        coreStack: ['React', 'FastAPI', 'PostgreSQL', 'Docker'],
        pros: ['Zero vendor lock-in', '100% self-hostable'],
        cons: ['Requires DevOps setup'],
        bestFor: 'Developers seeking maximum control',
        whyChooseThis: 'Provides full stack transparency and zero recurring API costs.',
        speedRating: 85,
        privacyRating: 98,
        costRating: 95,
        scalabilityRating: 90
      }
    ],
    activeApproachId: 'approach-1'
  };
}

export function generateProjectRecommendations(
  projectOrSolution: any,
  _customPrompt?: string,
  _seed?: number
): ProjectSuggestion[] {
  if (projectOrSolution && Array.isArray(projectOrSolution.suggestions)) {
    return projectOrSolution.suggestions;
  }
  return [
    {
      id: `sug-${Date.now()}-1`,
      title: 'Implement Progressive Caching Layer',
      category: 'Performance',
      categoryLabel: 'Performance & Speed',
      badgeColor: '#4FA89B',
      impact: 'High',
      effort: 'Low',
      description: 'Add in-memory cache to reduce database round-trips.',
      actionableStep: 'Install Redis client and add 5-minute TTL caching on frequent GET routes.'
    },
    {
      id: `sug-${Date.now()}-2`,
      title: 'Automate GitHub Actions CI Test Runner',
      category: 'DevOps',
      categoryLabel: 'DevOps & Quality',
      badgeColor: '#6875E8',
      impact: 'High',
      effort: 'Medium',
      description: 'Run automatic linting and test coverage checks on pull requests.',
      actionableStep: 'Add .github/workflows/ci.yml with pytest and npm test stages.'
    }
  ];
}

export function saveBlueprintToStorage(solution: ResearchSolution): void {
  try {
    const existing = getSavedBlueprints().filter(b => b.id !== solution.id);
    localStorage.setItem(STORAGE_SAVED_BLUEPRINTS, JSON.stringify([solution, ...existing]));
  } catch (e) {
    console.warn('Failed to save blueprint:', e);
  }
}

export function getSavedBlueprints(): ResearchSolution[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_BLUEPRINTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function switchSolutionApproach(solution: ResearchSolution, approachId: string): ResearchSolution {
  return {
    ...solution,
    activeApproachId: approachId
  };
}
