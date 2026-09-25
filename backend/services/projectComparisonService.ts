import { Project, ProjectUniquenessReport, SimilarSolutionComparison } from '../types/database';
import { OPEN_SOURCE_TOOLS, COMPARISON_PAIRS, OpenSourceTool } from '../data/openSourceDirectory';
import { SEED_PROJECTS } from '../data/seedData';

// SaaS market competitors dictionary
const SAAS_MARKET_BENCHMARKS: Record<string, {
  name: string;
  category: string;
  description: string;
  weaknesses: string[];
  differentiationPlaybook: string;
}> = {
  'Education': {
    name: 'Canvas / Blackboard LMS',
    category: 'Education',
    description: 'Traditional enterprise academic management systems used by universities for grading and submissions.',
    weaknesses: ['Rigid legacy UI', 'Zero personalized cognitive pacing', 'No automated syllabus-to-task parsing', 'High institutional cost'],
    differentiationPlaybook: 'Position as a student-first autonomous companion with fatigue-aware spaced revision algorithms.'
  },
  'Productivity': {
    name: 'Notion / Todoist',
    category: 'Productivity',
    description: 'General-purpose workspace and task checklists relying on heavy manual setup.',
    weaknesses: ['Manual setup overload', 'No automated domain intelligence', 'No built-in peer verification network', 'Vendor lock-in'],
    differentiationPlaybook: 'Deliver pre-structured autonomous workflows with domain-specific AI accelerators instead of blank-canvas documents.'
  },
  'Technology': {
    name: 'Firebase / Supabase Cloud',
    category: 'Technology',
    description: 'Managed backend-as-a-service clouds for rapid web application development.',
    weaknesses: ['Pricing escalates at scale', 'Vendor API lock-in', 'Limited specialized vector graph routing', 'Cloud egress fees'],
    differentiationPlaybook: 'Emphasize 100% self-hostable zero-egress architecture with local AI model execution and pgvector privacy.'
  },
  'Artificial Intelligence': {
    name: 'OpenAI API / Custom GPTs',
    category: 'Artificial Intelligence',
    description: 'Proprietary hosted LLM endpoints with per-token pricing and closed model weights.',
    weaknesses: ['High recurring token bills', 'Data privacy & compliance concerns', 'No offline execution', 'Subject to vendor rate limits'],
    differentiationPlaybook: 'Integrate hybrid local Ollama/vLLM fallbacks with deterministic RAG verification and zero telemetry leaks.'
  },
  'Sustainability': {
    name: 'Too Good To Go / Olio',
    category: 'Sustainability',
    description: 'Commercial surplus food recovery marketplaces with manual merchant listing requirements.',
    weaknesses: ['Manual merchant inventory entry', 'High platform commission fees', 'Limited rural or hyper-local radius', 'No automated POS sync'],
    differentiationPlaybook: 'Provide one-tap POS hardware hooks and automated micro-distribution routing with decentralized community verification.'
  },
  'Healthcare': {
    name: 'MyChart / Epic Systems',
    category: 'Healthcare',
    description: 'Hospital patient portal systems with siloed institutional databases.',
    weaknesses: ['Interoperability barriers', 'Poor user experience', 'Patient data ownership friction', 'Zero proactive wellness intelligence'],
    differentiationPlaybook: 'Adopt encrypted local-first patient health records with cryptographic audit trails and consent-based sharing.'
  },
  'Finance': {
    name: 'QuickBooks / Stripe Billing',
    category: 'Finance',
    description: 'Proprietary accounting and global payments infrastructure with recurring subscription overhead.',
    weaknesses: ['2.9% + 30¢ transaction tax', 'Opaque dispute processes', 'Limited multi-currency crypto rails', 'Complex onboarding'],
    differentiationPlaybook: 'Offer non-custodial open ledger transparency with zero platform cuts and automated escrow smart settlements.'
  }
};

/**
 * Intelligent comparator that evaluates a submitted or drafting project,
 * matches existing market solutions, and crafts uniqueness strategies.
 */
export function generateProjectUniquenessReport(
  project: Partial<Project>,
  workspaceProjects: Project[] = SEED_PROJECTS
): ProjectUniquenessReport {
  const title = project.title || 'Untitled Innovation';
  const category = project.category || 'Technology';
  const problem = (project.problem_description || project.problem_title || '').toLowerCase();
  const solution = (project.solution_description || project.value_proposition || '').toLowerCase();
  const combinedText = `${title.toLowerCase()} ${category.toLowerCase()} ${problem} ${solution} ${(project.tags || []).join(' ').toLowerCase()}`;

  const matchedSolutions: SimilarSolutionComparison[] = [];

  // 1. Check workspace projects (excluding self)
  const similarWorkspace = workspaceProjects
    .filter(p => p.id !== project.id && (p.category === category || p.tags.some(t => combinedText.includes(t.toLowerCase()))))
    .slice(0, 2);

  similarWorkspace.forEach(wp => {
    matchedSolutions.push({
      id: `sim-wp-${wp.id}`,
      name: wp.title,
      type: 'workspace_project',
      category: wp.category,
      description: wp.solution_description,
      similarityReason: `Addresses the "${wp.category}" domain with similar target audience focus on ${wp.target_audience || 'active users'}.`,
      sharedCapabilities: [
        'Shared problem domain in ' + wp.category,
        'Community peer review validation',
        'Direct student/innovator user focus'
      ],
      limitations: [
        'Focuses primarily on ' + wp.problem_title.slice(0, 45) + '...',
        'Version ' + wp.current_version + ' baseline'
      ],
      uniquenessAngle: `Differentiate by providing specialized depth on ${project.value_proposition || 'automated real-time execution'} rather than general scope.`,
      recommendedMoat: 'Niche down on rapid proof-of-work validation and proactive intelligence.',
      comparisonScores: [
        { feature: 'Core Target Focus', yourProject: project.target_audience || 'Specialized Segments', competitor: wp.target_audience || 'Broader Cohort', advantage: 'your_project' },
        { feature: 'Differentiation Depth', yourProject: project.differentiation || 'High Specialization', competitor: wp.differentiation || 'General Scope', advantage: 'your_project' },
        { feature: 'Deployment Model', yourProject: 'Open Modular Stack', competitor: 'Community Standard', advantage: 'neutral' }
      ]
    });
  });

  // 2. Check Open Source Directory for technical overlap
  const relevantOsTools = OPEN_SOURCE_TOOLS.filter(t => 
    t.category.toLowerCase().includes(category.toLowerCase()) || 
    combinedText.includes(t.name.toLowerCase()) ||
    t.description.toLowerCase().split(' ').some(w => w.length > 5 && combinedText.includes(w))
  ).slice(0, 2);

  relevantOsTools.forEach(os => {
    matchedSolutions.push({
      id: `sim-os-${os.id}`,
      name: `${os.name} (Open Source)`,
      type: 'open_source',
      category: os.category,
      description: os.description,
      similarityReason: `Provides foundational ${os.category} capabilities via self-hosted ${os.primaryLanguage} architecture.`,
      sharedCapabilities: [
        'Self-hosted privacy architecture',
        'Developer API & SDK tooling',
        'High GitHub community adoption (★ ' + os.stars + ')'
      ],
      limitations: [
        'Requires manual developer configuration & ops management',
        'No end-user consumer frontend workflow',
        'Lacks domain-specific AI logic out-of-the-box'
      ],
      uniquenessAngle: `Leverage ${os.name} as an underlying infrastructure primitive while building a turnkey consumer UX tailored specifically for ${title}.`,
      recommendedMoat: `Package ${os.name} behind an intuitive, zero-configuration application wrapper that non-technical users love.`,
      comparisonScores: [
        { feature: 'Ease of Use & UX', yourProject: 'Turnkey Tailored UI', competitor: 'Developer CLI / Raw API', advantage: 'your_project' },
        { feature: 'Cost / Open Source', yourProject: '100% Free / Self-Hostable', competitor: os.license + ' Licensed', advantage: 'neutral' },
        { feature: 'Domain Customization', yourProject: 'Built for ' + category, competitor: 'General Infrastructure', advantage: 'your_project' }
      ]
    });
  });

  // 3. Check SaaS Benchmark
  const saasBenchmark = SAAS_MARKET_BENCHMARKS[category] || SAAS_MARKET_BENCHMARKS['Technology'];
  if (saasBenchmark && matchedSolutions.length < 3) {
    matchedSolutions.push({
      id: `sim-saas-${saasBenchmark.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${saasBenchmark.name} (Commercial SaaS)`,
      type: 'saas_competitor',
      category: saasBenchmark.category,
      description: saasBenchmark.description,
      similarityReason: `Standard market incumbent serving the broader ${saasBenchmark.category} space with commercial SaaS pricing.`,
      sharedCapabilities: [
        'Established brand awareness & enterprise market share',
        'Extensive third-party integrations',
        'Full cloud synchronization'
      ],
      limitations: saasBenchmark.weaknesses,
      uniquenessAngle: saasBenchmark.differentiationPlaybook,
      recommendedMoat: `Offer full data sovereignty, zero platform markups, and transparent community-driven innovation.`,
      comparisonScores: [
        { feature: 'Pricing & TCO', yourProject: 'Zero Lock-in / Free Tier', competitor: 'High Recurring Subscription', advantage: 'your_project' },
        { feature: 'Data Privacy & Control', yourProject: 'Local First / Encrypted', competitor: 'Proprietary Cloud Silo', advantage: 'your_project' },
        { feature: 'Adaptive Intelligence', yourProject: 'Tailored AI Workflows', competitor: 'Generic Rigid Features', advantage: 'your_project' }
      ]
    });
  }

  // Calculate Uniqueness Metrics
  const hasStrongDifferentiation = Boolean(project.differentiation && project.differentiation.length > 30);
  const hasUvp = Boolean(project.value_proposition && project.value_proposition.length > 20);
  const uniquenessScore = Math.min(
    96,
    Math.max(62, (hasStrongDifferentiation ? 35 : 15) + (hasUvp ? 25 : 10) + (matchedSolutions.length <= 2 ? 30 : 20))
  );

  const crowdedness: 'Low' | 'Moderate' | 'High' = 
    matchedSolutions.length >= 3 ? 'Moderate' : 'Low';

  const differentiatorStrategies = [
    {
      title: 'Hyper-Specific Vertical Specialization',
      badge: 'HIGH IMPACT',
      description: `Rather than building a broad ${category} tool, tailor your workflows around the exact friction point: "${project.problem_title || 'the core user bottleneck'}".`,
      actionableHook: `Target the top 20% most underserved power users in ${project.target_audience || 'your domain'} before expanding.`
    },
    {
      title: 'Open Source & Data Sovereignty Advantage',
      badge: 'COST MOAT',
      description: `Compete against proprietary alternatives by enabling self-hosting, transparent logic, and zero-egress data privacy.`,
      actionableHook: `Guarantee that user data never gets ingested into third-party public AI training models.`
    },
    {
      title: 'Proactive AI Copilots over Reactive Dashboards',
      badge: '10X UX WEDGE',
      description: `Existing solutions require users to manually type and organize everything. Make ${title} do the heavy cognitive lifting automatically.`,
      actionableHook: `Introduce autonomous multi-step background synthesis so users see actionable results in 1 click.`
    }
  ];

  const comparisonMatrix = [
    {
      dimension: 'Core Philosophy',
      yourInnovation: `${title}: Focused, domain-tailored workflow designed for ${project.target_audience || 'specialized users'}.`,
      existingSolutions: 'Generic, complex all-in-one software with steep learning curves and feature bloat.',
      whyYoursWins: 'Zero friction onboarding with immediate time-to-value.'
    },
    {
      dimension: 'Pricing & Lock-In',
      yourInnovation: 'Transparent, community-driven, self-hostable with zero predatory price tiers.',
      existingSolutions: 'Expensive per-seat subscriptions with paywalled essential features.',
      whyYoursWins: '70%–90% lower Total Cost of Ownership (TCO).'
    },
    {
      dimension: 'Intelligence & Pacing',
      yourInnovation: `${project.differentiation || 'Automated cognitive synthesis and proactive notifications.'}`,
      existingSolutions: 'Manual inputs and passive notification dumps.',
      whyYoursWins: 'Saves 3–5 hours per week of repetitive manual overhead.'
    },
    {
      dimension: 'Extensibility & Privacy',
      yourInnovation: 'Modular open standards (pgvector, FastAPI, Next.js 15) with local AI fallback.',
      existingSolutions: 'Closed-source walled gardens that restrict data export and custom models.',
      whyYoursWins: 'Full ownership and auditability of your business logic.'
    }
  ];

  return {
    projectTitle: title,
    category,
    similarSolutionsCount: matchedSolutions.length,
    marketCrowdedness: crowdedness,
    overallUniquenessScore: uniquenessScore,
    executiveMessage: `We analyzed "${title}" against ${matchedSolutions.length} existing market solutions in ${category}. While existing solutions cover generic baseline needs, your core opportunity is to dominate on ${project.value_proposition || 'automated workflows, privacy, and specialized UX'}.`,
    similarSolutions: matchedSolutions,
    differentiatorStrategies,
    comparisonMatrix
  };
}
