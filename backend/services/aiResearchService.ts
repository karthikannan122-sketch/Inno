import { Project } from '../types/database';
import { OPEN_SOURCE_TOOLS, OpenSourceTool } from '../data/openSourceDirectory';

export interface ArchitectureLayer {
  layer: string;
  component: string;
  technology: string;
  role: string;
  badgeColor: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  duration: string;
  tasks: string[];
  deliverable: string;
}

export interface StarterSnippet {
  title: string;
  language: string;
  filename: string;
  description: string;
  code: string;
  installCli: string;
}

export interface CodeBundle {
  python: StarterSnippet;
  typescript: StarterSnippet;
  sql: StarterSnippet;
  docker: StarterSnippet;
  bash: StarterSnippet;
}

export interface TradeoffItem {
  aspect: string;
  openSourceAdvantage: string;
  proprietaryAlternative: string;
  recommendation: string;
}

export interface PitfallItem {
  risk: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface ProjectSuggestion {
  id: string;
  category: 'quick_win' | 'differentiation' | 'growth' | 'open_source' | 'monetization' | 'ux_onboarding';
  categoryLabel: string;
  title: string;
  description: string;
  impact: 'High Impact' | 'Game Changer' | 'Crucial Foundation';
  effort: 'Low Effort (< 1 day)' | 'Medium (2-3 days)' | 'Strategic';
  actionableStep: string;
  badgeColor: string;
}

export interface ResearchConstraints {
  privacyLevel: '100% Offline / Self-Hosted' | 'Hybrid (Local + Cloud)' | 'Cloud Native';
  projectScale: 'MVP (1-1,000 users)' | 'Growth (10,000 users)' | 'Scale (100,000+ users)';
  monthlyBudget: '$0 (Local / Free Tier)' | '$5 - $25 (Single VPS)' | '$50+ (High Availability)';
  targetPlatform: 'Web Application' | 'Mobile App (iOS/Android)' | 'Cross-Platform Fullstack';
}

export interface RelatedSolutionApproach {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor?: string;
  architectureSummary: string;
  coreStack: string[];
  feasibilityScore: number;
  speedToMarketDays: number;
  estimatedCloudCost: string;
  pros: string[];
  cons: string[];
  securityPrivacy: string;
  scalabilityRating: 'Medium' | 'High' | 'Very High';
  whyChooseThis: string;
  architectureLayers: ArchitectureLayer[];
  starterSnippet: StarterSnippet;
}

export interface ResearchSolution {
  id: string;
  queryTitle: string;
  projectCategory: string;
  executiveSummary: string;
  feasibilityScore: number;
  speedToMarketDays: number;
  estimatedCloudCost: string;
  activeApproachId: string;
  relatedSolutions: RelatedSolutionApproach[];
  architecture: ArchitectureLayer[];
  openSourceStack: OpenSourceTool[];
  roadmap: RoadmapPhase[];
  starterCodeSnippet: StarterSnippet;
  codeBundle: CodeBundle;
  tradeoffs: TradeoffItem[];
  pitfallsAndMitigations: PitfallItem[];
  suggestions: ProjectSuggestion[];
  constraints: ResearchConstraints;
  keyTakeaways: string[];
  generatedAt: string;
}

const STORAGE_SAVED_BLUEPRINTS = 'innovexa_saved_research_blueprints';

export function getSavedBlueprints(): ResearchSolution[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_BLUEPRINTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveBlueprintToStorage(solution: ResearchSolution): void {
  try {
    const current = getSavedBlueprints();
    const exists = current.some(b => b.id === solution.id);
    if (!exists) {
      localStorage.setItem(STORAGE_SAVED_BLUEPRINTS, JSON.stringify([solution, ...current]));
    }
  } catch (e) {}
}

export function removeSavedBlueprint(id: string): void {
  try {
    const current = getSavedBlueprints();
    const updated = current.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_SAVED_BLUEPRINTS, JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Domain & intent classifier analyzing user search queries.
 */
interface AnalyzedIntent {
  domain: string;
  titleClean: string;
  targetAudience: string;
  primaryProblem: string;
  recommendedArchitectureType: string;
  recommendedDatabase: string;
  speedDays: number;
  feasibility: number;
  monthlyCost: string;
  entityName: string;
}

export function analyzeQueryIntent(query: string, project?: Partial<Project>): AnalyzedIntent {
  const text = (query + ' ' + (project?.title || '') + ' ' + (project?.category || '') + ' ' + (project?.problem_description || '') + ' ' + (project?.tags || []).join(' ')).toLowerCase();
  const titleClean = query.trim() || project?.title || 'Open Innovation Architecture';
  
  // Extract main subject noun if possible
  const words = titleClean.split(/\s+/).filter(w => !['a', 'an', 'the', 'for', 'with', 'and', 'in', 'of', 'to'].includes(w.toLowerCase()));
  const entityName = words.slice(0, 2).join('_').toLowerCase().replace(/[^a-z0-9_]/g, '') || 'item';

  if (text.includes('food') || text.includes('waste') || text.includes('sustainab') || text.includes('rescue') || text.includes('climate') || text.includes('circular') || text.includes('green') || text.includes('eco')) {
    return {
      domain: 'sustainability',
      titleClean,
      targetAudience: 'Local community members, surplus food businesses, and sustainability advocates',
      primaryProblem: 'Surplus food and perishable goods wasted due to lack of real-time neighborhood logistics and flash-sale channels',
      recommendedArchitectureType: 'Event-driven Geolocation & Real-Time Micro-Marketplace Stack',
      recommendedDatabase: 'PostgreSQL 16 + PostGIS Spatial Geolocation',
      speedDays: 7,
      feasibility: 94,
      monthlyCost: '$10 - $20/mo (VPS + Redis)',
      entityName: 'surplus_batch'
    };
  }

  if (text.includes('study') || text.includes('learn') || text.includes('student') || text.includes('course') || text.includes('syllabus') || text.includes('educat') || text.includes('academic') || text.includes('school') || text.includes('exam')) {
    return {
      domain: 'education',
      titleClean,
      targetAudience: 'University students, academic researchers, and self-directed learners',
      primaryProblem: 'Fragmented academic syllabi, cognitive burnout, and missing automated spaced-repetition revision schedules',
      recommendedArchitectureType: 'Intelligent Academic Workspace with Spaced-Repetition RAG & Document Parsing',
      recommendedDatabase: 'PostgreSQL 16 + pgvector (Syllabus & Lecture Embeddings)',
      speedDays: 6,
      feasibility: 96,
      monthlyCost: '$5 - $15/mo',
      entityName: 'study_module'
    };
  }

  if (text.includes('drone') || text.includes('robot') || text.includes('hardware') || text.includes('sensor') || text.includes('iot') || text.includes('telemetry')) {
    return {
      domain: 'iot_hardware',
      titleClean,
      targetAudience: 'Hardware engineers, fleet operators, and industrial drone/IoT managers',
      primaryProblem: 'High-frequency telemetry data ingestion bottlenecks, offline transmission packet loss, and battery degradation tracking',
      recommendedArchitectureType: 'High-Throughput Time-Series Ingestion & Edge Telemetry Pipeline',
      recommendedDatabase: 'TimescaleDB (PostgreSQL Time-Series) + MQTT Broker',
      speedDays: 8,
      feasibility: 91,
      monthlyCost: '$15 - $30/mo',
      entityName: 'telemetry_packet'
    };
  }

  if (text.includes('health') || text.includes('patient') || text.includes('medical') || text.includes('clinic') || text.includes('doctor') || text.includes('telemedicine') || text.includes('biotech') || text.includes('pill')) {
    return {
      domain: 'health',
      titleClean,
      targetAudience: 'Patients, remote clinicians, caregivers, and medical researchers',
      primaryProblem: 'Siloed electronic health records (EHR), high cloud compliance vulnerability, and delayed triage response times',
      recommendedArchitectureType: 'HIPAA-Compliant Encrypted Local-First Health & Triage Workspace',
      recommendedDatabase: 'Encrypted PostgreSQL (FHIR Schema) + Local Private Ollama Inference',
      speedDays: 9,
      feasibility: 89,
      monthlyCost: '$15 - $35/mo (Encrypted VPS)',
      entityName: 'patient_record'
    };
  }

  if (text.includes('crypto') || text.includes('web3') || text.includes('finance') || text.includes('payment') || text.includes('wallet') || text.includes('escrow') || text.includes('arbitrage') || text.includes('billing')) {
    return {
      domain: 'fintech',
      titleClean,
      targetAudience: 'Financial traders, contractors, fintech operators, and decentralized ledger users',
      primaryProblem: 'Exorbitant payment gateway cut fees (3%+), slow settlement periods, and opaque accounting audits',
      recommendedArchitectureType: 'Audited Double-Entry Ledger & Non-Custodial Escrow Settlement Stack',
      recommendedDatabase: 'PostgreSQL (Append-Only Audit Ledger) + Redis Distributed Locks',
      speedDays: 8,
      feasibility: 90,
      monthlyCost: '$15 - $30/mo',
      entityName: 'ledger_transaction'
    };
  }

  if (text.includes('music') || text.includes('audio') || text.includes('video') || text.includes('media') || text.includes('stream') || text.includes('creator') || text.includes('stem')) {
    return {
      domain: 'media_audio',
      titleClean,
      targetAudience: 'Audio producers, podcasters, video creators, and indie artists',
      primaryProblem: 'Heavy GPU audio rendering costs, proprietary codec licensing, and slow multi-track waveform processing',
      recommendedArchitectureType: 'Asynchronous Audio/Media Pipeline with FFmpeg & Demucs Worker Pool',
      recommendedDatabase: 'PostgreSQL + MinIO S3 Object Storage + Celery Task Queue',
      speedDays: 7,
      feasibility: 92,
      monthlyCost: '$15 - $35/mo',
      entityName: 'media_asset'
    };
  }

  if (text.includes('shop') || text.includes('ecommerce') || text.includes('cart') || text.includes('store') || text.includes('inventory') || text.includes('product') || text.includes('delivery')) {
    return {
      domain: 'ecommerce',
      titleClean,
      targetAudience: 'Direct-to-consumer merchants, brand founders, and online shoppers',
      primaryProblem: 'High recurring SaaS platform commissions, slow checkout page load times, and rigid database customization',
      recommendedArchitectureType: 'Headless Modular E-Commerce Stack (Next.js 15 + MedusaJS + Stripe)',
      recommendedDatabase: 'PostgreSQL 16 (Orders & Inventory) + Redis (Cart Sessions)',
      speedDays: 7,
      feasibility: 93,
      monthlyCost: '$10 - $25/mo',
      entityName: 'inventory_item'
    };
  }

  if (text.includes('ai') || text.includes('llm') || text.includes('rag') || text.includes('agent') || text.includes('vector') || text.includes('embedding') || text.includes('nlp')) {
    return {
      domain: 'ai_rag',
      titleClean,
      targetAudience: 'AI engineers, enterprise knowledge teams, and automation builders',
      primaryProblem: 'High recurring proprietary API token invoices, data privacy exposure, and hallucinated unstructured answers',
      recommendedArchitectureType: 'Zero-Cost Local RAG & Autonomous Agent Workflow (Ollama + pgvector + LangChain)',
      recommendedDatabase: 'PostgreSQL 16 + pgvector (HNSW Indexing) + ChromaDB',
      speedDays: 5,
      feasibility: 95,
      monthlyCost: '$0 - $10/mo (Local / VPS)',
      entityName: 'knowledge_doc'
    };
  }

  return {
    domain: 'general',
    titleClean,
    targetAudience: 'Builders, community operators, and end-users seeking a modern, fast digital solution',
    primaryProblem: `High friction, manual latency, and excessive proprietary costs in current ${titleClean} workflows`,
    recommendedArchitectureType: 'High-Performance Open-Source Modular Stack with Sub-Millisecond Caching',
    recommendedDatabase: 'PostgreSQL 16 + Redis Cache + Meilisearch',
    speedDays: 6,
    feasibility: 93,
    monthlyCost: '$5 - $15/mo',
    entityName: 'workflow_item'
  };
}

/**
 * Open Source matching algorithm tailored dynamically to the query domain.
 */
export function matchOpenSourceTools(project: Partial<Project>, query = ''): OpenSourceTool[] {
  const intent = analyzeQueryIntent(query, project);
  const queryLower = (query + ' ' + (project.title || '') + ' ' + (project.category || '')).toLowerCase();

  const domainPriorityMap: Record<string, string[]> = {
    ai_rag: ['ollama', 'langchain', 'chromadb', 'vllm', 'supabase', 'fastapi'],
    education: ['nextjs', 'fastapi', 'supabase', 'ollama', 'meilisearch', 'redis'],
    sustainability: ['supabase', 'nextjs', 'fastapi', 'redis', 'coolify', 'meilisearch'],
    iot_hardware: ['fastapi', 'supabase', 'redis', 'coolify', 'nextjs'],
    ecommerce: ['nextjs', 'medusa', 'supabase', 'redis', 'meilisearch', 'coolify'],
    fintech: ['nextjs', 'fastapi', 'supabase', 'redis', 'coolify'],
    health: ['fastapi', 'supabase', 'ollama', 'nextjs', 'coolify'],
    media_audio: ['fastapi', 'redis', 'supabase', 'nextjs', 'coolify'],
    general: ['nextjs', 'supabase', 'fastapi', 'meilisearch', 'redis', 'coolify']
  };

  const priorityIds = domainPriorityMap[intent.domain] || domainPriorityMap.general;

  const matched = OPEN_SOURCE_TOOLS.filter(t => 
    priorityIds.includes(t.id) || 
    t.useCaseMatch.some(uc => queryLower.includes(uc.toLowerCase())) ||
    t.tags.some(tag => queryLower.includes(tag.toLowerCase()))
  );

  return Array.from(new Set([...matched, ...OPEN_SOURCE_TOOLS])).slice(0, 6);
}

/**
 * Generates rich, input-specific AI research synthesis with 3 DISTINCT related solutions for comparison.
 */
export async function performProjectDeepResearch(
  project: Partial<Project>,
  customPrompt?: string,
  constraints?: Partial<ResearchConstraints>
): Promise<ResearchSolution> {
  const query = customPrompt?.trim() || project.title || 'General Innovation';
  const intent = analyzeQueryIntent(query, project);
  const matchedTools = matchOpenSourceTools(project, query);

  const finalConstraints: ResearchConstraints = {
    privacyLevel: constraints?.privacyLevel || '100% Offline / Self-Hosted',
    projectScale: constraints?.projectScale || 'MVP (1-1,000 users)',
    monthlyBudget: constraints?.monthlyBudget || '$5 - $25 (Single VPS)',
    targetPlatform: constraints?.targetPlatform || 'Web Application'
  };

  // ── 3 DISTINCT RELATED SOLUTION APPROACHES ──
  const approach1: RelatedSolutionApproach = {
    id: 'approach_fullstack_oss',
    title: 'Modern Fullstack Open-Source Stack',
    subtitle: 'Optimal for Fast MVP Launch & Community Traction',
    tag: 'Recommended Approach',
    tagColor: '#E66F82',
    architectureSummary: `Combines Next.js 15 App Router on the client with FastAPI async background endpoints, backed by ${intent.recommendedDatabase} and Redis caching.`,
    coreStack: ['Next.js 15', 'FastAPI (Python 3.12)', 'PostgreSQL 16', 'Redis', 'Docker Compose'],
    feasibilityScore: intent.feasibility,
    speedToMarketDays: intent.speedDays,
    estimatedCloudCost: intent.monthlyCost,
    pros: [
      'Fastest development velocity with zero proprietary cloud lock-in',
      'Ultra-responsive UI with server-rendered React Server Components',
      'Can be self-hosted on a single $10/mo VPS with Coolify'
    ],
    cons: [
      'Requires basic Linux server administration if self-hosting',
      'Need to configure automated database snapshot cronjobs'
    ],
    securityPrivacy: 'Self-hosted VPS with strict SSL reverse proxy',
    scalabilityRating: 'High',
    whyChooseThis: 'Best balance of rapid prototype speed, low monthly hosting bill, and modular codebase maintainability.',
    architectureLayers: [
      {
        layer: '01 / Presentation & Client Layer',
        component: 'Server-Rendered Reactive UI',
        technology: 'Next.js 15 + TailwindCSS + shadcn/ui',
        role: `Renders fluid, accessible interfaces for ${intent.targetAudience} with instant sub-50ms page transitions.`,
        badgeColor: '#E66F82'
      },
      {
        layer: '02 / High-Speed API Gateway',
        component: 'Async Application Service',
        technology: 'FastAPI + Pydantic (Python 3.12)',
        role: `Executes high-throughput business logic, token validation, and rate limiting for ${intent.titleClean}.`,
        badgeColor: '#5AAFA3'
      },
      {
        layer: '03 / Database Engine',
        component: 'Relational ACID Storage Engine',
        technology: intent.recommendedDatabase,
        role: `Manages schema persistence with indexed spatial/vector scanning.`,
        badgeColor: '#E8B653'
      },
      {
        layer: '04 / Cache & Task Broker',
        component: 'In-Memory Pub/Sub & Worker Queue',
        technology: 'Redis (Valkey) + Celery / BullMQ',
        role: 'Processes async background jobs and caches high-frequency queries.',
        badgeColor: '#8875E8'
      },
      {
        layer: '05 / Deployment Container',
        component: 'Automated Container Orchestration',
        technology: 'Docker Compose + Coolify (Self-Hosted PaaS)',
        role: 'Packages the stack into self-healing containers with automated SSL.',
        badgeColor: '#8FA6DD'
      }
    ],
    starterSnippet: {
      title: `FastAPI Core Service for ${intent.titleClean}`,
      language: 'python',
      filename: 'main.py',
      description: `Production-ready async REST API handling ${intent.titleClean} domain entities.`,
      installCli: 'pip install fastapi uvicorn pydantic asyncpg redis',
      code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os

app = FastAPI(title="${intent.titleClean} Service", version="1.0.0")

class ${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Payload(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    metadata: dict = {}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "architecture": "fullstack_oss", "service": "${intent.titleClean}"}

@app.post("/api/v1/${intent.entityName}s")
async def create_${intent.entityName}(payload: ${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Payload):
    # Core domain business logic for ${intent.titleClean}
    result = {
        "id": "item-101",
        "title": payload.title,
        "status": "processed",
        "feasibility_score": ${intent.feasibility},
        "message": "Successfully recorded in open-source database"
    }
    return {"success": True, "data": result}`
    }
  };

  const approach2: RelatedSolutionApproach = {
    id: 'approach_local_private_ai',
    title: '100% Offline & Private Local-First Architecture',
    subtitle: 'Zero Cloud Token Invoices & Complete Data Sovereignty',
    tag: 'Privacy & Offline First',
    tagColor: '#2F855A',
    architectureSummary: `Runs local LLM models with Ollama, SQLite/DuckDB embedded storage, and client-side vector search. Zero external API calls.`,
    coreStack: ['Ollama (Llama 3 / Mistral)', 'LangChain', 'SQLite / DuckDB', 'Tauri / React', 'Local pgvector'],
    feasibilityScore: 92,
    speedToMarketDays: Math.max(intent.speedDays - 1, 4),
    estimatedCloudCost: '$0.00 / month (100% Free / Local)',
    pros: [
      'Zero monthly cloud or API bill ($0/mo indefinitely)',
      '100% HIPAA and GDPR compliant with zero data exfiltration',
      'Works completely offline on airplanes or private intranets'
    ],
    cons: [
      'Requires client machine to have minimum 8GB RAM for local model execution',
      'Syncing across multiple devices requires local peer-to-peer relay setup'
    ],
    securityPrivacy: 'Air-gapped / 100% Local Hardware Encrypted',
    scalabilityRating: 'Medium',
    whyChooseThis: 'Ideal for privacy-critical applications, healthcare data, student privacy, and developers avoiding high recurring API billing.',
    architectureLayers: [
      {
        layer: '01 / Local Desktop/Web App',
        component: 'Native Lightweight Client',
        technology: 'Tauri + React + TailwindCSS',
        role: `Provides instant 60fps desktop experience with direct local filesystem and SQLite access.`,
        badgeColor: '#2F855A'
      },
      {
        layer: '02 / Local Model Engine',
        component: 'Private Neural Inference Engine',
        technology: 'Ollama (Llama 3.2 / DeepSeek R1)',
        role: `Executes reasoning, summarization, and task orchestration directly on local hardware.`,
        badgeColor: '#E66F82'
      },
      {
        layer: '03 / Embedded Vector Storage',
        component: 'Local File-Based Database',
        technology: 'DuckDB / SQLite with sqlite-vec',
        role: `Stores all user records and embeddings locally in a single encrypted .db file.`,
        badgeColor: '#E8B653'
      },
      {
        layer: '04 / Local Pipeline Orchestration',
        component: 'Private Document & Task Pipeline',
        technology: 'LangChain Local / ChromaDB',
        role: 'Retrieves local documents and context without third-party network egress.',
        badgeColor: '#8875E8'
      }
    ],
    starterSnippet: {
      title: `Local Private Ollama Pipeline for ${intent.titleClean}`,
      language: 'python',
      filename: 'local_engine.py',
      description: 'Zero-cloud execution script utilizing local Ollama models and sqlite-vec.',
      installCli: 'pip install langchain-community langchain-ollama duckdb',
      code: `import duckdb
from langchain_ollama import OllamaLLM

print("✦ Initializing Local Offline Engine for ${intent.titleClean}...")

# 1. Connect to local embedded database (zero cloud dependency)
db = duckdb.connect("${intent.entityName}_local.db")
db.execute("""
    CREATE TABLE IF NOT EXISTS records (
        id VARCHAR PRIMARY KEY,
        title VARCHAR,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# 2. Query local Ollama model directly on device
llm = OllamaLLM(model="llama3.2")
response = llm.invoke("Synthesize top optimization tips for: ${intent.primaryProblem}")

print("✔ Local AI Analysis:")
print(response)`
    }
  };

  const approach3: RelatedSolutionApproach = {
    id: 'approach_distributed_microservices',
    title: 'Distributed Event-Driven & High-Scale Microservices',
    subtitle: 'Engineered for 100k+ Concurrency & High Availability',
    tag: 'Hyper-Scale Architecture',
    tagColor: '#6875E8',
    architectureSummary: `Distributed microservices with vLLM GPU inference clusters, Supabase managed PostgreSQL, and Redis Streams event mesh.`,
    coreStack: ['vLLM Cluster', 'Supabase PostgreSQL', 'Redis Streams', 'Go / Rust Gateway', 'Kubernetes'],
    feasibilityScore: 88,
    speedToMarketDays: intent.speedDays + 4,
    estimatedCloudCost: '$40 - $80 / month',
    pros: [
      'Handles 100,000+ simultaneous active users with zero degradation',
      'Decoupled microservice architecture allows independent team scaling',
      'Automated failover, horizontal pod autoscaling, and multi-region read replicas'
    ],
    cons: [
      'Higher setup complexity requiring Docker swarm / Kubernetes knowledge',
      'Higher initial infrastructure baseline cost'
    ],
    securityPrivacy: 'Enterprise VPC with Role-Based Row Level Security (RLS)',
    scalabilityRating: 'Very High',
    whyChooseThis: 'Best for venture-backed startups, high-concurrency public platforms, and applications handling thousands of real-time events per second.',
    architectureLayers: [
      {
        layer: '01 / Global Edge Edge Routing',
        component: 'Multi-Region Edge Network',
        technology: 'Cloudflare Workers / Envoy Reverse Proxy',
        role: 'Terminates TLS, mitigates DDoS attacks, and routes traffic to nearest cluster.',
        badgeColor: '#6875E8'
      },
      {
        layer: '02 / High-Concurrency Gateway',
        component: 'Sub-Millisecond Event Gateway',
        technology: 'Go 1.23 / Rust Actix-Web Service',
        role: 'Handles 50,000+ concurrent WebSocket and HTTP connections.',
        badgeColor: '#5AAFA3'
      },
      {
        layer: '03 / Distributed Database Cluster',
        component: 'Replicated PostgreSQL + RLS',
        technology: 'Supabase Enterprise Postgres with Read-Replicas',
        role: 'Guarantees sub-5ms query response times with multi-node replication.',
        badgeColor: '#E8B653'
      },
      {
        layer: '04 / High-Throughput Model Serving',
        component: 'PagedAttention GPU Inference Engine',
        technology: 'vLLM Serving Cluster',
        role: 'Processes continuous batched LLM prompts with 3x higher throughput.',
        badgeColor: '#E66F82'
      },
      {
        layer: '05 / Event Mesh & Stream Broker',
        component: 'Real-Time Event Stream Broker',
        technology: 'Redis Streams / Apache Kafka',
        role: 'Buffers real-time event topics and decouples background workers.',
        badgeColor: '#8FA6DD'
      }
    ],
    starterSnippet: {
      title: `High-Throughput Go Ingestion Gateway for ${intent.titleClean}`,
      language: 'go',
      filename: 'gateway.go',
      description: 'Ultra-fast Go HTTP handler handling high concurrency data streams.',
      installCli: 'go mod init inno-gateway && go get -u github.com/gin-gonic/gin',
      code: `package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type ${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Request struct {
    Title       string \`json:"title" binding:"required"\`
    Description string \`json:"description"\`
}

func main() {
    r := gin.Default()

    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "service": "${intent.titleClean} Distributed Gateway",
            "status":  "healthy",
            "scale":   "100k_concurrency",
        })
    })

    r.POST("/api/v1/stream", func(c *gin.Context) {
        var req ${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Request
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Push event into stream queue for asynchronous worker consumption
        c.JSON(http.StatusAccepted, gin.H{
            "status": "queued",
            "item":   req.Title,
        })
    })

    r.Run(":8080")
}`
    }
  };

  const relatedSolutions = [approach1, approach2, approach3];

  // Dynamic code bundle for active approach
  const codeBundle: CodeBundle = {
    python: approach1.starterSnippet,
    typescript: {
      title: `TypeScript Client Hook for ${intent.titleClean}`,
      language: 'typescript',
      filename: 'useProjectData.ts',
      description: `React Query hook providing type-safe caching and optimistic updates for ${intent.titleClean}.`,
      installCli: 'npm install @tanstack/react-query axios lucide-react',
      code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Model {
  id: string;
  title: string;
  status: 'active' | 'pending';
  created_at: string;
}

export function use${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Data(id: string) {
  const queryClient = useQueryClient();

  return useQuery<${intent.entityName.charAt(0).toUpperCase() + intent.entityName.slice(1)}Model>({
    queryKey: ['${intent.entityName}', id],
    queryFn: async () => {
      const res = await fetch(\`/api/v1/${intent.entityName}s/\${id}\`);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}`
    },
    sql: {
      title: `PostgreSQL Database Schema for ${intent.titleClean}`,
      language: 'sql',
      filename: 'schema.sql',
      description: `Optimized PostgreSQL tables and indexes tailored for ${intent.domain}.`,
      installCli: 'psql -U postgres -d inno_db -f schema.sql',
      code: `-- Schema for ${intent.titleClean}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
${intent.domain === 'ai_rag' || intent.domain === 'education' ? 'CREATE EXTENSION IF NOT EXISTS vector;\n' : ''}
CREATE TABLE IF NOT EXISTS ${intent.entityName}s (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT '${project?.category || 'General'}',
  user_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ${intent.domain === 'ai_rag' || intent.domain === 'education' ? 'embedding vector(1536),\n  ' : ''}metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimized query indexes
CREATE INDEX IF NOT EXISTS idx_${intent.entityName}s_category ON ${intent.entityName}s(category);
CREATE INDEX IF NOT EXISTS idx_${intent.entityName}s_created ON ${intent.entityName}s(created_at DESC);`
    },
    docker: {
      title: `Production Docker Compose Stack for ${intent.titleClean}`,
      language: 'yaml',
      filename: 'docker-compose.yml',
      description: 'Orchestrates the entire application, database, and background worker containers.',
      installCli: 'docker compose up -d',
      code: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://inno_user:inno_secret@db:5432/inno_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: always

  db:
    image: ${intent.domain === 'ai_rag' || intent.domain === 'education' ? 'pgvector/pgvector:pg16' : 'postgres:16-alpine'}
    environment:
      - POSTGRES_USER=inno_user
      - POSTGRES_PASSWORD=inno_secret
      - POSTGRES_DB=inno_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  redis:
    image: valkey/valkey:7.2-alpine
    ports:
      - "6379:6379"
    restart: always

volumes:
  pgdata:`
    },
    bash: {
      title: '1-Click Server Setup Script',
      language: 'bash',
      filename: 'setup.sh',
      description: 'Automated bash setup script to provision Docker, dependencies, and start containers.',
      installCli: 'chmod +x setup.sh && ./setup.sh',
      code: `#!/usr/bin/env bash
set -e

echo "✦ Initializing ${intent.titleClean} Open Source Stack..."

# 1. Verify / Install Docker
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi

# 2. Launch Stack
echo "Starting Docker containers..."
docker compose up -d

echo "✔ ${intent.titleClean} architecture is online and healthy at http://localhost:3000!"`
    }
  };

  const roadmap: RoadmapPhase[] = [
    {
      phase: 'Phase 01',
      title: 'Foundation Setup & Schema Design',
      duration: 'Days 1–3',
      tasks: [
        `Initialize local repository with Docker Compose and Next.js 15.`,
        `Provision ${intent.recommendedDatabase} database with tables for ${intent.entityName}s.`,
        'Configure user authentication and verify local API endpoint connectivity.'
      ],
      deliverable: 'Functional local sandbox running all core services with authenticated API endpoints.'
    },
    {
      phase: 'Phase 02',
      title: 'Core Engine & Workflow Implementation',
      duration: 'Days 4–6',
      tasks: [
        `Build the primary user flow tailored for: "${intent.primaryProblem}".`,
        `Integrate ${matchedTools[0]?.name || 'primary open-source tool'} for real-time background processing.`,
        'Implement optimistic UI updates, form validations, and error boundaries.'
      ],
      deliverable: 'Working end-to-end MVP executing the core value proposition for initial users.'
    },
    {
      phase: 'Phase 03',
      title: 'Performance Tuning, Security & Launch',
      duration: 'Days 7–9',
      tasks: [
        'Set up automated database backups and rate limiting on public endpoints.',
        'Deploy container stack to a $5–$10/mo VPS using Coolify with automated HTTPS certificates.',
        'Conduct load testing, accessibility checks, and gather first feedback from community reviewers.'
      ],
      deliverable: 'Production-ready live deployment running on self-hosted infrastructure.'
    }
  ];

  const executiveSummary = `This research report provides a complete, open-source architectural blueprint for "${intent.titleClean}". 
To solve the key challenge ("${intent.primaryProblem}"), the recommended blueprint deploys an ${intent.recommendedArchitectureType}. 
By using self-hosted open-source technologies (${matchedTools.slice(0, 3).map(t => t.name).join(', ')}), you eliminate vendor lock-in, maintain 100% data ownership, and reduce projected infrastructure costs to ${intent.monthlyCost}. We also evaluated 3 distinct related architectural approaches (Modern Fullstack, Private Local AI, and Distributed Microservices) to help you pick the exact fit for your scale.`;

  const keyTakeaways = [
    `🎯 Problem Solved: Directly removes friction around ${intent.primaryProblem.toLowerCase()}.`,
    `⚡ Speed to MVP: Core functional prototype can be launched in approximately ${intent.speedDays} days.`,
    `💰 90% Cost Savings: Replaces expensive proprietary SaaS bills with an open-source self-hosted stack costing ${intent.monthlyCost}.`,
    `⚖️ 3 Related Approaches: Compare Fullstack Open Source, 100% Local Private AI, and High-Scale Microservices side-by-side.`,
    `🔒 Data Privacy & Control: 100% of data is stored in your private ${intent.recommendedDatabase.split(' ')[0]} instance with zero telemetry leaks.`
  ];

  const suggestions: ProjectSuggestion[] = [
    {
      id: `sug-1-${Date.now()}`,
      category: 'differentiation',
      categoryLabel: 'COMPETITIVE WEDGE',
      title: 'Solve for the Immediate Power-User Niche First',
      description: `Target ${intent.targetAudience} who currently face "${intent.primaryProblem}". Avoid general bloat by building hyper-focused workflows.`,
      impact: 'Game Changer',
      effort: 'Strategic',
      actionableStep: `Launch with a lightweight 1-click experience focused strictly on ${intent.titleClean}'s top feature.`,
      badgeColor: '#E66F82'
    },
    {
      id: `sug-2-${Date.now()}`,
      category: 'open_source',
      categoryLabel: 'OPEN-SOURCE MOAT',
      title: 'Leverage Pre-Built Open Source Components',
      description: `Build on top of ${matchedTools[0]?.name || 'modern open source'} rather than re-inventing authentication, database migrations, or background queues.`,
      impact: 'High Impact',
      effort: 'Low Effort (< 1 day)',
      actionableStep: `Run the provided docker-compose.yml to establish your local development stack in 2 minutes.`,
      badgeColor: '#5AAFA3'
    },
    {
      id: `sug-3-${Date.now()}`,
      category: 'quick_win',
      categoryLabel: 'FAST TIME-TO-VALUE',
      title: 'Automate Repetitive Manual Steps for Users',
      description: 'Existing alternatives require users to do tedious manual entry. Use automated background workers to handle the heavy lifting.',
      impact: 'High Impact',
      effort: 'Medium (2-3 days)',
      actionableStep: 'Implement proactive notification triggers and instant auto-formatting upon submission.',
      badgeColor: '#8875E8'
    }
  ];

  const tradeoffs: TradeoffItem[] = [
    {
      aspect: 'Infrastructure & Database',
      openSourceAdvantage: `Full control over ${intent.recommendedDatabase.split(' ')[0]}, zero row-count paywalls, self-hostable anywhere.`,
      proprietaryAlternative: 'Proprietary managed clouds ($50–$300/mo at moderate scale).',
      recommendation: `Deploy on a $10/mo Hetzner or DigitalOcean VPS using Coolify for automated management.`
    },
    {
      aspect: 'Data Privacy & Sovereignty',
      openSourceAdvantage: 'User records never leave your virtual private server, making compliance straightforward.',
      proprietaryAlternative: 'Third-party APIs subject to external logging and terms of service changes.',
      recommendation: 'Maintain local storage and encrypted backups for full compliance.'
    }
  ];

  const pitfallsAndMitigations: PitfallItem[] = [
    {
      risk: `Scope Creep: Attempting to build too many non-essential features before validating ${intent.titleClean}.`,
      severity: 'high',
      mitigation: `Follow the 3-phase roadmap strictly and launch the core deliverable in ${intent.speedDays} days before adding secondary modules.`
    },
    {
      risk: 'Database Connection Spikes during high traffic.',
      severity: 'medium',
      mitigation: 'Use connection pooling (PgBouncer or Supabase connection pooler) and cache frequent queries in Redis.'
    }
  ];

  return {
    id: `res-${Date.now()}`,
    queryTitle: intent.titleClean,
    projectCategory: project?.category || 'Technology',
    executiveSummary,
    feasibilityScore: intent.feasibility,
    speedToMarketDays: intent.speedDays,
    estimatedCloudCost: intent.monthlyCost,
    activeApproachId: 'approach_fullstack_oss',
    relatedSolutions,
    architecture: approach1.architectureLayers,
    openSourceStack: matchedTools,
    roadmap,
    starterCodeSnippet: codeBundle.python,
    codeBundle,
    tradeoffs,
    pitfallsAndMitigations,
    suggestions,
    constraints: finalConstraints,
    keyTakeaways,
    generatedAt: new Date().toISOString()
  };
}

export function switchSolutionApproach(
  currentSolution: ResearchSolution,
  approachId: string
): ResearchSolution {
  const target = currentSolution.relatedSolutions.find(s => s.id === approachId);
  if (!target) return currentSolution;

  return {
    ...currentSolution,
    activeApproachId: approachId,
    feasibilityScore: target.feasibilityScore,
    speedToMarketDays: target.speedToMarketDays,
    estimatedCloudCost: target.estimatedCloudCost,
    architecture: target.architectureLayers,
    starterCodeSnippet: target.starterSnippet,
    codeBundle: {
      ...currentSolution.codeBundle,
      python: target.starterSnippet
    }
  };
}

export function generateProjectRecommendations(
  project: Partial<Project>,
  query = '',
  seed = 1
): ProjectSuggestion[] {
  const intent = analyzeQueryIntent(query, project);
  return [
    {
      id: `rec-more-1-${seed}`,
      category: 'growth',
      categoryLabel: 'GROWTH STRATEGY',
      title: `Target High-Intent ${intent.domain.toUpperCase()} Users`,
      description: `Publish interactive demos and changelogs on INNOVEXA to attract early adopters in ${intent.domain}.`,
      impact: 'High Impact',
      effort: 'Low Effort (< 1 day)',
      actionableStep: 'Create a live demo recording and share it with community reviewers.',
      badgeColor: '#E66F82'
    },
    {
      id: `rec-more-2-${seed}`,
      category: 'ux_onboarding',
      categoryLabel: 'FRICTIONLESS ONBOARDING',
      title: 'Zero-Configuration Interactive Sandbox',
      description: 'Allow new users to experience the product without demanding a 10-field registration form upfront.',
      impact: 'High Impact',
      effort: 'Medium (2-3 days)',
      actionableStep: 'Provide a pre-seeded playground state for immediate test drives.',
      badgeColor: '#5AAFA3'
    }
  ];
}

export interface QuickAnswer {
  answer: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  recommendedTools: OpenSourceTool[];
  relatedQuestions: string[];
}

export async function askResearchQuestion(question: string): Promise<QuickAnswer> {
  const intent = analyzeQueryIntent(question);
  const tools = matchOpenSourceTools({}, question);

  return {
    answer: `For "${question}", the recommended approach is to deploy ${tools[0]?.name || 'open-source tools'} with an ${intent.recommendedArchitectureType}. This delivers sub-millisecond query performance and 100% data ownership.`,
    codeSnippet: {
      language: 'bash',
      code: `curl -fsSL https://get.docker.com | sh\ndocker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret pgvector/pgvector:pg16`
    },
    recommendedTools: tools.slice(0, 3),
    relatedQuestions: [
      `How to scale ${tools[0]?.name || 'this stack'} to 100k users?`,
      `How to configure automated backups for ${intent.recommendedDatabase.split(' ')[0]}?`,
      `What are the best monitoring metrics for ${intent.titleClean}?`
    ]
  };
}
