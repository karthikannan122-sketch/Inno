import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Code2, 
  Database, 
  Users, 
  Lock, 
  GitBranch, 
  Rocket, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  BookOpen, 
  Cpu, 
  RefreshCw, 
  Filter, 
  Activity, 
  Check, 
  Eye, 
  TrendingUp,
  Sliders,
  Award,
  Globe,
  Monitor,
  HardDrive,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

// Types
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface StageData {
  id: number;
  stageKey: string;
  title: string;
  shortTitle: string;
  category: 'discover' | 'plan' | 'build' | 'test' | 'launch';
  categoryLabel: string;
  goal: string;
  whatIsIt: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  whyImportant: string;
  whatToLearn: string[];
  whatToDo: string[];
  example: {
    bad: string;
    good: string;
    explanation: string;
  };
  innovexaFlow: string[];
  innovexaConnection: string;
  tools: string[];
  expectedOutput: string;
  checklist: { id: string; label: string }[];
  commonMistakes: { mistake: string; fix: string }[];
  practicalTask: string;
  actionButton: {
    label: string;
    route: string;
    icon?: string;
  };
}

export interface ConceptItem {
  id: string;
  name: string;
  category: 'Foundation' | 'Design & UX' | 'Architecture' | 'Data & Security' | 'AI & Algorithms' | 'DevOps & Tooling';
  definition: string;
  detailedExplanation: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  codeOrDiagram?: string;
  innovexaUsage: string;
  relatedStages: number[];
}

export interface ToolItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge: string;
  whatItIs: string;
  whyUsed: string;
  innovexaRole: string;
  officialDocUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 20 STAGES OF THE INNOVATION LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────
const ROADMAP_STAGES: StageData[] = [
  {
    id: 1,
    stageKey: 'stage_01',
    title: '01 — Discover the Problem',
    shortTitle: 'Problem Discovery',
    category: 'discover',
    categoryLabel: 'LEARN & UNDERSTAND',
    goal: 'Understand what real, tangible pain point you want to solve before touching any code.',
    whatIsIt: {
      beginner: 'A problem discovery phase is where you investigate real struggles experienced by real people. Rather than building a cool feature because you can, you identify someone who is stuck or frustrated and figure out why.',
      intermediate: 'Structured problem discovery identifies the exact discrepancy between a user’s desired state and their current reality. It quantifies the frequency, severity, and economic cost of the unresolved friction.',
      advanced: 'Systemic problem taxonomy mapping: analyzing market friction vectors, user churn root-causes, and cognitive friction surfaces using first-principles inquiry to formulate falsifiable problem hypotheses.'
    },
    whyImportant: 'Building a technically flawless solution for a non-existent problem is the #1 reason startups and student innovations fail. A validated problem guarantees an audience.',
    whatToLearn: [
      'Problem Statement Formulation',
      'Target User Persona Identification',
      'Pain Point Severity Matrix (Mild vs Severe blocker)',
      'Problem Scope & Boundary Setting',
      'First-Principles Problem Breakdown'
    ],
    whatToDo: [
      'Identify exactly who experiences the pain point.',
      'Document what currently happens when they encounter this problem.',
      'Assess how frequently the friction occurs (daily, weekly, yearly).',
      'Formulate a 1-sentence problem statement with zero jargon.'
    ],
    example: {
      bad: 'I want to build a decentralized AI application with WebSockets and animations.',
      good: 'College students applying for software internships struggle to get concrete, structured feedback on their mock technical interview answers without paying expensive private tutors.',
      explanation: 'The good example specifies who suffers (students), what they struggle with (interview feedback), and the missing alternative (expensive tutors).'
    },
    innovexaFlow: [
      'Observe human friction',
      'Draft problem thesis',
      'Identify target demographic',
      'Validate problem gravity in INNOVEXA Community'
    ],
    innovexaConnection: 'INNOVEXA encourages formulating the problem before creating a project. When you submit a project, the "Problem Statement" is the foundational anchor that the AI evaluates.',
    tools: ['User Personas', 'Problem Canvas', 'Notion', 'INNOVEXA Community Discusssions'],
    expectedOutput: 'A concise 1-to-2 sentence verified Problem Statement document.',
    checklist: [
      { id: 'c1_1', label: 'I identified the specific target user demographic.' },
      { id: 'c1_2', label: 'I identified the tangible problem without mentioning tech.' },
      { id: 'c1_3', label: 'I understand why solving this problem matters to users.' },
      { id: 'c1_4', label: 'I can explain the problem in a single crisp sentence.' }
    ],
    commonMistakes: [
      { mistake: 'Starting with a favorite technology stack instead of a user pain point.', fix: 'Anchor to the user’s daily workflow before deciding frontend vs backend.' },
      { mistake: 'Making the problem statement too broad (e.g. "Fix education").', fix: 'Narrow the scope to a specific step in the user’s journey (e.g. "Automate interview practice scoring").' }
    ],
    practicalTask: 'Write your 1-sentence Problem Statement and share it in the INNOVEXA Community to gather feedback.',
    actionButton: {
      label: 'Create Problem Statement',
      route: '/create'
    }
  },
  {
    id: 2,
    stageKey: 'stage_02',
    title: '02 — Research the Problem (Market & Users)',
    shortTitle: 'User & Market Research',
    category: 'discover',
    categoryLabel: 'RESEARCH & GROUNDING',
    goal: 'Understand existing alternatives, competitor limitations, and discover the unmet market gap.',
    whatIsIt: {
      beginner: 'Researching the problem means checking what people are doing right now to handle this problem. You look at existing software, manual spreadsheets, or workarounds and find where they fall short.',
      intermediate: 'Systematic qualitative user research and competitive landscape analysis. You evaluate indirect and direct competitors, feature sets, pricing barriers, and documented user complaints in forums.',
      advanced: 'Multi-source competitive telemetry: mapping market feature parity, API constraint analysis, pricing elasticities, and conducting semantic sentiment analysis across competitor review datasets.'
    },
    whyImportant: 'Assuming "no one has built this" usually means either you haven’t searched properly or previous attempts failed for subtle structural reasons. Knowing the landscape gives you an unfair advantage.',
    whatToLearn: [
      'Competitor Matrix Analysis (Direct vs Indirect solutions)',
      'Qualitative User Interviews & Open-ended Questioning',
      'Online Community Synthesis (Reddit, GitHub Issues, Discord)',
      'Market Gap Identification (The "Unfair Advantage")',
      'Existing Workarounds & Limitation Extraction'
    ],
    whatToDo: [
      'Search for at least 3 existing projects or commercial products addressing this space.',
      'Read 1-star and 2-star reviews of competitors to find recurring user frustrations.',
      'Interview 2 to 3 target users to understand their current workflow.',
      'Summarize the exact gap that your innovation will fill.'
    ],
    example: {
      bad: 'No competitor exists. We are the first platform ever to think of AI learning.',
      good: 'Existing platforms like LeetCode focus on automated unit tests but provide zero verbal communication feedback. Interview platforms with human coaches cost $150/hr, making them inaccessible to 85% of university students.',
      explanation: 'Acknowledges current solutions while pinpointing their exact pricing and feature limitations.'
    },
    innovexaFlow: [
      'AI Research Query',
      'Competitor Discovery',
      'Limitation Extraction',
      'Market Gap Articulation'
    ],
    innovexaConnection: 'Use the INNOVEXA "AI Research & Discovery" engine (/insights or /ai-research). It searches web knowledge bases and synthesizes competitor benchmarks and domain roadmaps in real time.',
    tools: ['INNOVEXA AI Research', 'Google Scholar', 'GitHub Explore', 'Product Hunt'],
    expectedOutput: 'A 1-page Competitive Research Summary & Gap Analysis matrix.',
    checklist: [
      { id: 'c2_1', label: 'Identified at least 3 existing solutions or direct competitors.' },
      { id: 'c2_2', label: 'Documented existing product limitations and user complaints.' },
      { id: 'c2_3', label: 'Surveyed or interviewed potential target users.' },
      { id: 'c2_4', label: 'Identified the precise opportunity/gap your project addresses.' }
    ],
    commonMistakes: [
      { mistake: 'Claiming there is zero competition.', fix: 'Even spreadsheets or doing nothing is your competition. Find how users cope today.' },
      { mistake: 'Asking leading questions in interviews (e.g. "Would you use this cool app?").', fix: 'Ask about past behavior: "How did you prepare for your last interview?"' }
    ],
    practicalTask: 'Run an AI Research Dossier query in INNOVEXA for your domain to analyze 3 market benchmarks.',
    actionButton: {
      label: 'Research Existing Solutions',
      route: '/ai-research'
    }
  },
  {
    id: 3,
    stageKey: 'stage_03',
    title: '03 — Define Your Innovation (Idea Definition)',
    shortTitle: 'Idea Definition',
    category: 'plan',
    categoryLabel: 'CONCEPT & PROPOSITION',
    goal: 'Turn the validated problem and research insights into a crystal clear, differentiated solution blueprint.',
    whatIsIt: {
      beginner: 'This stage is where you describe your solution in plain words: what it is, who it is for, what it does, and why it is better than doing things the old way.',
      intermediate: 'Formulating your Value Proposition, Unique Selling Proposition (USP), and MVP scope boundaries. Defining the core hypothesis that your prototype will test.',
      advanced: 'Value architecture definition: formalizing the primary value transfer mechanism, core loop dynamics, defensibility moat, and operational KPIs for proof-of-work validation.'
    },
    whyImportant: 'Without a tight definition, projects suffer from "feature creep"—trying to build 20 features at once and never finishing any of them.',
    whatToLearn: [
      'Value Proposition Canvas (Customer profile vs Value map)',
      'Unique Selling Proposition (USP) Crafting',
      'Minimum Viable Product (MVP) Scoping Principles',
      'Solution Boundaries (What we are NOT building)',
      'Hypothesis Formulation ("If we build X, users will achieve Y")'
    ],
    whatToDo: [
      'Write down the 1-paragraph Solution Description.',
      'Specify the single primary benefit that makes users choose your project.',
      'List the top 3 core features required for version 1.0.',
      'Define what features are intentionally deferred to future versions.'
    ],
    example: {
      bad: 'A social network for students with AI, blockchain, VR, video chat, gamification, and jobs.',
      good: 'An AI-powered mock interview simulator that asks behavioral questions via voice, transcribes responses in real time, and scores clarity and structure against STAR methodology.',
      explanation: 'Focused on one core transformation loop instead of a cluttered grab-bag of buzzwords.'
    },
    innovexaFlow: [
      'Problem Statement',
      'Solution Proposition',
      'Target Demographic',
      'Core Value Hook',
      'Project Submission'
    ],
    innovexaConnection: 'In INNOVEXA, click "Create Project" to register your innovation idea with its category, tags, and solution pitch into the decentralized project registry.',
    tools: ['Value Proposition Canvas', 'Lean Canvas', 'INNOVEXA Project Creator'],
    expectedOutput: 'A complete 1-page Project Definition and initial draft in INNOVEXA.',
    checklist: [
      { id: 'c3_1', label: 'Clearly connected the solution directly to the validated problem.' },
      { id: 'c3_2', label: 'Defined the unique value proposition (USP).' },
      { id: 'c3_3', label: 'Bounded the scope to 3 core capabilities for Version 1.0.' },
      { id: 'c3_4', label: 'Drafted project details in INNOVEXA Project Studio.' }
    ],
    commonMistakes: [
      { mistake: 'Trying to please every possible user in Version 1.0.', fix: 'Focus on serving one specific user persona exceptionally well.' },
      { mistake: 'Vague value propositions like "Save time and be happy".', fix: 'Quantify the value: "Cut interview prep time from 40 hours to 10 hours".' }
    ],
    practicalTask: 'Create your project draft inside INNOVEXA with title, category, and core value pitch.',
    actionButton: {
      label: 'Create Project',
      route: '/create'
    }
  },
  {
    id: 4,
    stageKey: 'stage_04',
    title: '04 — Validate Before Building (Smart Validation)',
    shortTitle: 'Validate Idea',
    category: 'plan',
    categoryLabel: 'COMMUNITY & SMART FEEDBACK',
    goal: 'Gather feedback and early sentiment from peers and mentors before writing thousands of lines of code.',
    whatIsIt: {
      beginner: 'Validation means showing your idea to other people and seeing if they think it is actually useful, realistic, and worth building.',
      intermediate: 'Executing pre-development validation loops: collecting structured reviews, measuring problem-solution resonance, and analyzing peer ratings on feasibility and uniqueness.',
      advanced: 'Multi-stakeholder sentiment triangulation: aggregating quantitative Likert ratings, qualitative thematic clustering, and AI semantic risk analysis to calculate an Innovation Readiness Index.'
    },
    whyImportant: 'Fixing an idea on paper takes 10 minutes. Rewriting 5,000 lines of code after building the wrong thing takes 3 months. Validate early and often.',
    whatToLearn: [
      'The INNOVEXA Smart Validation Loop',
      'Qualitative Review Synthesis',
      'Constructive Critique vs Confirmation Bias',
      'Sentiment Analysis Interpretation',
      'Feedback Triage (Which feedback to act on vs ignore)'
    ],
    whatToDo: [
      'Publish your idea on the INNOVEXA Explore & Community feed.',
      'Ask 3 to 5 peers or mentors to review your concept using the Smart Review tool.',
      'Review your project’s Validation Insights dashboard for sentiment breakdowns.',
      'Refine your scope based on feedback clusters.'
    ],
    example: {
      bad: 'Keeping the idea secret for 6 months for fear someone will copy it.',
      good: 'Posting the project draft on INNOVEXA, gathering 8 reviews highlighting that voice transcription latency might be a UX bottleneck, and adjusting the tech architecture accordingly.',
      explanation: 'Public validation uncovers technical blindspots before you write a single line of architecture.'
    },
    innovexaFlow: [
      'Create Project',
      'Publish to Explore',
      'Receive Community Reviews',
      'AI Sentiment Clustering',
      'Validation Insights Dashboard'
    ],
    innovexaConnection: 'INNOVEXA has a built-in Smart Validation Loop: Community members submit structured reviews (/projects/:id/review), and Gemini AI analyzes sentiment and clusters recurring recommendations (/projects/:id/validation).',
    tools: ['INNOVEXA Smart Review', 'Validation Insights', 'Community Discussions'],
    expectedOutput: 'A validated concept backed by at least 3 peer reviews and an AI Validation Report.',
    checklist: [
      { id: 'c4_1', label: 'Project published on INNOVEXA Explore feed.' },
      { id: 'c4_2', label: 'Collected at least 3 community reviews with feedback.' },
      { id: 'c4_3', label: 'Reviewed AI Sentiment & Category ratings on the Validation page.' },
      { id: 'c4_4', label: 'Adjusted project specifications based on actionable feedback.' }
    ],
    commonMistakes: [
      { mistake: 'Getting discouraged by critical feedback.', fix: 'Critical feedback is a gift that saves you from building something nobody wants.' },
      { mistake: 'Treating all feedback equally.', fix: 'Filter feedback by relevance to your target persona.' }
    ],
    practicalTask: 'Request feedback from 3 innovators in the INNOVEXA Community feed.',
    actionButton: {
      label: 'Validate My Idea',
      route: '/explore'
    }
  },
  {
    id: 5,
    stageKey: 'stage_05',
    title: '05 — Define What to Build (Requirements & Scope)',
    shortTitle: 'Requirements & Scope',
    category: 'plan',
    categoryLabel: 'SPECIFICATION & USER STORIES',
    goal: 'Translate the validated idea into precise, prioritized functional requirements and user stories.',
    whatIsIt: {
      beginner: 'Requirements definition is making a checklist of everything your app must do. You write user stories like "As a student, I want to record my voice so that I can practice answering interview questions."',
      intermediate: 'Writing formal Product Requirement Documents (PRDs) with Functional Requirements (what the system does) vs Non-Functional Requirements (speed, uptime, security) and MoSCoW prioritization.',
      advanced: 'Specification formalization: state machine modeling, boundary condition cataloging, API payload contracts, and error matrix definitions with strict SLA thresholds.'
    },
    whyImportant: 'Clear specifications prevent mid-development confusion and guarantee that both frontend and backend work toward the exact same user journey.',
    whatToLearn: [
      'User Story Structure: "As a [User], I want [Feature] so that [Benefit]"',
      'MoSCoW Matrix (Must Have, Should Have, Could Have, Won’t Have for v1)',
      'Functional vs Non-Functional Requirements',
      'Acceptance Criteria Definition',
      'Edge Cases & Error States'
    ],
    whatToDo: [
      'Write 5 to 8 primary User Stories covering the main user flows.',
      'Assign MoSCoW tags to every proposed feature.',
      'Define clear Acceptance Criteria for each Must-Have feature.',
      'Document non-functional requirements (e.g. response time < 1s).'
    ],
    example: {
      bad: 'Requirement: "Make the app look clean and have fast AI."',
      good: 'User Story: "As a job seeker, I want to submit a 60-second audio recording of my answer so that I can receive an automated critique within 5 seconds based on clarity and keyword coverage."',
      explanation: 'Testable, quantifiable, and defines user role, action, and expected result.'
    },
    innovexaFlow: [
      'User Personas',
      'User Stories',
      'MoSCoW Prioritization',
      'Acceptance Criteria',
      'Sprint Feature List'
    ],
    innovexaConnection: 'Use the Requirements breakdown generated in the INNOVEXA AI Research Dossier to jumpstart your technical sprint planning.',
    tools: ['Linear', 'GitHub Issues', 'Jira', 'Markdown PRD'],
    expectedOutput: 'A prioritized Product Requirements Document (PRD) with 5+ User Stories.',
    checklist: [
      { id: 'c5_1', label: 'All user roles (e.g. Creator, Reviewer, Admin) identified.' },
      { id: 'c5_2', label: 'Primary user stories written with clear acceptance criteria.' },
      { id: 'c5_3', label: 'Features strictly categorized into Must/Should/Could/Not Now.' },
      { id: 'c5_4', label: 'Non-functional constraints (latency, security, mobile) documented.' }
    ],
    commonMistakes: [
      { mistake: 'Marking all 25 features as "Must Have".', fix: 'If everything is a Must Have, your MVP will take too long to ship. Limit Must Haves to 3–5 items.' },
      { mistake: 'Writing vague acceptance criteria.', fix: 'Criteria must be binary (either it passes or it fails).' }
    ],
    practicalTask: 'Write 3 User Stories with Acceptance Criteria for your core MVP.',
    actionButton: {
      label: 'Explore System Requirements',
      route: '/ai-research'
    }
  },
  {
    id: 6,
    stageKey: 'stage_06',
    title: '06 — Design the System (Architecture)',
    shortTitle: 'System Design',
    category: 'plan',
    categoryLabel: 'SYSTEM ARCHITECTURE',
    goal: 'Understand how the frontend, backend, database, and external APIs will communicate internally.',
    whatIsIt: {
      beginner: 'System design is drawing the blueprint of how your app works behind the scenes. You plan how the user screen talks to the server, and how the server saves data into the database.',
      intermediate: 'Drafting multi-tier architectural flow diagrams: Client Application (SPA), API Gateway / Edge Functions, Relational Database with RLS, and third-party AI or payment endpoints.',
      advanced: 'Distributed system modeling: evaluating consistency vs availability trade-offs, asynchronous queue architectures, edge caching layers, rate limiting strategies, and webhook event sinks.'
    },
    whyImportant: 'A clear architecture prevents spaghetti code, avoids security loopholes, and makes building components 10x faster because every data flow is mapped out.',
    whatToLearn: [
      'Client-Server Architecture (Browser ↔ API ↔ Database)',
      'RESTful & GraphQL API Conventions',
      'Authentication & Token Passing (Bearer Tokens / Cookies)',
      'Microservices vs Pragmatic Modular Monolith',
      'External AI Service Integration Patterns'
    ],
    whatToDo: [
      'Diagram the 4 core tiers: User UI, API Layer, Database, and AI Services.',
      'Map out the endpoints or database methods required for each feature.',
      'Specify how user tokens flow through requests to enforce security.',
      'Plan error fallbacks when external APIs (like Gemini) encounter rate limits.'
    ],
    example: {
      bad: 'The frontend calls the database directly with full admin privileges, and calls OpenAI from browser JavaScript.',
      good: 'USER (React) → REST API / Supabase Client (JWT Auth) → PostgreSQL Database (Row-Level Security) → Backend / Edge Function → Gemini API (Secret Key Kept Safe).',
      explanation: 'Clean separation of concerns with protected secrets and database authorization.'
    },
    innovexaFlow: [
      'User Interaction',
      'React State / Hook',
      'Supabase Client Query',
      'Row Level Security Check',
      'PostgreSQL Storage',
      'Gemini AI Synthesis'
    ],
    innovexaConnection: 'INNOVEXA’s architecture uses React + Vite on the client, Supabase for PostgreSQL & Realtime subscriptions, and secure server-side routes for Google Gemini 2.5 AI processing.',
    tools: ['Excalidraw', 'Mermaid.js', 'Eraser.io', 'Supabase Architecture'],
    expectedOutput: 'A clean System Architecture Diagram and API Flow Chart.',
    checklist: [
      { id: 'c6_1', label: 'Frontend framework and build tool chosen.' },
      { id: 'c6_2', label: 'Backend API & Database layer mapped.' },
      { id: 'c6_3', label: 'External AI/Auth service communication documented.' },
      { id: 'c6_4', label: 'Error handling & retry mechanisms planned.' }
    ],
    commonMistakes: [
      { mistake: 'Over-engineering with 8 microservices for an early prototype.', fix: 'Start with a monolithic React + Supabase setup; scale later when needed.' },
      { mistake: 'Calling third-party AI APIs directly from client code with exposed keys.', fix: 'Always route AI requests through secure backend or Edge Functions.' }
    ],
    practicalTask: 'Draw a simple 4-box architecture diagram for your innovation.',
    actionButton: {
      label: 'View Tech Architecture',
      route: '/ai-research'
    }
  },
  {
    id: 7,
    stageKey: 'stage_07',
    title: '07 — Design the User Experience (UI/UX Design)',
    shortTitle: 'UI/UX Design',
    category: 'plan',
    categoryLabel: 'WIREFRAMING & FLOWS',
    goal: 'Plan how users will navigate, interact, and accomplish their goals smoothly without getting confused.',
    whatIsIt: {
      beginner: 'UI/UX design is planning what each screen looks like and how buttons lead from one page to another. You sketch the screens on paper or Figma before writing CSS.',
      intermediate: 'Creating interactive wireframes, component design systems (color tokens, typography, spacing), responsive mobile breakpoints, and user journey flowcharts.',
      advanced: 'Design token architecture, micro-interaction state machines, WCAG 2.1 AAA accessibility compliance, cognitive load optimization, and zero-latency optimistic UI states.'
    },
    whyImportant: 'If users cannot figure out how to use your app in 10 seconds, they will leave. Great UX makes complex innovation feel intuitive and effortless.',
    whatToLearn: [
      'User Flow Mapping (Entry → Onboarding → Core Action → Reward)',
      'Low-Fidelity vs High-Fidelity Wireframing',
      'Visual Hierarchy (Size, weight, contrast, whitespace)',
      'Mobile-First Responsive Design Principles',
      'Design Systems & Reusable UI Component Tokens'
    ],
    whatToDo: [
      'Map the step-by-step user journey from landing to core task completion.',
      'Sketch low-fidelity wireframes for the top 3 core screens.',
      'Choose a harmonious color palette (primary, background, neutral, accent).',
      'Test your wireframes with a peer to verify intuitive navigation.'
    ],
    example: {
      bad: 'A screen with 15 buttons of the exact same color, tiny unreadable grey text, and no obvious starting button.',
      good: 'A clean dashboard with a prominent "Start Mock Interview" action button, clear visual progress badges, and high-contrast typography.',
      explanation: 'Clear visual hierarchy guides user attention directly to the primary value action.'
    },
    innovexaFlow: [
      'User Lands on Explore',
      'Inspects Project Card',
      'Opens Project Detail',
      'Submits 30s Smart Review',
      'Observes Live Validation Update'
    ],
    innovexaConnection: 'INNOVEXA uses an editorial, light theme (`#F7F4EE` warm canvas, `#20202A` dark ink, `#6875E8` purple accent, `DM Serif Display` headings, and crisp `IBM Plex Mono` labels).',
    tools: ['Figma', 'Pen & Paper', 'Tailwind CSS', 'Lucide Icons'],
    expectedOutput: 'A wireframe suite and user journey flowchart covering the primary user loop.',
    checklist: [
      { id: 'c7_1', label: 'Primary user flows mapped from start to finish.' },
      { id: 'c7_2', label: 'Low-fidelity wireframes sketched for main views.' },
      { id: 'c7_3', label: 'Mobile responsive layout and navigation planned.' },
      { id: 'c7_4', label: 'Color palette, fonts, and button hierarchy defined.' }
    ],
    commonMistakes: [
      { mistake: 'Designing only for wide 1440px desktop screens.', fix: 'Design mobile views (375px) first; over 60% of users browse on mobile devices.' },
      { mistake: 'Low contrast text that fails accessibility tests.', fix: 'Maintain at least 4.5:1 contrast ratio between text and background.' }
    ],
    practicalTask: 'Sketch wireframes for your app’s Home and Main Action screens.',
    actionButton: {
      label: 'Explore Design Patterns',
      route: '/explore'
    }
  },
  {
    id: 8,
    stageKey: 'stage_08',
    title: '08 — Choose the Technology (Tech Stack)',
    shortTitle: 'Technology Selection',
    category: 'build',
    categoryLabel: 'TECH STACK SELECTION',
    goal: 'Select modern, reliable tools based on project requirements—and understand WHY each is used.',
    whatIsIt: {
      beginner: 'Choosing your tech stack means picking the programming languages, libraries, and hosting platforms you will use to build your application.',
      intermediate: 'Evaluating tradeoffs between developer velocity, ecosystem maturity, serverless scalability, and real-time capabilities across frontend, backend, database, and AI SDKs.',
      advanced: 'Full-stack platform evaluation: assessing bundle sizes, tree-shaking efficiency, cold-start latency, edge computing support, and long-term maintenance overhead.'
    },
    whyImportant: 'Picking the right stack lets you build fast without reinventing wheels. Knowing WHY you chose each tool prevents costly rewrites later.',
    whatToLearn: [
      'Frontend Frameworks (React, Vite, TypeScript)',
      'CSS Methodologies (Tailwind CSS, CSS Modules, Design Tokens)',
      'Backend & BaaS Platforms (Supabase, Firebase, Node.js)',
      'AI SDKs & APIs (Google Gen AI SDK / Gemini Flash 2.5)',
      'Hosting & Edge Networks (Vercel, Netlify, Cloudflare)'
    ],
    whatToDo: [
      'Document your exact stack for Frontend, Styling, Database, Auth, AI, and Hosting.',
      'Write down a 1-sentence justification for each technology chosen.',
      'Initialize a Git repository and verify your local build server runs smoothly.',
      'Verify that all team members have access to the codebase and cloud consoles.'
    ],
    example: {
      bad: 'We use 12 different tools because they were trending on Twitter yesterday.',
      good: 'React + Vite for instant hot-reload and component reusability; Tailwind CSS for rapid styling; Supabase for managed PostgreSQL and Auth; Gemini 2.5 for low-latency AI; Vercel for instant CDN deployment.',
      explanation: 'Every technology chosen has a clear, pragmatic reason that speeds up delivery.'
    },
    innovexaFlow: [
      'React 18 + Vite (UI Engine)',
      'Tailwind CSS (Styling)',
      'Supabase (PostgreSQL & Auth)',
      'Gemini API (AI Intelligence)',
      'Vercel (Production Edge CDN)'
    ],
    innovexaConnection: 'INNOVEXA is built with React, Vite, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Supabase, and Google Gemini Flash 2.5.',
    tools: ['Vite', 'npm / pnpm', 'TypeScript', 'GitHub'],
    expectedOutput: 'A finalized Tech Stack Specification document and initialized Git repository.',
    checklist: [
      { id: 'c8_1', label: 'Frontend framework and build tool initialized.' },
      { id: 'c8_2', label: 'CSS/styling system configured.' },
      { id: 'c8_3', label: 'Database & Auth provider selected with clear justification.' },
      { id: 'c8_4', label: 'AI engine and hosting platform confirmed.' }
    ],
    commonMistakes: [
      { mistake: 'Choosing unfamiliar technologies for a tight hackathon or MVP deadline.', fix: 'Stick to tools you know well or that have outstanding documentation.' },
      { mistake: 'Listing technologies without understanding what they do.', fix: 'Be able to explain what role each library plays in your architecture.' }
    ],
    practicalTask: 'Set up your project repository with React, Vite, and Tailwind CSS.',
    actionButton: {
      label: 'Explore Tech Specs',
      route: '/ai-research'
    }
  },
  {
    id: 9,
    stageKey: 'stage_09',
    title: '09 — Design the Database (Schema & Relations)',
    shortTitle: 'Database Design',
    category: 'build',
    categoryLabel: 'SCHEMA & RELATIONSHIPS',
    goal: 'Structure tables, columns, primary/foreign keys, and relational integrity to store project data reliably.',
    whatIsIt: {
      beginner: 'Database design is organizing the digital filing cabinets for your app. You create tables (like Users, Projects, Reviews) and connect them using relationships.',
      intermediate: 'Designing relational schemas in PostgreSQL: defining Primary Keys (UUID), Foreign Keys with cascade rules, indexes on query fields, and enforcing Row-Level Security (RLS).',
      advanced: 'Relational normalization (3NF), query indexing strategies (B-Tree, GIN, Composite indexes), JSONB vs columnar tradeoffs, connection pooling, and atomic transaction design.'
    },
    whyImportant: 'A broken database schema causes duplicate records, slow queries, and data corruption. Getting the schema right makes writing frontend queries trivial.',
    whatToLearn: [
      'Relational Tables, Rows, and Columns',
      'Primary Keys vs Foreign Keys',
      'Relationship Types (1:1, 1:Many, Many:Many with junction tables)',
      'CRUD Operations (Create, Read, Update, Delete)',
      'PostgreSQL Row-Level Security (RLS) policies'
    ],
    whatToDo: [
      'List all entity tables needed for your MVP (e.g. profiles, projects, reviews).',
      'Define columns, data types (UUID, text, integer, boolean, timestamp), and nullability.',
      'Establish foreign key connections between tables.',
      'Write SQL migration files or create tables in Supabase Studio.'
    ],
    example: {
      bad: 'Storing a user’s 50 reviews inside a comma-separated string in the projects table.',
      good: 'A dedicated `reviews` table with `id`, `project_id` (FK → projects.id), `user_id` (FK → profiles.id), `rating`, `feedback`, and `created_at`.',
      explanation: 'Proper normalization makes sorting, filtering, and deleting reviews clean and performant.'
    },
    innovexaFlow: [
      'profiles (User accounts)',
      'projects (Innovation listings)',
      'reviews (Community feedback)',
      'review_ai_analysis (Sentiment & clusters)',
      'notifications & community_posts'
    ],
    innovexaConnection: 'INNOVEXA uses a normalized Supabase PostgreSQL schema with tables for `profiles`, `projects`, `reviews`, `project_versions`, `community_posts`, and `notifications`.',
    tools: ['Supabase Studio', 'dbdiagram.io', 'pgAdmin', 'Prisma Studio'],
    expectedOutput: 'A complete Entity-Relationship Diagram (ERD) and SQL migration script.',
    checklist: [
      { id: 'c9_1', label: 'All primary entity tables identified.' },
      { id: 'c9_2', label: 'Primary keys (UUID) and foreign key relationships configured.' },
      { id: 'c9_3', label: 'Indexes added on frequently queried foreign key columns.' },
      { id: 'c9_4', label: 'Row-Level Security (RLS) enabled on all tables.' }
    ],
    commonMistakes: [
      { mistake: 'Forgetting foreign key constraints, allowing orphaned records.', fix: 'Always declare `ON DELETE CASCADE` or `ON DELETE SET NULL` on foreign keys.' },
      { mistake: 'Disabling RLS to make frontend queries work.', fix: 'Write granular RLS policies: allow public SELECT, restrict INSERT/UPDATE to authenticated owner.' }
    ],
    practicalTask: 'Create your 3 core tables with foreign keys in Supabase Studio.',
    actionButton: {
      label: 'Inspect Project Data',
      route: '/explore'
    }
  },
  {
    id: 10,
    stageKey: 'stage_10',
    title: '10 — Build Authentication & Security',
    shortTitle: 'Authentication & RLS',
    category: 'build',
    categoryLabel: 'SECURITY & SESSIONS',
    goal: 'Implement user registration, secure login, persistent sessions, and protect private user data.',
    whatIsIt: {
      beginner: 'Authentication is asking "Who are you?" (email and password or Google login). Authorization is asking "What are you allowed to do?" (e.g. only you can edit your own project).',
      intermediate: 'Integrating Supabase Auth / JWT tokens, React Auth Context providers, session persistence in local storage, Protected Route wrappers, and PostgreSQL RLS policies.',
      advanced: 'Cryptographic JWT verification, PKCE OAuth flows, refresh token rotation, cross-site scripting (XSS) mitigation, and role-based access control (RBAC).'
    },
    whyImportant: 'Security breaches ruin user trust immediately. Never let one user edit or delete another user’s work.',
    whatToLearn: [
      'Authentication ("Who are you?") vs Authorization ("What are you allowed to do?")',
      'JSON Web Tokens (JWT) & Bearer Headers',
      'Protected Routes in React Router DOM',
      'Supabase Auth SDK methods (signUp, signInWithPassword, signOut)',
      'Row-Level Security (RLS) policies for user data isolation'
    ],
    whatToDo: [
      'Create Signup and Login UI screens with email/password validation.',
      'Configure Supabase Auth in your React application.',
      'Wrap private routes (like /create or /my-projects) in a ProtectedRoute component.',
      'Verify that logged-out users cannot access private endpoints.'
    ],
    example: {
      bad: 'Storing user passwords in plain text in a database table or trusting client-sent `userId` without verifying auth tokens.',
      good: 'Supabase handles bcrypt password hashing and returns a signed JWT token verified on every database query via `auth.uid() = owner_id` RLS policies.',
      explanation: 'Delegates cryptographic security to audited backend engines and enforces server-side permissions.'
    },
    innovexaFlow: [
      'User Enters Credentials',
      'Supabase Verifies Hash',
      'Session Token Issued',
      'AuthContext Stores User Profile',
      'ProtectedRoute Renders Content'
    ],
    innovexaConnection: 'INNOVEXA uses `AuthContext` with Supabase Auth to manage user state, user profile roles, reputation points, and protected navigation.',
    tools: ['Supabase Auth', 'React Context', 'React Router DOM', 'Web Crypto'],
    expectedOutput: 'A fully functional Signup, Login, Logout, and Protected Route system.',
    checklist: [
      { id: 'c10_1', label: 'User registration with email validation works.' },
      { id: 'c10_2', label: 'User login generates secure session tokens.' },
      { id: 'c10_3', label: 'Session persists after browser page refresh.' },
      { id: 'c10_4', label: 'Protected routes redirect unauthenticated users to /login.' },
      { id: 'c10_5', label: 'Row-Level Security prevents users from editing others’ data.' }
    ],
    commonMistakes: [
      { mistake: 'Putting secret API keys or service role keys in frontend React code.', fix: 'Only expose the public `anon` key in frontend code; keep service keys on backend.' },
      { mistake: 'Trusting the frontend to enforce permissions without database RLS.', fix: 'Always verify user ownership in database RLS rules.' }
    ],
    practicalTask: 'Sign in to INNOVEXA and review your authenticated profile settings.',
    actionButton: {
      label: 'View Auth Profile',
      route: '/profile'
    }
  },
  {
    id: 11,
    stageKey: 'stage_11',
    title: '11 — Build Core Features (Development Sprint)',
    shortTitle: 'Core Development',
    category: 'build',
    categoryLabel: 'FULL-STACK DEVELOPMENT',
    goal: 'Build the foundational features systematically in the correct development sequence.',
    whatIsIt: {
      beginner: 'This is where you write the actual code for your app! You build the screens, connect forms to the database, and display live data to the user.',
      intermediate: 'Executing modular agile development sprints: building component hierarchies, custom React hooks for data fetching, mutation handlers, and toast feedback systems.',
      advanced: 'State architecture orchestration, optimistic UI updates, virtualized rendering for large lists, memoization of expensive computations, and clean modular component decoupling.'
    },
    whyImportant: 'Building in the correct order prevents blocked dependencies. Always build basic database storage before attempting complex AI or real-time features.',
    whatToLearn: [
      'Recommended Development Sequence',
      'React State Management & Custom Hooks',
      'Form Validation & Submission Handling',
      'Loading, Empty, and Error UI States',
      'Component Reusability & Clean Code Structure'
    ],
    whatToDo: [
      'Build Feature 1: Authentication & User Profile.',
      'Build Feature 2: Project Creation & Database Storage.',
      'Build Feature 3: Explore / Listing View with Search & Filtering.',
      'Build Feature 4: Detail View with interactive child components (e.g. Reviews).',
      'Build Feature 5: Notifications & Community Feed.'
    ],
    example: {
      bad: 'Starting day 1 by trying to integrate a complex vector database before having a simple form to create a project.',
      good: 'Step 1: Build project creation form → Step 2: Save to Supabase → Step 3: Render list on Explore → Step 4: Add detail page → Step 5: Add reviews.',
      explanation: 'Sequential development ensures you have a working, testable product at every milestone.'
    },
    innovexaFlow: [
      'Auth → Profile',
      'Project Creation → Database Storage',
      'Explore Feed → Search & Filters',
      'Project Details → Reviews & Ratings',
      'Community → Notifications'
    ],
    innovexaConnection: 'Explore INNOVEXA’s modular architecture across `/explore`, `/create`, `/projects/:id`, `/community`, and `/my-projects`.',
    tools: ['VS Code', 'React', 'Tailwind CSS', 'Lucide React', 'Framer Motion'],
    expectedOutput: 'A functional Alpha MVP build with working database CRUD operations.',
    checklist: [
      { id: 'c11_1', label: 'Project creation form successfully saves data to database.' },
      { id: 'c11_2', label: 'Explore listing displays real database projects dynamically.' },
      { id: 'c11_3', label: 'Project Detail page renders full metadata and sub-components.' },
      { id: 'c11_4', label: 'Loading skeletons and empty states implemented on all views.' }
    ],
    commonMistakes: [
      { mistake: 'Writing 1,000-line monolithic React files.', fix: 'Split code into focused subcomponents (e.g. `ProjectCard`, `ReviewList`, `Badge`).' },
      { mistake: 'Ignoring loading and error states.', fix: 'Always show a spinner or skeleton when fetching and friendly error messages on failure.' }
    ],
    practicalTask: 'Create a test project in INNOVEXA and view it on the Explore feed.',
    actionButton: {
      label: 'Explore Live Projects',
      route: '/explore'
    }
  },
  {
    id: 12,
    stageKey: 'stage_12',
    title: '12 — Add Intelligence (AI Integration)',
    shortTitle: 'AI Integration',
    category: 'build',
    categoryLabel: 'GEMINI AI & INTELLIGENCE',
    goal: 'Integrate generative AI to analyze real data, provide smart recommendations, and automate tasks.',
    whatIsIt: {
      beginner: 'AI integration means connecting your app to an intelligent model like Google Gemini. The AI reads user submissions and generates helpful summaries, feedback, or suggestions.',
      intermediate: 'Integrating the Google GenAI SDK with structured JSON schemas, prompt engineering, few-shot conditioning, and parsing LLM responses into typed application state.',
      advanced: 'Grounding pipelines: retrieval-augmented generation (RAG), semantic vector embeddings, prompt caching, token optimization, and asynchronous AI job queue processing.'
    },
    whyImportant: 'AI makes your application intelligent, personalized, and capable of saving users hours of manual synthesis.',
    whatToLearn: [
      'Google Gemini Flash 2.5 API Integration',
      'Structured JSON Schema Output Enforcement',
      'Prompt Engineering & Role Framing',
      'Grounding AI on Real Database Records (Preventing Hallucinations)',
      'Fallback States & Graceful Error Handling for Rate Limits'
    ],
    whatToDo: [
      'Formulate clear prompts with system instructions and JSON output schema rules.',
      'Pass real project or review data in the context to ground the response.',
      'Parse the structured AI response and save it into your database.',
      'Display the generated analysis in clean, visual UI cards.'
    ],
    example: {
      bad: 'Prompting the AI to "Invent 5 random startup projects" and saving fabricated data into the database.',
      good: 'Passing 10 real user reviews to Gemini and asking it to classify sentiment and group actionable suggestions into "High Priority Bugs", "Feature Requests", and "UX Friction".',
      explanation: 'AI analyzes real user signals rather than hallucinating fake data.'
    },
    innovexaFlow: [
      'User Review Submitted',
      'Backend Passes Reviews to Gemini',
      'Gemini Returns Structured JSON Sentiment',
      'Results Stored in Database',
      'Validation Insights Rendered'
    ],
    innovexaConnection: 'INNOVEXA uses Google Gemini 2.5 Flash for AI Research dossiers, review sentiment analysis, feedback clustering, and automated project improvement suggestions.',
    tools: ['Google Gemini API', '@google/genai SDK', 'JSON Schema Validator'],
    expectedOutput: 'A working AI analysis pipeline returning structured, typed JSON data.',
    checklist: [
      { id: 'c12_1', label: 'Gemini API key configured securely in environment variables.' },
      { id: 'c12_2', label: 'Prompt enforces structured JSON output schema.' },
      { id: 'c12_3', label: 'AI analyzes real database records rather than hallucinating.' },
      { id: 'c12_4', label: 'Rate-limit and timeout fallbacks implemented.' }
    ],
    commonMistakes: [
      { mistake: 'Exposing Gemini API keys in public client JavaScript.', fix: 'Route AI requests through backend endpoints or protect your deployment environment.' },
      { mistake: 'Trusting unformatted raw string output from LLMs.', fix: 'Always use structured JSON schemas and validate output before rendering.' }
    ],
    practicalTask: 'Run an AI Research Dossier in INNOVEXA to test real-time Gemini generation.',
    actionButton: {
      label: 'Run AI Research Test',
      route: '/ai-research'
    }
  },
  {
    id: 13,
    stageKey: 'stage_13',
    title: '13 — Test Everything (Quality Assurance)',
    shortTitle: 'Testing & QA',
    category: 'test',
    categoryLabel: 'TESTING & RESILIENCE',
    goal: 'Verify functional correctness, edge cases, responsiveness, and error handling across the entire stack.',
    whatIsIt: {
      beginner: 'Testing is clicking through your app like a real user to make sure nothing crashes, forms submit correctly, and everything works on both phones and laptops.',
      intermediate: 'Executing comprehensive testing suites: unit testing core utility functions, integration testing database queries, end-to-end user flow simulation, and cross-browser testing.',
      advanced: 'Automated CI/CD test runners, Playwright headless browser automation, database fuzzing, load testing under concurrent user requests, and visual regression testing.'
    },
    whyImportant: 'Bugs discovered by users damage your reputation. Catching edge cases before launch ensures a polished, professional first impression.',
    whatToLearn: [
      'Happy Path vs Failure Path Testing',
      'Form Edge Cases (Empty fields, extra-long strings, special characters)',
      'Mobile Viewport & Touch Target Testing',
      'Database Constraint & RLS Boundary Testing',
      'End-to-End User Journey Walkthroughs'
    ],
    whatToDo: [
      'Execute the 9-step INNOVEXA end-to-end journey test.',
      'Test forms with invalid inputs (empty fields, malformed emails, massive text).',
      'Inspect layouts on 375px (mobile), 768px (tablet), and 1280px (desktop).',
      'Verify that deleting or modifying records honors database cascades and RLS.'
    ],
    example: {
      bad: 'Testing only once with valid data on a high-end MacBook in Chrome, and assuming everything is fine.',
      good: 'Testing with slow 3G network throttling, submitting empty forms to verify error alerts, opening on iOS Safari, and attempting unauthorized edits from a second incognito browser.',
      explanation: 'Rigorous testing uncovers network delays, responsive glitches, and security holes before users do.'
    },
    innovexaFlow: [
      '1. Create project in UI',
      '2. Verify row in Supabase',
      '3. Search project in Explore',
      '4. Submit community review',
      '5. Verify review in DB',
      '6. Run AI sentiment analysis',
      '7. Check creator insights'
    ],
    innovexaConnection: 'Test the complete INNOVEXA loop: Create an idea, find it in Explore, submit a review in `/projects/:id/review`, and verify the updated score on `/projects/:id/validation`.',
    tools: ['Chrome DevTools', 'Playwright', 'Vitest', 'Lighthouse'],
    expectedOutput: 'A QA Verification Matrix confirming 0 critical bugs across all core user flows.',
    checklist: [
      { id: 'c13_1', label: 'Full 9-step end-to-end user journey executed successfully.' },
      { id: 'c13_2', label: 'Form validation and error messages verified for bad inputs.' },
      { id: 'c13_3', label: 'Responsive design tested on mobile (375px) and desktop.' },
      { id: 'c13_4', label: 'Network offline and rate-limit fallbacks verified.' }
    ],
    commonMistakes: [
      { mistake: 'Only testing the "happy path" where users do everything right.', fix: 'Deliberately try to break forms by typing emojis, negative numbers, and clicking buttons repeatedly.' },
      { mistake: 'Ignoring console warnings and TypeScript errors.', fix: 'Fix all compiler warnings before moving to production.' }
    ],
    practicalTask: 'Perform an end-to-end test: Create a test project and submit a review on it.',
    actionButton: {
      label: 'Test Project Reviews',
      route: '/reviews'
    }
  },
  {
    id: 14,
    stageKey: 'stage_14',
    title: '14 — Secure Your Application (Security & Privacy)',
    shortTitle: 'Security & Privacy',
    category: 'test',
    categoryLabel: 'SECURITY AUDITING',
    goal: 'Audit your codebase and database to prevent unauthorized access, data leaks, and malicious exploits.',
    whatIsIt: {
      beginner: 'Security means making sure hackers cannot steal user passwords, delete other people’s projects, or view private information.',
      intermediate: 'Conducting security audits: verifying PostgreSQL Row-Level Security policies, sanitizing user inputs against XSS, preventing SQL injections, and keeping API secrets out of Git.',
      advanced: 'OWASP Top 10 compliance: Content Security Policy (CSP) headers, CORS origin whitelisting, rate limiting against DoS attacks, subresource integrity, and secret rotation protocols.'
    },
    whyImportant: 'A single security vulnerability can compromise user trust permanently and lead to complete database wiping.',
    whatToLearn: [
      'PostgreSQL Row-Level Security (RLS) Auditing',
      'Environment Variable & Secret Key Management',
      'Cross-Site Scripting (XSS) & Input Sanitization',
      'Cross-Origin Resource Sharing (CORS) Configuration',
      'OWASP Top 10 Web Application Vulnerabilities'
    ],
    whatToDo: [
      'Verify that RLS is enabled on 100% of tables in your database.',
      'Confirm that `.env` files are included in `.gitignore` and never committed.',
      'Ensure all user-generated content is sanitized before rendering in the DOM.',
      'Test unauthenticated API requests to ensure private routes return 401/403.'
    ],
    example: {
      bad: 'Committing `SUPABASE_SERVICE_ROLE_KEY` to a public GitHub repository, giving anyone full admin access.',
      good: 'Keeping service keys strictly inside secure backend server environments, using only the restricted `anon` key on the client, and protecting every table with `auth.uid() = owner_id` RLS policies.',
      explanation: 'Even if a malicious actor inspects your frontend bundle, they cannot access or modify unauthorized data.'
    },
    innovexaFlow: [
      'Client Request + JWT',
      'Supabase Gateway Validation',
      'Postgres RLS Policy Check',
      'Data Filtered at DB Level',
      'Sanitized Response Returned'
    ],
    innovexaConnection: 'INNOVEXA enforces strict database Row-Level Security: only project creators can edit or delete projects, while authenticated users can submit reviews.',
    tools: ['Supabase RLS', 'GitGuardian', 'OWASP ZAP', 'Snyk'],
    expectedOutput: 'A verified Security Audit Checklist with 100% RLS coverage.',
    checklist: [
      { id: 'c14_1', label: '100% of database tables have Row-Level Security enabled.' },
      { id: 'c14_2', label: 'No private API keys or service role tokens committed to Git.' },
      { id: 'c14_3', label: 'User input sanitized to prevent XSS attacks.' },
      { id: 'c14_4', label: 'Unauthenticated requests to private endpoints correctly blocked.' }
    ],
    commonMistakes: [
      { mistake: 'Thinking frontend code hiding a button makes a feature secure.', fix: 'Always enforce security in the database / backend; anyone can inspect client code.' },
      { mistake: 'Using simple guessable passwords for demo admin accounts.', fix: 'Enforce strong passwords and token verification.' }
    ],
    practicalTask: 'Audit your Supabase RLS policies and verify unauthenticated access is blocked.',
    actionButton: {
      label: 'Review Settings & Security',
      route: '/settings'
    }
  },
  {
    id: 15,
    stageKey: 'stage_15',
    title: '15 — Improve Performance (Optimization & Speed)',
    shortTitle: 'Performance & Speed',
    category: 'test',
    categoryLabel: 'SPEED & OPTIMIZATION',
    goal: 'Ensure instant page loads, smooth 60fps animations, optimized queries, and efficient caching.',
    whatIsIt: {
      beginner: 'Performance means making your app load fast! Nobody likes waiting 10 seconds for a page to open or stuttering when they scroll.',
      intermediate: 'Optimizing web performance: pagination/infinite scrolling (loading 20 items instead of 1,000), debouncing search inputs, lazy-loading heavy components, and image compression.',
      advanced: 'Core Web Vitals tuning (LCP < 1.2s, INP < 50ms, CLS < 0.05), bundle tree-shaking, database index optimization, memory leak prevention, and client-side caching strategies.'
    },
    whyImportant: 'Every 100ms delay in page load time drops user engagement and conversion rates. Fast apps feel premium and delightful.',
    whatToLearn: [
      'Pagination & Infinite Scroll (Limit & Offset queries)',
      'Debouncing Live Search Inputs (300ms delay)',
      'React Code Splitting (`React.lazy` and `Suspense`)',
      'Database Indexing on Filter & Sort Columns',
      'Avoiding Redundant AI and Network Calls'
    ],
    whatToDo: [
      'Implement pagination on lists so you only fetch 15–20 items at a time.',
      'Debounce search inputs so typing a query doesn’t fire 20 requests per word.',
      'Compress and convert images to modern WebP format.',
      'Audit your app in Chrome Lighthouse and achieve an 85+ Performance score.'
    ],
    example: {
      bad: 'Running `SELECT * FROM projects` on every keystroke in a search bar, loading 5,000 records repeatedly.',
      good: 'Debouncing input by 300ms, using client-side memoized search for active lists, and fetching 20 paginated results with database indexes on `title` and `category`.',
      explanation: 'Reduces server load by 95% and provides instantaneous search feedback.'
    },
    innovexaFlow: [
      'Debounced User Input (300ms)',
      'Client Cache Check',
      'Indexed Query Execution (Limit 20)',
      'Virtualized / Paged List Render'
    ],
    innovexaConnection: 'INNOVEXA uses debounced search across the Explore and AI Research pages, client-side caching for review sentiment, and optimized Framer Motion transitions.',
    tools: ['Google Lighthouse', 'Chrome Performance Profiler', 'WebPageTest', 'Vite Bundle Visualizer'],
    expectedOutput: 'An 85+ Lighthouse score and sub-1s initial page load time.',
    checklist: [
      { id: 'c15_1', label: 'All search bars and filter inputs are debounced.' },
      { id: 'c15_2', label: 'Large lists use pagination or infinite scrolling (Limit 20).' },
      { id: 'c15_3', label: 'Images optimized and compressed to WebP/SVG.' },
      { id: 'c15_4', label: 'Lighthouse audit demonstrates fast Core Web Vitals.' }
    ],
    commonMistakes: [
      { mistake: 'Fetching all database rows in one giant un-paginated query.', fix: 'Always specify `.limit(20).range(start, end)` in database queries.' },
      { mistake: 'Re-calling Gemini AI every time a component re-renders.', fix: 'Cache generated AI results in database tables and fetch existing results first.' }
    ],
    practicalTask: 'Test your Explore page with search and filter toggles to verify zero lag.',
    actionButton: {
      label: 'Inspect Explore Performance',
      route: '/explore'
    }
  },
  {
    id: 16,
    stageKey: 'stage_16',
    title: '16 — Deploy Your Project (Production Hosting)',
    shortTitle: 'Deployment & CI/CD',
    category: 'launch',
    categoryLabel: 'CLOUD DEPLOYMENT',
    goal: 'Ship your application to a global edge CDN with automated Git deployments and custom domain setup.',
    whatIsIt: {
      beginner: 'Deployment is putting your app on the real internet so anyone around the world can open a link and use it on their phone or laptop.',
      intermediate: 'Connecting your GitHub repository to Vercel or Netlify, configuring environment variables in the production console, setting up SPA rewrite rules, and building production bundles.',
      advanced: 'CI/CD pipeline configuration (GitHub Actions), automated preview environments for pull requests, edge network routing, SSL termination, and zero-downtime rolling deployments.'
    },
    whyImportant: 'Your project doesn’t exist to the world until it has a live, working URL that users and judges can test.',
    whatToLearn: [
      'Git Workflow & GitHub Remote Repositories',
      'Vercel / Netlify Production Deployment',
      'Configuring Production Environment Variables (`VITE_*`)',
      'Single Page Application (SPA) 404 Rewrite Configuration',
      'Custom Domain DNS Configuration (CNAME / A Records)'
    ],
    whatToDo: [
      'Push your clean code to a GitHub repository.',
      'Import the repository into Vercel or Netlify.',
      'Add your Supabase URL, Anon Key, and Gemini API keys in the hosting dashboard.',
      'Add a `vercel.json` rewrite rule to redirect all routes to `index.html`.',
      'Trigger the build and verify the live HTTPS URL works.'
    ],
    example: {
      bad: 'Deploying without configuring SPA rewrites, causing page refreshes on `/explore` to return a 404 Not Found error.',
      good: 'Configuring `vercel.json` with `{"rewrites": [{"source": "/(.*)", "destination": "/"}]}` so React Router handles all sub-paths seamlessly.',
      explanation: 'Ensures client-side routing works smoothly when users share direct links.'
    },
    innovexaFlow: [
      'Local Git Push',
      'GitHub Webhook',
      'Vercel Build & Lint',
      'Global Edge CDN Distribution',
      'Live Production URL'
    ],
    innovexaConnection: 'INNOVEXA is configured for seamless deployment on Vercel with automated single-page application routing and environment variable injection.',
    tools: ['Vercel', 'GitHub', 'Netlify', 'Cloudflare DNS'],
    expectedOutput: 'A live, public HTTPS URL deployed on a global edge network.',
    checklist: [
      { id: 'c16_1', label: 'Local production build (`npm run build`) completes with 0 errors.' },
      { id: 'c16_2', label: 'Project connected to GitHub and deployed on Vercel.' },
      { id: 'c16_3', label: 'All environment variables configured in hosting console.' },
      { id: 'c16_4', label: 'Direct URL routing to subpages verified on live site.' }
    ],
    commonMistakes: [
      { mistake: 'Committing `.env` with secret keys instead of setting them in Vercel.', fix: 'Add environment variables through the Vercel dashboard Settings → Environment Variables.' },
      { mistake: 'Forgetting to test the live build on mobile devices after deployment.', fix: 'Always open the live URL on your smartphone immediately after deploying.' }
    ],
    practicalTask: 'Run `npm run build` locally to verify your code compiles cleanly.',
    actionButton: {
      label: 'Go to My Projects',
      route: '/my-projects'
    }
  },
  {
    id: 17,
    stageKey: 'stage_17',
    title: '17 — Monitor & Maintain (Observability)',
    shortTitle: 'Monitoring & Health',
    category: 'launch',
    categoryLabel: 'OBSERVABILITY & HEALTH',
    goal: 'Track runtime errors, user adoption metrics, API health, and feedback notifications in real time.',
    whatIsIt: {
      beginner: 'Monitoring means keeping an eye on your live app to see if users are getting errors, how many people visit, and what features they use most.',
      intermediate: 'Implementing client-side Error Boundaries, integrating error logging tools (Sentry/LogRocket), tracking database connection limits, and monitoring Gemini API quota usage.',
      advanced: 'Real-time telemetry pipelines: structured error tracking, user session replay, latency percentile monitoring (p95, p99), and automated alert notifications on failure spikes.'
    },
    whyImportant: 'Launch is not the end—it is the beginning. Knowing immediately when an API fails lets you fix issues before users abandon the app.',
    whatToLearn: [
      'React Error Boundary Implementation',
      'Runtime Error Logging & Telemetry',
      'Database Health & Connection Pool Monitoring',
      'API Quota & Rate-Limit Tracking',
      'User Event Funnel Tracking'
    ],
    whatToDo: [
      'Verify that React Error Boundaries catch crashes and show friendly recovery buttons.',
      'Check Supabase dashboard logs for slow queries or authentication errors.',
      'Monitor Gemini API dashboard for token consumption and quota remaining.',
      'Check INNOVEXA Notifications feed for live user reviews and community comments.'
    ],
    example: {
      bad: 'An unhandled API error turns the entire screen blank white for users with zero explanation.',
      good: 'An Error Boundary catches the failure, displays a friendly "Something went wrong" card with a "Try Again" button, and logs the stack trace.',
      explanation: 'Provides a resilient user experience even when third-party services experience hiccups.'
    },
    innovexaFlow: [
      'User Action in UI',
      'Error Boundary Protection',
      'Log Telemetry Capture',
      'Notification Dispatch',
      'Admin Resolution'
    ],
    innovexaConnection: 'INNOVEXA includes top-level `ErrorBoundary` wrappers and a live notification center that alerts creators whenever new reviews or community replies are posted.',
    tools: ['Sentry', 'Supabase Dashboard', 'Google Cloud Console', 'PostHog'],
    expectedOutput: 'An active observability setup with Error Boundaries and live alerts.',
    checklist: [
      { id: 'c17_1', label: 'React Error Boundary wraps top-level application layout.' },
      { id: 'c17_2', label: 'Database query logs inspected in Supabase console.' },
      { id: 'c17_3', label: 'API quota limits monitored in Google Cloud Console.' },
      { id: 'c17_4', label: 'Notification system verified for real-time user updates.' }
    ],
    commonMistakes: [
      { mistake: 'Leaving `console.log` debug statements littered across production code.', fix: 'Clean up debug logs and use structured error handlers.' },
      { mistake: 'Ignoring user-reported errors in community threads.', fix: 'Acknowledge bug reports promptly and post update changelogs.' }
    ],
    practicalTask: 'Check your INNOVEXA Notifications feed for recent review activity.',
    actionButton: {
      label: 'Check Community Signals',
      route: '/community'
    }
  },
  {
    id: 18,
    stageKey: 'stage_18',
    title: '18 — Improve Through Real Users (Iteration & Versions)',
    shortTitle: 'Validation & Iteration',
    category: 'launch',
    categoryLabel: 'CONTINUOUS IMPROVEMENT',
    goal: 'Close the loop: turn user reviews and AI sentiment insights into Version 2.0 milestone releases.',
    whatIsIt: {
      beginner: 'Iteration means making your app better based on what users tell you. You read reviews, fix the top complaints, add the most requested features, and release Version 2.0.',
      intermediate: 'Analyzing AI sentiment clusters on the Validation Insights page, prioritizing backlog issues by feedback frequency, and releasing versioned milestone changelogs.',
      advanced: 'Quantitative feedback synthesis: tracking sentiment delta over successive versions, calculating Net Promoter Score (NPS) trajectory, and executing A/B feature experiments.'
    },
    whyImportant: 'Great products are never built in one go—they are carved out through repeated iteration cycles based on real user feedback.',
    whatToLearn: [
      'The INNOVEXA Smart Validation & Iteration Cycle',
      'Feedback Cluster Triaging (Bugs vs Enhancements vs Noise)',
      'Semantic Versioning (v1.0.0 → v1.1.0 → v2.0.0)',
      'Writing Clear User-Facing Changelogs',
      'Measuring Improvement Delta Across Versions'
    ],
    whatToDo: [
      'Open your project’s Validation Insights page and review top recommendation clusters.',
      'Select the top 2 user pain points and build concrete improvements.',
      'Create a new Project Version in INNOVEXA with a detailed changelog.',
      'Notify past reviewers that their feedback was incorporated.'
    ],
    example: {
      bad: 'Refusing to change anything because "the users just don’t understand my vision."',
      good: 'Reviewers noted that interview practice had no timer. In Version 1.2, you added a 60-second countdown clock and saw positive sentiment rise from 62% to 91%.',
      explanation: 'Directly responding to user friction creates loyal advocates and a superior product.'
    },
    innovexaFlow: [
      'Project v1.0',
      'User Reviews Collected',
      'AI Sentiment Clustering',
      'Actionable Recommendations',
      'New Version v2.0 Released',
      'Re-Validation'
    ],
    innovexaConnection: 'INNOVEXA connects reviews directly to versions: use `/projects/:id/validation` to see AI insights, and `/projects/:id/versions` to publish new milestone releases with changelogs.',
    tools: ['INNOVEXA Validation Insights', 'Version Manager', 'GitHub Releases'],
    expectedOutput: 'A published Version 2.0 release backed by user feedback and a verified changelog.',
    checklist: [
      { id: 'c18_1', label: 'Validation Insights reviewed for sentiment and feature clusters.' },
      { id: 'c18_2', label: 'Top 2 user pain points resolved in code.' },
      { id: 'c18_3', label: 'New project version published with a clear changelog in INNOVEXA.' },
      { id: 'c18_4', label: 'Sentiment improvement measured after version update.' }
    ],
    commonMistakes: [
      { mistake: 'Releasing massive versions without explaining what changed in a changelog.', fix: 'Always write concise bullet points describing new features and fixed bugs.' },
      { mistake: 'Ignoring recurring negative feedback.', fix: 'If 3 different users mention the same confusion, it is a UX bug in your product.' }
    ],
    practicalTask: 'Check your project’s Validation Insights and note top requested improvements.',
    actionButton: {
      label: 'Open Validation Insights',
      route: '/explore'
    }
  },
  {
    id: 19,
    stageKey: 'stage_19',
    title: '19 — Launch Your Innovation (Public Launch)',
    shortTitle: 'Launch Innovation',
    category: 'launch',
    categoryLabel: 'PUBLIC LAUNCH',
    goal: 'Launch your validated, polished innovation to the broader world and acquire your first 100 active users.',
    whatIsIt: {
      beginner: 'Launching is the big day! You publish your live project to the community, share demo videos, post on social platforms, and invite everyone to try it out.',
      intermediate: 'Executing a multi-channel launch playbook: publishing on INNOVEXA Showcase, submitting to Product Hunt, posting on Hacker News (Show HN) and relevant subreddits with demo media.',
      advanced: 'Launch funnel optimization: tracking real-time conversion rates, managing traffic spikes, live customer onboarding support, and immediate community engagement response loops.'
    },
    whyImportant: 'Building a great product in secret helps no one. A successful launch gives your innovation visibility, credibility, and early adopter momentum.',
    whatToLearn: [
      'Pre-Launch Final Verification Checklist',
      'Crafting Compelling Launch Headlines & Demos',
      'Community Showcase Posting (INNOVEXA, Product Hunt, Reddit)',
      'Handling Launch Day Traffic & User Inquiries',
      'Converting Casual Visitors into Active Reviewers'
    ],
    whatToDo: [
      'Complete the 10-point Pre-Launch Verification Checklist.',
      'Record a 60-second video demo or capture high-resolution screenshots.',
      'Publish a Showcase post in the INNOVEXA Community feed.',
      'Post on external channels (Twitter/X, LinkedIn, Discord communities).',
      'Engage with every comment and review within the first 24 hours.'
    ],
    example: {
      bad: 'Posting "Check out my link" with no screenshots, no description, and never replying to comments.',
      good: 'A compelling post explaining: "We built an AI mock interview simulator because our classmates struggled with technical prep. Here is a 45s demo, it is 100% free to test, and we’d love your brutal feedback!"',
      explanation: 'Authentic problem story, immediate visual proof, and clear call-to-action.'
    },
    innovexaFlow: [
      'Pre-Launch Checklist (10/10)',
      'Community Showcase Post',
      'Explore Status Updated to Launched',
      'Live Review Inflow',
      'Creator Milestone Badge'
    ],
    innovexaConnection: 'In INNOVEXA, mark your project status as "Launched" on the project page and create a Launch Showcase post in the Community feed (/community).',
    tools: ['INNOVEXA Community', 'Product Hunt', 'Loom / Screen Studio', 'Twitter / X'],
    expectedOutput: 'A publicly launched innovation with 10+ initial active user reviews.',
    checklist: [
      { id: 'c19_1', label: 'All 18 preceding roadmap stages verified and tested.' },
      { id: 'c19_2', label: 'Demo video or screenshots attached to project listing.' },
      { id: 'c19_3', label: 'Launch showcase post published in INNOVEXA Community.' },
      { id: 'c19_4', label: 'First 10 external users invited to test and review.' }
    ],
    commonMistakes: [
      { mistake: 'Launching with broken demo links or slow registration forms.', fix: 'Test the live registration link in an incognito window before posting.' },
      { mistake: 'Disappearing immediately after posting.', fix: 'Stay active online to answer questions and thank early reviewers.' }
    ],
    practicalTask: 'Publish your Launch Announcement post in the INNOVEXA Community.',
    actionButton: {
      label: 'Post Launch to Community',
      route: '/community'
    }
  },
  {
    id: 20,
    stageKey: 'stage_20',
    title: '20 — Grow the Innovation (Scale & Ecosystem)',
    shortTitle: 'Scale & Grow',
    category: 'launch',
    categoryLabel: 'SCALE & SUSTAINABILITY',
    goal: 'Build an engaged user community, scale infrastructure, add advanced capabilities, and expand your impact.',
    whatIsIt: {
      beginner: 'Growing means keeping the momentum going! You continue adding valuable features, rewarding your top reviewers, and growing your community over time.',
      intermediate: 'Scaling user retention: implementing gamified creator badges, contributor referral programs, expanding API integrations, and maintaining weekly release cadences.',
      advanced: 'Ecosystem orchestration: open-source community governance, enterprise integrations, distributed micro-caching, monetization / grant funding, and strategic partnerships.'
    },
    whyImportant: 'Innovation is a continuous journey. Successful projects compound over months and years through steady dedication and community support.',
    whatToLearn: [
      'The Continuous Innovation Lifecycle Loop: IDEA → VALIDATE → BUILD → TEST → LAUNCH → LEARN → IMPROVE → RE-VALIDATE → GROW',
      'Community Governance & Contributor Incentives',
      'Infrastructure Scaling & Database Read Replicas',
      'Feature Backlog Prioritization for Long-term Moats',
      'Grant Funding, Competitions & Startup Incubators'
    ],
    whatToDo: [
      'Establish a weekly cadence for reviewing community feedback and shipping updates.',
      'Reward your top reviewers by highlighting their contributions in release notes.',
      'Explore integrations with complementary tools in your ecosystem.',
      'Apply to innovation competitions, grant programs, or accelerator funds.'
    ],
    example: {
      bad: 'Abandoning the project 2 weeks after launch because it didn’t automatically get 1,000,000 users overnight.',
      good: 'Iterating consistently for 6 months, building a passionate core community of 300 active users, winning a university innovation grant, and scaling into a full-fledged startup.',
      explanation: 'Compounding consistency turns a humble student project into a transformative company.'
    },
    innovexaFlow: [
      'IDEA → VALIDATE → BUILD → TEST → LAUNCH',
      'LEARN → IMPROVE → RE-VALIDATE → GROW',
      'Compound Value & Community Trust'
    ],
    innovexaConnection: 'INNOVEXA is built to support your entire innovation lifecycle. From your first 1-sentence idea to multi-version scalable platforms, INNOVEXA is your innovation companion.',
    tools: ['INNOVEXA Ecosystem', 'GitHub Discussions', 'Discord Community', 'Stripe / Open Collective'],
    expectedOutput: 'A thriving, self-sustaining innovation with active community participation.',
    checklist: [
      { id: 'c20_1', label: 'Continuous feedback-and-release cadence established.' },
      { id: 'c20_2', label: 'Active community forum maintained in INNOVEXA Community.' },
      { id: 'c20_3', label: 'Version roadmap updated with next-quarter milestones.' },
      { id: 'c20_4', label: 'Innovation lifecycle mastered from Problem to Growth.' }
    ],
    commonMistakes: [
      { mistake: 'Stopping all development after the initial launch excitement fades.', fix: 'Schedule small, manageable weekly improvements to maintain momentum.' },
      { mistake: 'Neglecting technical debt as user traffic grows.', fix: 'Dedicate 20% of development time to refactoring and database optimization.' }
    ],
    practicalTask: 'Plan your project’s next 3 milestone features for Version 3.0.',
    actionButton: {
      label: 'Manage Versions & Milestones',
      route: '/my-projects'
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 26 IMPORTANT CONCEPTS IN THE CONCEPT LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
const CONCEPT_LIBRARY: ConceptItem[] = [
  {
    id: 'c_problem_statement',
    name: 'Problem Statement',
    category: 'Foundation',
    definition: 'A crisp, 1–2 sentence description of the friction experienced by a specific target audience.',
    detailedExplanation: {
      beginner: 'A simple sentence that explains who is struggling, what they are struggling with, and why it matters. It never mentions technology or coding.',
      intermediate: 'A structured hypothesis defining the user persona, the friction trigger, the baseline workaround, and the measurable cost of the problem.',
      advanced: 'Falsifiable problem formulation mapping user pain vectors, churn triggers, and cognitive load hurdles against addressable market segments.'
    },
    codeOrDiagram: 'Problem = [Target Persona] + [Current Barrier] + [Consequence / Inefficiency]',
    innovexaUsage: 'Every project created in INNOVEXA begins with a mandatory Problem Statement that anchors the AI evaluation.',
    relatedStages: [1, 2, 3]
  },
  {
    id: 'c_user_research',
    name: 'User Research',
    category: 'Foundation',
    definition: 'Investigating real human workflows, habits, and frustrations before designing a solution.',
    detailedExplanation: {
      beginner: 'Talking to potential users and asking open-ended questions about how they currently solve their daily problems.',
      intermediate: 'Conducting semi-structured qualitative interviews, surveys, and thematic coding to discover unmet behavioral needs.',
      advanced: 'Multi-cohort qualitative synthesis, user journey mapping, and jobs-to-be-done (JTBD) framework application.'
    },
    codeOrDiagram: 'Interview Target Users → Synthesize Recurring Themes → Extract Critical Gaps',
    innovexaUsage: 'Use the INNOVEXA Community feed to post interview surveys and problem discussions.',
    relatedStages: [1, 2, 4]
  },
  {
    id: 'c_market_research',
    name: 'Market Research & Benchmarks',
    category: 'Foundation',
    definition: 'Analyzing competitors, industry solutions, and existing alternatives in the market.',
    detailedExplanation: {
      beginner: 'Looking at other apps that do something similar and figuring out what they do well and what they do poorly.',
      intermediate: 'Systematic competitive feature matrix, pricing tier comparison, and identifying underserved niche markets.',
      advanced: 'Market TAM/SAM/SOM estimation, competitive moat evaluation, and architectural benchmark extraction.'
    },
    innovexaUsage: 'INNOVEXA’s AI Research engine automatically pulls competitor benchmarks and market comparisons.',
    relatedStages: [2, 3]
  },
  {
    id: 'c_mvp',
    name: 'Minimum Viable Product (MVP)',
    category: 'Foundation',
    definition: 'The simplest version of your innovation that delivers core value and tests your primary hypothesis.',
    detailedExplanation: {
      beginner: 'The smallest version of your project that actually works. It has only the 2 or 3 features necessary to solve the problem.',
      intermediate: 'A scoped prototype engineered to maximize validated learning about customers with the least engineering effort.',
      advanced: 'Hypothesis-testing software artifact designed for tight feedback loops, measurable activation metrics, and fast pivot agility.'
    },
    codeOrDiagram: 'MVP Scope = [Must-Have Core Loop] — [Nice-To-Have Distractions]',
    innovexaUsage: 'INNOVEXA AI generates an 8-phase MVP implementation roadmap for every research topic.',
    relatedStages: [3, 5, 11]
  },
  {
    id: 'c_ui_ux',
    name: 'UI/UX Design',
    category: 'Design & UX',
    definition: 'User Interface (visual look) and User Experience (interaction flow and feel) of software.',
    detailedExplanation: {
      beginner: 'UI is how pretty the buttons and colors look. UX is how easy it is to find what you want without getting confused.',
      intermediate: 'Information architecture, visual hierarchy, mobile responsiveness, accessibility standards, and micro-interactions.',
      advanced: 'Design token architecture, cognitive load reduction, state machine transition modeling, and WCAG AAA compliance.'
    },
    innovexaUsage: 'INNOVEXA uses an editorial light palette with DM Serif Display headings and micro-animated interactions.',
    relatedStages: [7]
  },
  {
    id: 'c_frontend',
    name: 'Frontend (Client-Side)',
    category: 'Architecture',
    definition: 'The part of the application that runs directly in the user’s browser (HTML, CSS, React, JavaScript).',
    detailedExplanation: {
      beginner: 'Everything the user sees and clicks on their screen—buttons, forms, animations, and pages.',
      intermediate: 'Single Page Applications (SPAs) built with React and Vite that manage state, route client-side URLs, and render virtual DOM.',
      advanced: 'Component tree optimization, virtualized rendering, code splitting, tree-shaking, and hardware-accelerated animations.'
    },
    codeOrDiagram: 'Browser → React Virtual DOM → Local State + Hooks → DOM Paints (60 FPS)',
    innovexaUsage: 'INNOVEXA is built with modern React 18, Vite, and Tailwind CSS for instant rendering.',
    relatedStages: [6, 8, 11]
  },
  {
    id: 'c_backend',
    name: 'Backend & Serverless',
    category: 'Architecture',
    definition: 'The server-side system that handles business logic, database queries, and secure API keys.',
    detailedExplanation: {
      beginner: 'The invisible brain behind the app that runs on a computer in the cloud. It checks passwords and saves data.',
      intermediate: 'Serverless backend functions and Backend-as-a-Service (BaaS) that expose secure REST endpoints and manage business logic.',
      advanced: 'Stateless edge runtime workers, connection-pooled database gateways, async event queues, and rate-limiting middleware.'
    },
    innovexaUsage: 'Supabase provides the managed backend infrastructure and Edge Functions for INNOVEXA.',
    relatedStages: [6, 8, 11]
  },
  {
    id: 'c_api',
    name: 'API (Application Programming Interface)',
    category: 'Architecture',
    definition: 'A standardized messenger that lets different software applications exchange data.',
    detailedExplanation: {
      beginner: 'A menu in a restaurant: your frontend asks for data (like "Give me project #4"), and the API delivers the answer in JSON format.',
      intermediate: 'HTTP-based RESTful or GraphQL endpoints supporting GET, POST, PUT, DELETE operations with JSON payloads and HTTP status codes.',
      advanced: 'OpenAPI specification compliance, idempotent mutation headers, rate-limiting tokens, and asynchronous webhook delivery.'
    },
    codeOrDiagram: 'React (Client) ──[ HTTP GET /api/projects ]──► Backend ──► Return JSON [{ id: 1, title: "..." }]',
    innovexaUsage: 'INNOVEXA communicates with Supabase and Google Gemini via structured REST API calls.',
    relatedStages: [6, 8, 12]
  },
  {
    id: 'c_database',
    name: 'Relational Database (PostgreSQL)',
    category: 'Data & Security',
    definition: 'An organized, persistent digital filing system that stores structured records in connected tables.',
    detailedExplanation: {
      beginner: 'A giant collection of smart spreadsheets that remember all your user accounts, projects, and reviews forever.',
      intermediate: 'ACID-compliant relational database management system using SQL tables, foreign keys, indexes, and transaction locks.',
      advanced: 'PostgreSQL relational engine with write-ahead logging (WAL), B-tree query planner, and Row-Level Security evaluation.'
    },
    innovexaUsage: 'INNOVEXA uses Supabase PostgreSQL for persistent storage of projects, reviews, versions, and user profiles.',
    relatedStages: [6, 9]
  },
  {
    id: 'c_authentication',
    name: 'Authentication ("Auth")',
    category: 'Data & Security',
    definition: 'The process of verifying the identity of a user attempting to access a system.',
    detailedExplanation: {
      beginner: 'Checking your email and password to confirm "Who are you?" before letting you into the app.',
      intermediate: 'Cryptographic credential verification generating JSON Web Tokens (JWT) stored in browser sessions with automatic expiration.',
      advanced: 'PKCE OAuth 2.0 flows, salted bcrypt password hashing, multi-factor authentication (MFA), and session token rotation.'
    },
    innovexaUsage: 'INNOVEXA uses Supabase Auth with JWT tokens to manage secure user sessions and protected routes.',
    relatedStages: [10, 14]
  },
  {
    id: 'c_authorization',
    name: 'Authorization & Permissions',
    category: 'Data & Security',
    definition: 'The process of determining what actions an authenticated user is permitted to perform.',
    detailedExplanation: {
      beginner: 'Deciding "What are you allowed to do?" (e.g., you can edit your own project, but you cannot delete someone else’s project).',
      intermediate: 'Role-Based Access Control (RBAC) and attribute permissions enforced on both the client navigation and server-side endpoints.',
      advanced: 'Granular policy evaluation matrices, least-privilege scoping, and decentralized cryptographic access tokens.'
    },
    innovexaUsage: 'INNOVEXA enforces authorization so only creators can edit their projects and only admins can manage global badges.',
    relatedStages: [10, 14]
  },
  {
    id: 'c_rls',
    name: 'Row-Level Security (RLS)',
    category: 'Data & Security',
    definition: 'A PostgreSQL security feature that restricts which table rows a user can query or modify based on security policies.',
    detailedExplanation: {
      beginner: 'A security guard built directly into the database. Even if someone tries to fetch all projects, the database only hands over what they are allowed to see.',
      intermediate: 'Database-level security policies evaluated per SQL statement: `CREATE POLICY "owner_edit" ON projects FOR UPDATE USING (auth.uid() = owner_id)`.',
      advanced: 'Sub-query policy filtering, security barrier views, bypass prevention, and zero-trust database permission enforcement.'
    },
    codeOrDiagram: 'CREATE POLICY "Users can edit own projects" ON projects FOR UPDATE USING (auth.uid() = owner_id);',
    innovexaUsage: 'Every table in INNOVEXA has RLS enabled to prevent unauthorized modifications to reviews and projects.',
    relatedStages: [9, 10, 14]
  },
  {
    id: 'c_crud',
    name: 'CRUD Operations',
    category: 'Data & Security',
    definition: 'The four basic functions of persistent storage: Create, Read, Update, and Delete.',
    detailedExplanation: {
      beginner: 'Create = Post a new project. Read = View a project. Update = Edit project details. Delete = Remove a project.',
      intermediate: 'Mapping HTTP methods to database operations: POST (Create), GET (Read), PATCH/PUT (Update), DELETE (Delete).',
      advanced: 'Atomic transaction execution, optimistic concurrency control, soft vs hard deletes, and idempotency guarantees.'
    },
    innovexaUsage: 'INNOVEXA implements full CRUD operations across projects, reviews, community posts, and version milestones.',
    relatedStages: [9, 11]
  },
  {
    id: 'c_rest',
    name: 'REST Architecture',
    category: 'Architecture',
    definition: 'Representational State Transfer: a design standard for building clean, stateless web APIs.',
    detailedExplanation: {
      beginner: 'A set of polite rules for how web applications ask for data using simple URLs like `/projects/123`.',
      intermediate: 'Stateless client-server communication using standard HTTP methods, resource-oriented URIs, and JSON payloads.',
      advanced: 'HATEOAS constraints, HTTP cache-control headers, idempotent request semantics, and content negotiation.'
    },
    innovexaUsage: 'INNOVEXA queries Supabase via PostgREST endpoints generated automatically from the database schema.',
    relatedStages: [6, 8]
  },
  {
    id: 'c_ai',
    name: 'Artificial Intelligence & LLMs',
    category: 'AI & Algorithms',
    definition: 'Large Language Models (like Gemini) trained to understand, reason, and generate structured human text and code.',
    detailedExplanation: {
      beginner: 'Super-smart computer models that can read paragraphs of text, understand what they mean, and write helpful answers.',
      intermediate: 'Transformer-based neural networks processing tokens to perform sentiment classification, synthesis, and JSON generation.',
      advanced: 'Multimodal transformer architectures, attention mechanisms, contextual window scaling, and temperature sampling control.'
    },
    innovexaUsage: 'INNOVEXA integrates Google Gemini 2.5 Flash for real-time research, sentiment analysis, and suggestions.',
    relatedStages: [12, 18]
  },
  {
    id: 'c_prompt_engineering',
    name: 'Prompt Engineering',
    category: 'AI & Algorithms',
    definition: 'The art of structuring input instructions to guide an AI model to produce accurate, consistent, and structured responses.',
    detailedExplanation: {
      beginner: 'Writing clear instructions for the AI so it doesn’t guess or write useless paragraphs.',
      intermediate: 'Role-prompting, few-shot demonstration examples, negative constraints, and enforcing structured JSON output schemas.',
      advanced: 'Chain-of-thought conditioning, context compression, dynamic temperature tuning, and automated prompt evaluation harnesses.'
    },
    codeOrDiagram: 'System Prompt: "You are an innovation reviewer. Analyze the review and respond ONLY with JSON matching the provided schema."',
    innovexaUsage: 'INNOVEXA uses strict JSON prompt schemas so Gemini returns typed objects for ratings and categories.',
    relatedStages: [12]
  },
  {
    id: 'c_sentiment_analysis',
    name: 'Sentiment Analysis',
    category: 'AI & Algorithms',
    definition: 'Using natural language processing to determine whether user text is positive, negative, neutral, or constructive.',
    detailedExplanation: {
      beginner: 'Teaching the computer to read a review and tell you if the person is happy, disappointed, or giving advice.',
      intermediate: 'Multi-class sentiment classification extracting emotional valence, confidence scores, and constructive critique categories.',
      advanced: 'Aspect-based sentiment analysis (ABSA) scoring individual features (e.g. "UI is great (+1), but speed is terrible (-1)").'
    },
    codeOrDiagram: 'Review Text ──► Gemini AI ──► { score: 85, sentiment: "positive", category: "UX_PRAISE" }',
    innovexaUsage: 'Every review submitted in INNOVEXA is processed by Gemini to compute sentiment and categorize actionable feedback.',
    relatedStages: [4, 12, 18]
  },
  {
    id: 'c_vector_search',
    name: 'Vector Search & Embeddings',
    category: 'AI & Algorithms',
    definition: 'Converting text into high-dimensional numerical coordinates to search by meaning rather than exact keyword matches.',
    detailedExplanation: {
      beginner: 'A search engine that understands what you mean even if you use completely different words (e.g. "doctor" finds "physician").',
      intermediate: 'Generating 768-dimensional text embeddings and performing cosine similarity searches to discover related projects.',
      advanced: 'HNSW indexing, vector quantization, retrieval-augmented generation (RAG), and hybrid keyword-vector rank fusion.'
    },
    innovexaUsage: 'INNOVEXA uses semantic similarity algorithms to power the "Related Projects" and "Compare Innovations" features.',
    relatedStages: [2, 12]
  },
  {
    id: 'c_semantic_search',
    name: 'Semantic Search',
    category: 'AI & Algorithms',
    definition: 'Search technology that understands user intent and contextual meaning rather than simple literal string matching.',
    detailedExplanation: {
      beginner: 'Searching for "interview helper" finds projects named "Career Practice Simulator" because the computer understands the concept.',
      intermediate: 'Query intent parsing, keyword expansion, category filtering, and semantic rank scoring across title and problem descriptions.',
      advanced: 'Cross-encoder reranking, BM25 + dense vector hybrid retrieval, and real-time query disambiguation.'
    },
    innovexaUsage: 'The Explore page in INNOVEXA provides intelligent semantic ranking across all registered innovations.',
    relatedStages: [2, 11]
  },
  {
    id: 'c_testing',
    name: 'Quality Assurance & Testing',
    category: 'DevOps & Tooling',
    definition: 'Systematically verifying that software operates correctly under all intended conditions and gracefully handles errors.',
    detailedExplanation: {
      beginner: 'Clicking every button and typing weird things into forms to make sure the app never crashes or loses data.',
      intermediate: 'Unit testing utility functions, integration testing API routes, and simulating user flows with test runners.',
      advanced: 'End-to-end browser automation (Playwright), visual regression diffing, mutation testing, and CI/CD test gates.'
    },
    innovexaUsage: 'INNOVEXA undergoes rigorous end-to-end testing from project submission to review score updates.',
    relatedStages: [13]
  },
  {
    id: 'c_deployment',
    name: 'Deployment & Hosting',
    category: 'DevOps & Tooling',
    definition: 'The process of building, publishing, and serving your application files on global internet servers.',
    detailedExplanation: {
      beginner: 'Taking your code from your laptop and putting it on a public website address (like `innovexa.vercel.app`).',
      intermediate: 'Compiling optimized production bundles and deploying them to global Content Delivery Networks (CDNs) with SSL certificates.',
      advanced: 'Edge computing distribution, atomic immutable deployments, instantaneous cache invalidation, and automated rollback.'
    },
    innovexaUsage: 'INNOVEXA is deployed globally via Vercel edge networks for lightning-fast worldwide access.',
    relatedStages: [16]
  },
  {
    id: 'c_git',
    name: 'Git (Version Control)',
    category: 'DevOps & Tooling',
    definition: 'A distributed version control system that tracks code changes and lets you save checkpoints and restore past versions.',
    detailedExplanation: {
      beginner: 'A time machine for your code. If you make a mistake, Git lets you jump back to when your app was working perfectly.',
      intermediate: 'Tracking file diffs with commits, creating isolated feature branches, and merging code safely.',
      advanced: 'Interactive rebasing, three-way merge conflict resolution, cherry-picking, and git bisect debugging.'
    },
    codeOrDiagram: 'git add . ──► git commit -m "feat: add review sentiment" ──► git push origin main',
    innovexaUsage: 'Every update to the INNOVEXA codebase is tracked and versioned using Git.',
    relatedStages: [8, 16]
  },
  {
    id: 'c_github',
    name: 'GitHub',
    category: 'DevOps & Tooling',
    definition: 'A cloud platform that hosts Git repositories, pull requests, issue trackers, and automated CI/CD workflows.',
    detailedExplanation: {
      beginner: 'A social website where programmers back up their code in the cloud and collaborate with teammates.',
      intermediate: 'Managing remote Git repositories, code reviews via Pull Requests, and automated testing via GitHub Actions.',
      advanced: 'Branch protection rules, automated semantic release tagging, security vulnerability scanning, and webhook event dispatching.'
    },
    innovexaUsage: 'INNOVEXA’s repository and automated Vercel deployment webhooks are connected via GitHub.',
    relatedStages: [8, 16]
  },
  {
    id: 'c_env_vars',
    name: 'Environment Variables',
    category: 'DevOps & Tooling',
    definition: 'Dynamic configuration values stored outside your source code to keep private keys and URLs secure.',
    detailedExplanation: {
      beginner: 'Secret passwords stored in a private `.env` file that should never be shared publicly on GitHub.',
      intermediate: 'Key-value pairs (e.g. `VITE_SUPABASE_URL`) injected at build time to configure different development and production environments.',
      advanced: 'Zero-trust secret management, encrypted environment injection, and dynamic secret rotation in cloud hosting pipelines.'
    },
    codeOrDiagram: 'VITE_SUPABASE_URL="https://xyz.supabase.co"\nVITE_GEMINI_API_KEY="AIzaSy..."',
    innovexaUsage: 'INNOVEXA reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY` from environment variables.',
    relatedStages: [10, 14, 16]
  },
  {
    id: 'c_performance',
    name: 'Web Performance & Core Web Vitals',
    category: 'DevOps & Tooling',
    definition: 'The speed, responsiveness, and visual stability of a web application as experienced by real users.',
    detailedExplanation: {
      beginner: 'How fast the page shows up on screen and how quickly it responds when you click a button.',
      intermediate: 'Optimizing Largest Contentful Paint (LCP < 2.5s), Interaction to Next Paint (INP < 200ms), and Cumulative Layout Shift (CLS < 0.1).',
      advanced: 'Resource prioritization hints (`preload`, `fetchpriority`), layout thrashing avoidance, and virtual DOM diff minimization.'
    },
    innovexaUsage: 'INNOVEXA is engineered for sub-second page transitions and smooth 60 FPS Framer Motion animations.',
    relatedStages: [15]
  },
  {
    id: 'c_security',
    name: 'Web Security & OWASP',
    category: 'Data & Security',
    definition: 'Protective measures taken across code and databases to prevent unauthorized access and cyber exploits.',
    detailedExplanation: {
      beginner: 'Locking all digital doors and windows so hackers cannot steal user data or vandalize your project.',
      intermediate: 'Guarding against the OWASP Top 10: preventing SQL injection, Cross-Site Scripting (XSS), and insecure direct object references.',
      advanced: 'Content Security Policies (CSP), HTTP Strict Transport Security (HSTS), cross-site request forgery (CSRF) protection, and security audits.'
    },
    innovexaUsage: 'INNOVEXA sanitizes user input and enforces database Row-Level Security across all endpoints.',
    relatedStages: [14]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 10 TOOLS DIRECTORY
// ─────────────────────────────────────────────────────────────────────────────
const TOOLS_DIRECTORY: ToolItem[] = [
  {
    id: 't_vscode',
    name: 'VS Code',
    category: 'Code Editor',
    icon: 'Terminal',
    badge: 'IDE',
    whatItIs: 'The world’s most popular, extensible open-source code editor developed by Microsoft.',
    whyUsed: 'Provides fast code editing, built-in terminal, Git source control, and rich TypeScript IntelliSense.',
    innovexaRole: 'Used to develop and edit the INNOVEXA React, TypeScript, and Tailwind CSS components.',
    officialDocUrl: 'https://code.visualstudio.com'
  },
  {
    id: 't_git',
    name: 'Git',
    category: 'Version Control',
    icon: 'GitBranch',
    badge: 'CLI',
    whatItIs: 'A fast, distributed command-line version control system that records changes to files over time.',
    whyUsed: 'Allows developers to create checkpoints, switch branches, collaborate, and safely revert bugs.',
    innovexaRole: 'Tracks every commit, branch, and milestone release in the INNOVEXA codebase.',
    officialDocUrl: 'https://git-scm.com'
  },
  {
    id: 't_github',
    name: 'GitHub',
    category: 'Collaboration & CI/CD',
    icon: 'Globe',
    badge: 'Cloud',
    whatItIs: 'A cloud hosting platform for Git repositories with issue tracking, pull requests, and automated actions.',
    whyUsed: 'Backs up code to the cloud, enables team peer code reviews, and triggers automatic production deployments.',
    innovexaRole: 'Hosts the INNOVEXA remote repository and triggers Vercel automated preview builds.',
    officialDocUrl: 'https://github.com'
  },
  {
    id: 't_react',
    name: 'React 18',
    category: 'Frontend UI Library',
    icon: 'Code2',
    badge: 'UI Engine',
    whatItIs: 'A declarative, component-based JavaScript library for building responsive user interfaces.',
    whyUsed: 'Enables modular UI components, instant virtual DOM updates, and rich state management with hooks.',
    innovexaRole: 'The core UI engine that powers all pages, cards, modals, and dynamic state in INNOVEXA.',
    officialDocUrl: 'https://react.dev'
  },
  {
    id: 't_vite',
    name: 'Vite',
    category: 'Build Tool & Dev Server',
    icon: 'Zap',
    badge: 'Build Tool',
    whatItIs: 'A lightning-fast modern frontend build tool powered by native ES modules and Rollup/esbuild.',
    whyUsed: 'Provides instant server startup, sub-second Hot Module Replacement (HMR), and optimized production builds.',
    innovexaRole: 'Compiles and bundles the INNOVEXA TypeScript source code into optimized browser assets.',
    officialDocUrl: 'https://vitejs.dev'
  },
  {
    id: 't_tailwind',
    name: 'Tailwind CSS',
    category: 'Utility-First CSS',
    icon: 'Sliders',
    badge: 'Styling',
    whatItIs: 'A utility-first CSS framework packed with classes that can be composed directly in markup.',
    whyUsed: 'Eliminates naming CSS classes, guarantees consistent spacing and colors, and purges unused CSS for tiny bundles.',
    innovexaRole: 'Provides the crisp layout, typography, and color tokens that define INNOVEXA’s editorial aesthetic.',
    officialDocUrl: 'https://tailwindcss.com'
  },
  {
    id: 't_supabase',
    name: 'Supabase',
    category: 'Backend-as-a-Service (BaaS)',
    icon: 'Database',
    badge: 'Database & Auth',
    whatItIs: 'An open-source Firebase alternative providing a dedicated PostgreSQL database, Auth, and Realtime.',
    whyUsed: 'Provides relational SQL tables, user authentication, and Row-Level Security without managing servers.',
    innovexaRole: 'Stores all INNOVEXA profiles, projects, reviews, community discussions, and notifications.',
    officialDocUrl: 'https://supabase.com'
  },
  {
    id: 't_gemini',
    name: 'Google Gemini API',
    category: 'Generative AI Engine',
    icon: 'Sparkles',
    badge: 'AI Intelligence',
    whatItIs: 'Google’s state-of-the-art multimodal AI model family designed for reasoning, synthesis, and code.',
    whyUsed: 'Offers low-latency, cost-effective structured JSON generation, research synthesis, and sentiment analysis.',
    innovexaRole: 'Powers the AI Research Dossier, review sentiment classification, and project improvement engine.',
    officialDocUrl: 'https://ai.google.dev'
  },
  {
    id: 't_vercel',
    name: 'Vercel',
    category: 'Edge Deployment Platform',
    icon: 'Rocket',
    badge: 'Cloud Host',
    whatItIs: 'A cloud platform for frontend frameworks that deploys web applications to a global Edge Network.',
    whyUsed: 'Provides zero-config deployments from GitHub, automatic SSL certificates, fast CDN caching, and custom domains.',
    innovexaRole: 'Hosts the live INNOVEXA web application and serves it worldwide with sub-second latency.',
    officialDocUrl: 'https://vercel.com'
  },
  {
    id: 't_antigravity',
    name: 'Antigravity',
    category: 'AI Pair Programmer',
    icon: 'Cpu',
    badge: 'Agentic Tooling',
    whatItIs: 'An advanced agentic AI coding companion designed by Google DeepMind for full-stack engineering.',
    whyUsed: 'Accelerates design, architectural planning, refactoring, and comprehensive end-to-end implementation.',
    innovexaRole: 'Helps design, architect, build, and continuously refine the INNOVEXA platform ecosystem.',
    officialDocUrl: 'https://deepmind.google'
  }
];

// Helper for saving checklist progress
const STORAGE_KEY_PREFIX = 'innovexa_roadmap_v2_';

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP PAGE MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { projects, getProjectById } = useProjects();

  // Selected project connection
  const userProjects = useMemo(() => {
    return projects.filter(p => p.owner_id === (user?.id || 'current') || p.owner_id?.startsWith('demo-creator'));
  }, [projects, user]);

  const activeProjectId = params.id || userProjects[0]?.id || projects[0]?.id || '';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId);
  const currentProject = getProjectById(selectedProjectId) || projects[0];

  // Learning Level state
  const [learningLevel, setLearningLevel] = useState<LearningLevel>('beginner');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'discover' | 'plan' | 'build' | 'test' | 'launch'>('all');

  // Expandable stages state: which stage is currently expanded (default: stage 1)
  const [expandedStageId, setExpandedStageId] = useState<number | null>(1);

  // Concept Modal / Drawer state
  const [selectedConcept, setSelectedConcept] = useState<ConceptItem | null>(null);

  // Storage key for the active project
  const storageKey = `${STORAGE_KEY_PREFIX}${selectedProjectId || 'global'}`;

  // Completed checklist items: { [stageId: number]: string[] }
  const [checkedItems, setCheckedItems] = useState<{ [stageId: number]: string[] }>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_checked`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Manually completed stages: number[]
  const [manuallyCompletedStages, setManuallyCompletedStages] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_completed_stages`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever checkedItems or completedStages change
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_checked`, JSON.stringify(checkedItems));
      localStorage.setItem(`${storageKey}_completed_stages`, JSON.stringify(manuallyCompletedStages));
    } catch (e) {
      console.error('Failed to save roadmap progress', e);
    }
  }, [checkedItems, manuallyCompletedStages, storageKey]);

  // Interactive User Innovation Input State (Problem Statement & Solution)
  const [userInnovation, setUserInnovation] = useState({
    problemTitle: '',
    problemDescription: '',
    targetAudience: '',
    solutionDescription: '',
    valueProposition: '',
    category: 'AI & Machine Learning'
  });

  const [innovationSavedToast, setInnovationSavedToast] = useState<string | null>(null);

  // Sync user innovation inputs with selected project or local storage
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(`innovexa_roadmap_user_data_${selectedProjectId || 'global'}`);
      if (savedCustom) {
        setUserInnovation(JSON.parse(savedCustom));
      } else if (currentProject) {
        setUserInnovation({
          problemTitle: currentProject.problem_title || '',
          problemDescription: currentProject.problem_description || '',
          targetAudience: currentProject.target_audience || '',
          solutionDescription: currentProject.solution_description || '',
          valueProposition: currentProject.value_proposition || '',
          category: currentProject.category || 'AI & Machine Learning'
        });
      }
    } catch (e) {
      console.warn('Failed to load user innovation data:', e);
    }
  }, [selectedProjectId, currentProject]);

  const saveUserInnovationData = (data: typeof userInnovation) => {
    setUserInnovation(data);
    try {
      localStorage.setItem(`innovexa_roadmap_user_data_${selectedProjectId || 'global'}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save user innovation data:', e);
    }
  };

  // Handler: Save Problem Statement and Proceed to Stage 2 (Market Research)
  const handleSaveProblemAndProceed = () => {
    if (!userInnovation.problemDescription.trim() && !userInnovation.problemTitle.trim()) {
      alert('Please write your Problem Statement before proceeding to the next step.');
      return;
    }

    saveUserInnovationData(userInnovation);

    // Auto-complete Stage 1 checklist items
    const stage1ItemIds = ROADMAP_STAGES[0].checklist.map(c => c.id);
    setCheckedItems(prev => ({ ...prev, 1: stage1ItemIds }));
    setManuallyCompletedStages(prev => Array.from(new Set([...prev, 1])));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setInnovationSavedToast('Problem Statement saved! Proceeding to Step 02: Research.');
    setTimeout(() => setInnovationSavedToast(null), 4000);

    // Auto-expand and scroll to Stage 2
    setExpandedStageId(2);
    setTimeout(() => {
      const el = document.getElementById('stage-2');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Handler: Save Solution Description and Proceed to Stage 4 (Validate Idea)
  const handleSaveSolutionAndProceed = () => {
    if (!userInnovation.solutionDescription.trim()) {
      alert('Please write your Solution Description before proceeding to the next step.');
      return;
    }

    saveUserInnovationData(userInnovation);

    // Auto-complete Stage 3 checklist items
    const stage3ItemIds = ROADMAP_STAGES[2].checklist.map(c => c.id);
    setCheckedItems(prev => ({ ...prev, 3: stage3ItemIds }));
    setManuallyCompletedStages(prev => Array.from(new Set([...prev, 3])));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setInnovationSavedToast('Solution Definition saved! Proceeding to Step 04: Validation.');
    setTimeout(() => setInnovationSavedToast(null), 4000);

    // Auto-expand and scroll to Stage 4
    setExpandedStageId(4);
    setTimeout(() => {
      const el = document.getElementById('stage-4');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Helper to check if a stage is completed
  const isStageCompleted = (stage: StageData) => {
    if (manuallyCompletedStages.includes(stage.id)) return true;
    const stageChecked = checkedItems[stage.id] || [];
    return stage.checklist.length > 0 && stageChecked.length === stage.checklist.length;
  };

  // Helper to check if a stage is in-progress
  const isStageInProgress = (stage: StageData) => {
    if (isStageCompleted(stage)) return false;
    const stageChecked = checkedItems[stage.id] || [];
    return stageChecked.length > 0;
  };

  // Toggle checklist item
  const toggleChecklistItem = (stageId: number, itemId: string) => {
    setCheckedItems(prev => {
      const currentList = prev[stageId] || [];
      const newList = currentList.includes(itemId)
        ? currentList.filter(id => id !== itemId)
        : [...currentList, itemId];
      return { ...prev, [stageId]: newList };
    });
  };

  // Toggle stage completion manually
  const toggleStageCompletion = (stage: StageData) => {
    const completed = isStageCompleted(stage);
    if (!completed) {
      // Mark all checklist items as checked and mark stage completed
      const allItemIds = stage.checklist.map(c => c.id);
      setCheckedItems(prev => ({ ...prev, [stage.id]: allItemIds }));
      setManuallyCompletedStages(prev => Array.from(new Set([...prev, stage.id])));

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Auto-expand next stage if available
      if (stage.id < 20) {
        setExpandedStageId(stage.id + 1);
      }
    } else {
      // Unmark stage
      setCheckedItems(prev => ({ ...prev, [stage.id]: [] }));
      setManuallyCompletedStages(prev => prev.filter(id => id !== stage.id));
    }
  };

  // Statistics calculation (strictly based on actual completion, NO fake progress!)
  const totalStagesCount = ROADMAP_STAGES.length;
  const completedStagesCount = useMemo(() => {
    return ROADMAP_STAGES.filter(stage => isStageCompleted(stage)).length;
  }, [checkedItems, manuallyCompletedStages]);

  const inProgressStagesCount = useMemo(() => {
    return ROADMAP_STAGES.filter(stage => isStageInProgress(stage)).length;
  }, [checkedItems, manuallyCompletedStages]);

  const remainingStagesCount = totalStagesCount - completedStagesCount;
  const progressPercent = Math.round((completedStagesCount / totalStagesCount) * 100);

  // Current stage: first incomplete stage or stage 1
  const currentStage = useMemo(() => {
    return ROADMAP_STAGES.find(stage => !isStageCompleted(stage)) || ROADMAP_STAGES[0];
  }, [checkedItems, manuallyCompletedStages]);

  // Filtered Stages based on Search and Category
  const filteredStages = useMemo(() => {
    return ROADMAP_STAGES.filter(stage => {
      const matchesCategory = selectedCategoryFilter === 'all' || stage.category === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        stage.title.toLowerCase().includes(q) ||
        stage.goal.toLowerCase().includes(q) ||
        stage.whatIsIt.beginner.toLowerCase().includes(q) ||
        stage.whatIsIt.intermediate.toLowerCase().includes(q) ||
        stage.whatIsIt.advanced.toLowerCase().includes(q) ||
        stage.whatToLearn.some(item => item.toLowerCase().includes(q)) ||
        stage.tools.some(tool => tool.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Filtered Concepts in Library
  const filteredConcepts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return CONCEPT_LIBRARY;
    return CONCEPT_LIBRARY.filter(concept => 
      concept.name.toLowerCase().includes(q) ||
      concept.category.toLowerCase().includes(q) ||
      concept.definition.toLowerCase().includes(q) ||
      concept.innovexaUsage.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Navigate to real action
  const handleActionClick = (route: string) => {
    if (route.includes(':id') && currentProject) {
      navigate(route.replace(':id', currentProject.id));
    } else {
      navigate(route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#20202A] pb-24 font-sans selection:bg-[#6875E8]/20">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#E3DED5] bg-white/70 backdrop-blur-md pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Label & Personal Project Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6875E8]/10 text-[#6875E8] text-xs font-mono font-bold tracking-wider uppercase border border-[#6875E8]/20">
                <Compass className="w-3.5 h-3.5" />
                INNOVATION BUILDING GUIDE
              </span>
              <span className="text-xs font-mono text-[#8E90A2]">| 20-Stage Lifecycle</span>
            </div>

            {/* Project Binder Dropdown */}
            {projects.length > 0 && (
              <div className="flex items-center gap-2 bg-[#F7F4EE] px-3 py-1.5 rounded-xl border border-[#E3DED5] self-start sm:self-auto">
                <span className="text-[11px] font-mono text-[#6E7082] uppercase font-semibold">Active Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-[#181924] focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (v{p.current_version})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#181924] leading-tight">
              BUILD YOUR INNOVATION
            </h1>
            <p className="text-base sm:text-lg text-[#555768] font-normal leading-relaxed max-w-3xl">
              From problem discovery to a validated, working innovation — follow the complete step-by-step journey from first inquiry to scalable growth.
            </p>
          </div>

          {/* Visual Lifecycle Pipeline Diagram */}
          <div className="pt-4 border-t border-[#E3DED5]/60">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#8E90A2] font-semibold mb-3 flex items-center justify-between">
              <span>YOUR INNOVATION JOURNEY</span>
              <span className="text-[#6875E8] font-bold">{completedStagesCount} OF 20 STAGES COMPLETE ({progressPercent}%)</span>
            </div>

            {/* Horizontal flow badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#E3DED5]">
              {[
                'Problem', 'Research', 'Idea', 'Validation', 'Requirements', 
                'System Design', 'UI/UX', 'Tech Stack', 'Database', 'Auth', 
                'Development', 'AI Engine', 'Testing', 'Security', 'Performance', 
                'Deployment', 'Monitoring', 'Iteration', 'Launch', 'Grow'
              ].map((stepName, idx) => {
                const stageNum = idx + 1;
                const isDone = isStageCompleted(ROADMAP_STAGES[idx]);
                const isCurrent = currentStage.id === stageNum;
                return (
                  <React.Fragment key={stepName}>
                    <button
                      onClick={() => {
                        setExpandedStageId(stageNum);
                        const el = document.getElementById(`stage-${stageNum}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 transition-all ${
                        isDone
                          ? 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/30 font-bold'
                          : isCurrent
                          ? 'bg-[#181924] text-white font-bold shadow-sm'
                          : 'bg-white/80 text-[#6E7082] border border-[#E3DED5] hover:border-[#6875E8]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 text-[#10B981]" />
                      ) : isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6875E8] animate-pulse"></span>
                      ) : (
                        <span className="text-[9px] text-[#A0A2B4]">{stageNum}</span>
                      )}
                      <span>{stepName}</span>
                    </button>
                    {idx < 19 && <span className="text-[#A0A2B4] text-xs shrink-0">→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. ROADMAP DASHBOARD & CONTROLS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Progress Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3DED5] shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-[#6E7082] font-semibold uppercase">
              <span>Your Progress</span>
              <Activity className="w-4 h-4 text-[#6875E8]" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#181924]">
                {progressPercent}%
              </span>
              <span className="text-xs font-mono text-[#8E90A2]">
                ({completedStagesCount}/20)
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#F0ECE1] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#6875E8] h-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Completed & In Progress */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3DED5] shadow-subtle flex flex-col justify-between">
            <div className="text-xs font-mono text-[#6E7082] font-semibold uppercase">
              Stage Breakdown
            </div>
            <div className="my-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-[#059669] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed:
                </span>
                <span className="font-bold text-[#181924]">{completedStagesCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-[#D97706] font-bold">
                  <Clock className="w-3.5 h-3.5" /> In Progress:
                </span>
                <span className="font-bold text-[#181924]">{inProgressStagesCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-[#8E90A2]">
                  <Circle className="w-3.5 h-3.5" /> Remaining:
                </span>
                <span className="font-bold text-[#181924]">{remainingStagesCount}</span>
              </div>
            </div>
          </div>

          {/* Current Active Stage & Action (Spans 2 columns on desktop) */}
          <div className="col-span-2 bg-[#181924] text-white p-5 rounded-2xl shadow-subtle flex flex-col justify-between border border-[#2D2E3F]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A0A2B4] font-semibold uppercase">CURRENT FOCUS STAGE</span>
              <span className="px-2 py-0.5 rounded bg-[#6875E8]/30 text-[#8895F8] text-[10px] font-bold tracking-wider">
                STAGE {currentStage.id.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="my-2 space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                {currentStage.shortTitle}
              </h3>
              <p className="text-xs text-[#C5C7D5] line-clamp-1">
                NEXT: {currentStage.goal}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setExpandedStageId(currentStage.id);
                  const el = document.getElementById(`stage-${currentStage.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="bg-[#6875E8] hover:bg-[#5764D6] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Continue Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleActionClick(currentStage.actionButton.route)}
                className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-colors"
              >
                {currentStage.actionButton.label}
              </button>
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* INTERACTIVE CONTROLS BAR: LEVEL SELECTOR, SEARCH, & CATEGORY FILTER */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="mt-8 bg-white p-4 rounded-2xl border border-[#E3DED5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Learning Level Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#6E7082] uppercase mr-1">
              Learning Level:
            </span>
            {(['beginner', 'intermediate', 'advanced'] as LearningLevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setLearningLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                  learningLevel === lvl
                    ? 'bg-[#181924] text-white shadow-subtle'
                    : 'bg-[#F7F4EE] text-[#6E7082] hover:text-[#181924] border border-[#E3DED5]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[#8E90A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts (RLS, API, Gemini, Testing...)"
              className="w-full bg-[#F7F4EE] text-xs font-mono text-[#181924] placeholder-[#8E90A2] pl-10 pr-4 py-2 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8E90A2] hover:text-[#181924]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All (20)' },
              { id: 'discover', label: '01-02 Discover' },
              { id: 'plan', label: '03-07 Plan' },
              { id: 'build', label: '08-12 Build' },
              { id: 'test', label: '13-15 Test' },
              { id: 'launch', label: '16-20 Launch' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold shrink-0 transition-all ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-[#6875E8] text-white font-bold'
                    : 'bg-[#F7F4EE] text-[#6E7082] hover:text-[#181924] border border-[#E3DED5]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Toast Notification for Saved Innovation */}
        {innovationSavedToast && (
          <div className="mt-4 bg-[#10B981]/10 border border-[#10B981]/40 text-[#059669] px-4 py-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-between shadow-subtle animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>{innovationSavedToast}</span>
            </div>
            <button 
              onClick={() => setInnovationSavedToast(null)}
              className="text-xs hover:text-[#181924]"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── INTERACTIVE INNOVATION BUILDER WORKBENCH ── */}
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3DED5] pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#6875E8] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                LIVE STEP-BY-STEP BUILDER
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                Input Problem Statement & Solution Concept
              </h3>
              <p className="text-xs text-[#6E7082]">
                Draft your core innovation below to immediately complete the foundational stages and proceed to the next milestone.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-[#181924] bg-[#F7F4EE] px-3 py-1 rounded-xl border border-[#E3DED5] self-start sm:self-auto">
              Active: {selectedProjectId ? currentProject?.title : 'New Innovation Draft'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Step 1 - Problem Statement */}
            <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED5] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-[#6875E8] text-white text-[10px] font-mono font-bold uppercase">
                    Step 01: Problem
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7082]">
                    Stage 01 Focus
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    Target User Demographic:
                  </label>
                  <input
                    type="text"
                    value={userInnovation.targetAudience}
                    onChange={(e) => setUserInnovation({ ...userInnovation, targetAudience: e.target.value })}
                    placeholder="e.g. University students, software engineers, doctors..."
                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    What is the real problem? (Problem Statement):
                  </label>
                  <textarea
                    rows={3}
                    value={userInnovation.problemDescription}
                    onChange={(e) => setUserInnovation({ ...userInnovation, problemDescription: e.target.value })}
                    placeholder="e.g. Students struggle to receive personalized feedback while preparing for coding interviews without expensive tutors..."
                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveProblemAndProceed}
                  className="w-full bg-[#181924] hover:bg-[#6875E8] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-subtle"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A0E8A7]" />
                  <span>Save Problem & Proceed to Step 02: Research</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Step 3 - Solution Definition */}
            <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED5] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-[#059669] text-white text-[10px] font-mono font-bold uppercase">
                    Step 03: Solution
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7082]">
                    Stage 03 Focus
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    How does your innovation solve it? (Solution Concept):
                  </label>
                  <textarea
                    rows={3}
                    value={userInnovation.solutionDescription}
                    onChange={(e) => setUserInnovation({ ...userInnovation, solutionDescription: e.target.value })}
                    placeholder="e.g. An AI-powered mock interview simulator that asks behavioral questions via voice and scores answers against STAR methodology..."
                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    Unique Value Proposition (USP):
                  </label>
                  <input
                    type="text"
                    value={userInnovation.valueProposition}
                    onChange={(e) => setUserInnovation({ ...userInnovation, valueProposition: e.target.value })}
                    placeholder="e.g. Instant STAR-rubric feedback in under 5 seconds with zero tutor fees."
                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSolutionAndProceed}
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-subtle"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Save Solution & Proceed to Step 04: Validation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. MAIN VERTICAL ROADMAP (20 EXPANDABLE STAGES) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
              Innovation Lifecycle Stages ({filteredStages.length})
            </h2>
            <div className="text-xs font-mono text-[#6E7082]">
              Level Mode: <span className="font-bold text-[#6875E8] uppercase">{learningLevel}</span>
            </div>
          </div>

          {filteredStages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DED5] space-y-3">
              <HelpCircle className="w-8 h-8 text-[#8E90A2] mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#181924]">No Stages Match "{searchQuery}"</h3>
              <p className="text-xs text-[#6E7082]">Try searching for terms like "Database", "RLS", "API", or "Gemini".</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('all'); }}
                className="bg-[#181924] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStages.map((stage) => {
                const isExpanded = expandedStageId === stage.id;
                const isDone = isStageCompleted(stage);
                const isInProg = isStageInProgress(stage);
                const stageCheckedList = checkedItems[stage.id] || [];

                return (
                  <div
                    key={stage.id}
                    id={`stage-${stage.id}`}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isDone 
                        ? 'border-[#10B981]/40 shadow-subtle' 
                        : isExpanded
                        ? 'border-[#6875E8] shadow-md ring-1 ring-[#6875E8]/20'
                        : 'border-[#E3DED5] hover:border-[#6875E8]/50'
                    }`}
                  >
                    
                    {/* Stage Header Accordion Toggle */}
                    <div
                      onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                      className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-[#FAF8F3] transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        
                        {/* Status Icon */}
                        <div className="mt-0.5 sm:mt-0">
                          {isDone ? (
                            <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          ) : isInProg ? (
                            <div className="w-8 h-8 rounded-full bg-[#D97706]/10 border border-[#D97706]/40 flex items-center justify-center text-[#D97706]">
                              <Clock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#F0ECE1] border border-[#E3DED5] flex items-center justify-center text-[#8E90A2] font-mono text-xs font-bold">
                              {stage.id.toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>

                        {/* Title & Goal */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6875E8] bg-[#6875E8]/10 px-2 py-0.5 rounded">
                              {stage.categoryLabel}
                            </span>
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#181924]">
                              {stage.title}
                            </h3>
                            {isDone && (
                              <span className="text-[10px] font-mono font-bold text-[#059669] bg-[#10B981]/10 px-2 py-0.5 rounded flex items-center gap-1">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[#555768] line-clamp-1">
                            {stage.goal}
                          </p>
                        </div>
                      </div>

                      {/* Right Indicator & Expand Arrow */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline-block text-[11px] font-mono text-[#8E90A2]">
                          {stageCheckedList.length}/{stage.checklist.length} tasks
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-[#F7F4EE] border border-[#E3DED5] flex items-center justify-center text-[#6E7082]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Stage Expanded Details Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[#E3DED5] bg-[#FCFBF8] p-5 sm:p-8 space-y-8"
                        >
                          
                          {/* 1. What is this? & Why is it important? */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="bg-white p-5 rounded-xl border border-[#E3DED5] space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#6875E8] uppercase">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>1. What is this stage?</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[#20202A] leading-relaxed">
                                {stage.whatIsIt[learningLevel]}
                              </p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-[#E3DED5] space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#D97706] uppercase">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>2. Why is it important?</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[#20202A] leading-relaxed">
                                {stage.whyImportant}
                              </p>
                            </div>

                          </div>

                          {/* 2. What to learn & What to do */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* What to learn */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-mono font-bold text-[#181924] uppercase tracking-wider flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-[#6875E8]" />
                                <span>3. Concepts to Learn</span>
                              </h4>
                              <ul className="space-y-2">
                                {stage.whatToLearn.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-[#404252] bg-white p-2.5 rounded-lg border border-[#E3DED5]">
                                    <span className="text-[#6875E8] font-mono font-bold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* What to do */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-mono font-bold text-[#181924] uppercase tracking-wider flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-[#10B981]" />
                                <span>4. Action Steps to Execute</span>
                              </h4>
                              <ul className="space-y-2">
                                {stage.whatToDo.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-[#404252] bg-white p-2.5 rounded-lg border border-[#E3DED5]">
                                    <span className="font-mono font-bold text-[#059669]">{i+1}.</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>

                          {/* 3. Real-World Example (Bad vs Good) */}
                          <div className="bg-white p-5 rounded-xl border border-[#E3DED5] space-y-3">
                            <h4 className="text-xs font-mono font-bold text-[#181924] uppercase tracking-wider">
                              5. Real-World Example Breakdown
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-[#FFF5F5] p-3.5 rounded-lg border border-[#FED7D7] space-y-1">
                                <span className="text-[10px] font-mono font-bold text-[#E53E3E] uppercase flex items-center gap-1">
                                  ❌ Ineffective Approach:
                                </span>
                                <p className="text-xs text-[#742A2A] italic">"{stage.example.bad}"</p>
                              </div>

                              <div className="bg-[#F0FFF4] p-3.5 rounded-lg border border-[#C6F6D5] space-y-1">
                                <span className="text-[10px] font-mono font-bold text-[#22543D] uppercase flex items-center gap-1">
                                  ✅ Recommended Approach:
                                </span>
                                <p className="text-xs text-[#22543D] font-medium">"{stage.example.good}"</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-[#6E7082] italic pt-1">
                              <strong>Key takeaway:</strong> {stage.example.explanation}
                            </p>
                          </div>

                          {/* 4. INNOVEXA Connection & Recommended Tools */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Connection */}
                            <div className="md:col-span-2 bg-[#F3F0FF] p-5 rounded-xl border border-[#D6BCFA] space-y-2">
                              <span className="text-[11px] font-mono font-bold text-[#6875E8] uppercase flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Where INNOVEXA uses this:
                              </span>
                              <p className="text-xs text-[#3C366B] leading-relaxed">
                                {stage.innovexaConnection}
                              </p>
                            </div>

                            {/* Tools */}
                            <div className="bg-white p-5 rounded-xl border border-[#E3DED5] space-y-2">
                              <span className="text-[11px] font-mono font-bold text-[#181924] uppercase flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-[#6E7082]" />
                                6. Tools to Use:
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {stage.tools.map((t, idx) => (
                                  <span key={idx} className="px-2 py-1 rounded bg-[#F7F4EE] border border-[#E3DED5] text-[11px] font-mono text-[#181924] font-medium">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* 5. Common Mistakes */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold text-[#E53E3E] uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#E53E3E]" />
                              <span>Common Mistakes to Avoid</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {stage.commonMistakes.map((m, idx) => (
                                <div key={idx} className="bg-white p-3.5 rounded-lg border border-[#E3DED5] space-y-1">
                                  <div className="text-xs font-bold text-[#C53030] flex items-center gap-1">
                                    <span>❌ {m.mistake}</span>
                                  </div>
                                  <div className="text-xs text-[#2F855A] font-medium pl-4">
                                    <span>↳ Fix: {m.fix}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── SPECIAL INTERACTIVE WORKSHOP FOR STAGE 1: INPUT PROBLEM STATEMENT ── */}
                          {stage.id === 1 && (
                            <div className="bg-gradient-to-br from-[#FAF8F3] to-white p-5 sm:p-6 rounded-2xl border-2 border-[#6875E8]/30 shadow-subtle space-y-4">
                              <div className="flex items-center justify-between border-b border-[#E3DED5] pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#6875E8] text-white text-xs font-mono font-bold flex items-center justify-center">
                                    01
                                  </span>
                                  <h4 className="font-serif text-lg font-bold text-[#181924]">
                                    Interactive Problem Statement Workshop
                                  </h4>
                                </div>
                                <span className="text-[11px] font-mono text-[#6875E8] font-bold">
                                  Step 1 of Innovation Journey
                                </span>
                              </div>

                              <p className="text-xs text-[#555768]">
                                Formulate your problem statement directly below. Saving it will complete Stage 01 and automatically unlock Step 02 (User & Market Research).
                              </p>

                              <div className="space-y-3 pt-1">
                                <div className="space-y-1">
                                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                                    Who experiences this friction? (Target User)
                                  </label>
                                  <input
                                    type="text"
                                    value={userInnovation.targetAudience}
                                    onChange={(e) => setUserInnovation({ ...userInnovation, targetAudience: e.target.value })}
                                    placeholder="e.g. University students preparing for coding interviews..."
                                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                                    What is the exact problem they face? (1–2 Sentences)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={userInnovation.problemDescription}
                                    onChange={(e) => setUserInnovation({ ...userInnovation, problemDescription: e.target.value })}
                                    placeholder="e.g. Students struggle to receive personalized, structured feedback on their mock interview answers without paying expensive private tutors..."
                                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] leading-relaxed"
                                  />
                                </div>
                              </div>

                              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <span className="text-[11px] font-mono text-[#6E7082]">
                                  {userInnovation.problemDescription.trim().length > 0 ? '✓ Problem drafted' : 'Write problem above to proceed'}
                                </span>

                                <button
                                  type="button"
                                  onClick={handleSaveProblemAndProceed}
                                  className="bg-[#6875E8] hover:bg-[#5764D6] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-subtle"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#A0E8A7]" />
                                  <span>Save Problem & Proceed to Step 02: Research</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── SPECIAL INTERACTIVE WORKSHOP FOR STAGE 3: INPUT SOLUTION DEFINITION ── */}
                          {stage.id === 3 && (
                            <div className="bg-gradient-to-br from-[#FAF8F3] to-white p-5 sm:p-6 rounded-2xl border-2 border-[#6875E8]/30 shadow-subtle space-y-4">
                              <div className="flex items-center justify-between border-b border-[#E3DED5] pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#6875E8] text-white text-xs font-mono font-bold flex items-center justify-center">
                                    03
                                  </span>
                                  <h4 className="font-serif text-lg font-bold text-[#181924]">
                                    Interactive Solution Concept Workshop
                                  </h4>
                                </div>
                                <span className="text-[11px] font-mono text-[#6875E8] font-bold">
                                  Step 3 of Innovation Journey
                                </span>
                              </div>

                              <p className="text-xs text-[#555768]">
                                Turn your validated problem into a clear solution definition. Saving it will complete Stage 03 and unlock Step 04 (Validate Before Building).
                              </p>

                              <div className="space-y-3 pt-1">
                                <div className="space-y-1">
                                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                                    How does your innovation solve this problem? (Solution Description)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={userInnovation.solutionDescription}
                                    onChange={(e) => setUserInnovation({ ...userInnovation, solutionDescription: e.target.value })}
                                    placeholder="e.g. An AI-powered mock interview simulator that asks behavioral questions via voice, transcribes responses in real time, and scores clarity and structure against STAR methodology..."
                                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] leading-relaxed"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                                    Unique Value Proposition (USP / Core Advantage)
                                  </label>
                                  <input
                                    type="text"
                                    value={userInnovation.valueProposition}
                                    onChange={(e) => setUserInnovation({ ...userInnovation, valueProposition: e.target.value })}
                                    placeholder="e.g. Cuts interview prep time from 40 hours to 10 hours with instant AI STAR scoring."
                                    className="w-full bg-white text-xs text-[#181924] p-3 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                                  />
                                </div>
                              </div>

                              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <span className="text-[11px] font-mono text-[#6E7082]">
                                  {userInnovation.solutionDescription.trim().length > 0 ? '✓ Solution drafted' : 'Write solution above to proceed'}
                                </span>

                                <button
                                  type="button"
                                  onClick={handleSaveSolutionAndProceed}
                                  className="bg-[#6875E8] hover:bg-[#5764D6] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-subtle"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#A0E8A7]" />
                                  <span>Save Solution & Proceed to Step 04: Validation</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 6. Interactive Checklist & Practical Task */}
                          <div className="bg-[#FAF8F3] p-5 sm:p-6 rounded-2xl border border-[#E3DED5] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="font-serif text-base sm:text-lg font-bold text-[#181924]">
                                  Stage Checklist & Practical Task
                                </h4>
                                <p className="text-xs text-[#6E7082]">
                                  <strong>Task:</strong> {stage.practicalTask}
                                </p>
                              </div>
                              <div className="text-xs font-mono font-bold text-[#6875E8]">
                                Expected Output: <span className="text-[#181924] font-normal">{stage.expectedOutput}</span>
                              </div>
                            </div>

                            {/* Checklist items */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                              {stage.checklist.map((item) => {
                                const isChecked = stageCheckedList.includes(item.id);
                                return (
                                  <label
                                    key={item.id}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                      isChecked
                                        ? 'bg-[#F0FFF4] border-[#10B981]/40 text-[#22543D]'
                                        : 'bg-white border-[#E3DED5] hover:border-[#6875E8] text-[#20202A]'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleChecklistItem(stage.id, item.id)}
                                      className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                                      isChecked ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-[#A0A2B4] bg-white'
                                    }`}>
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span className={`text-xs ${isChecked ? 'line-through opacity-80' : 'font-medium'}`}>
                                      {item.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>

                            {/* Action Buttons & Stage Complete Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E3DED5]">
                              
                              <button
                                onClick={() => toggleStageCompletion(stage)}
                                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                                  isDone
                                    ? 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/40 hover:bg-[#10B981]/20'
                                    : 'bg-[#181924] text-white hover:bg-[#2A2B3C] shadow-subtle'
                                }`}
                              >
                                {isDone ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                                    <span>✓ Stage Completed (Click to Reset)</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckSquare className="w-4 h-4" />
                                    <span>Mark Stage {stage.id} as Complete</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleActionClick(stage.actionButton.route)}
                                className="bg-[#6875E8] hover:bg-[#5764D6] text-white px-5 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                              >
                                <span>{stage.actionButton.label}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                            </div>

                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. CONCEPT LIBRARY SECTION (26 EXPANDABLE CARDS) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6875E8]">
                KNOWLEDGE BASE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                Important Innovation Concepts ({filteredConcepts.length})
              </h2>
              <p className="text-xs sm:text-sm text-[#6E7082]">
                Click any concept card to view beginner, intermediate, and advanced architectural explanations.
              </p>
            </div>

            <span className="text-xs font-mono text-[#8E90A2]">
              Showing {filteredConcepts.length} of 26 concepts
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
            {filteredConcepts.map(concept => (
              <div
                key={concept.id}
                onClick={() => setSelectedConcept(concept)}
                className="bg-[#FCFBF8] hover:bg-white p-4 rounded-xl border border-[#E3DED5] hover:border-[#6875E8] transition-all cursor-pointer shadow-subtle hover:shadow-md flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#6875E8]/10 text-[#6875E8]">
                      {concept.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#8E90A2] group-hover:text-[#6875E8]">
                      Stages: {concept.relatedStages.join(', ')}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#181924] group-hover:text-[#6875E8] transition-colors">
                    {concept.name}
                  </h4>
                  <p className="text-xs text-[#555768] line-clamp-2 leading-relaxed">
                    {concept.definition}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#6875E8] font-bold pt-2 border-t border-[#E3DED5]/60">
                  <span>Learn Concept</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. TOOLS YOU WILL USE SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
          
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97706]">
              TOOLING ECOSYSTEM
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
              Tools You Will Use
            </h2>
            <p className="text-xs sm:text-sm text-[#6E7082]">
              The modern tech stack that powers INNOVEXA and modern web software.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {TOOLS_DIRECTORY.map(tool => (
              <div
                key={tool.id}
                className="bg-[#FCFBF8] p-5 rounded-xl border border-[#E3DED5] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#181924] text-white text-[10px] font-mono font-bold">
                      {tool.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#8E90A2]">
                      {tool.category}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#181924]">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-[#555768] leading-relaxed">
                    <strong>What it is:</strong> {tool.whatItIs}
                  </p>
                  <p className="text-xs text-[#555768] leading-relaxed">
                    <strong>Why used:</strong> {tool.whyUsed}
                  </p>
                </div>

                <div className="bg-[#F3F0FF] p-2.5 rounded-lg border border-[#E9D8FD] text-[11px] text-[#553C9A] font-medium">
                  <strong>In INNOVEXA:</strong> {tool.innovexaRole}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. CONCEPT EXPLANATION MODAL / DRAWER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedConcept && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E3DED5] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6875E8]/10 text-[#6875E8] text-xs font-mono font-bold uppercase">
                    {selectedConcept.category}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                    {selectedConcept.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedConcept(null)}
                  className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-[#E3DED5] text-[#181924] flex items-center justify-center font-mono text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5] text-xs sm:text-sm text-[#20202A] leading-relaxed">
                <strong>Definition:</strong> {selectedConcept.definition}
              </div>

              {/* Learning Level Tabs inside modal */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E3DED5] pb-2">
                  <span className="text-xs font-mono text-[#8E90A2] font-semibold uppercase">Explanation Depth:</span>
                  {(['beginner', 'intermediate', 'advanced'] as LearningLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLearningLevel(lvl)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                        learningLevel === lvl
                          ? 'bg-[#181924] text-white'
                          : 'text-[#6E7082] hover:text-[#181924]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#20202A] leading-relaxed bg-white p-4 rounded-xl border border-[#E3DED5]">
                  {selectedConcept.detailedExplanation[learningLevel]}
                </p>
              </div>

              {/* Code or Diagram if present */}
              {selectedConcept.codeOrDiagram && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#8E90A2] font-semibold uppercase">Pattern / Blueprint:</span>
                  <pre className="bg-[#181924] text-[#A0E8A7] p-3.5 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {selectedConcept.codeOrDiagram}
                  </pre>
                </div>
              )}

              {/* INNOVEXA Usage */}
              <div className="bg-[#F3F0FF] p-4 rounded-xl border border-[#D6BCFA] space-y-1">
                <span className="text-xs font-mono font-bold text-[#6875E8] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Where INNOVEXA uses this:
                </span>
                <p className="text-xs text-[#3C366B] leading-relaxed">
                  {selectedConcept.innovexaUsage}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedConcept(null)}
                  className="bg-[#181924] hover:bg-[#2D2E3F] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold"
                >
                  Close Concept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
