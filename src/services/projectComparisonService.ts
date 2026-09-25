import { Project, Review, ProjectUniquenessReport, SimilarSolutionComparison } from '../types/database';
import { OPEN_SOURCE_TOOLS } from '../data/openSourceDirectory';
import { SEED_PROJECTS, SEED_REVIEWS } from '../data/seedData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface ProjectComparisonItem {
  project: Project;
  votes: {
    upvotes: number;
    downvotes: number;
    netScore: number;
  };
  reviews: Review[];
  reviewsCount: number;
  positivePercentage: number | null;
  neutralPercentage: number | null;
  negativePercentage: number | null;
  hasEnoughReviewData: boolean;
  features: string[];
}

export interface AIComparisonCriteria {
  name: string;
  projects: {
    project_id: string;
    analysis: string;
  }[];
}

export interface AIComparisonResult {
  comparison_summary: string;
  criteria: AIComparisonCriteria[];
  common_points: string[];
  differences: {
    project_id: string;
    point: string;
  }[];
  potential_gaps: string[];
  additional_observations: string[];
}

export interface ProjectComparisonReport {
  projects: ProjectComparisonItem[];
  commonFeatures: string[];
  uniqueFeatures: {
    projectId: string;
    projectTitle: string;
    features: string[];
  }[];
  aiAnalysis: AIComparisonResult | null;
  aiError: string | null;
  hasEnoughCommunityData: boolean;
  createdAt: string;
}

/**
 * Calculates review sentiment percentages strictly from associated reviews.
 */
export function calculateReviewSentiment(reviews: Review[]): {
  positivePercentage: number | null;
  neutralPercentage: number | null;
  negativePercentage: number | null;
  hasEnoughData: boolean;
} {
  if (!reviews || reviews.length === 0) {
    return {
      positivePercentage: null,
      neutralPercentage: null,
      negativePercentage: null,
      hasEnoughData: false
    };
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  reviews.forEach(r => {
    // Determine sentiment based on review ratings and type
    const isHighRelevance = r.problem_relevance === 'yes';
    const isHighClarity = r.solution_clarity === 'yes';
    const isHighUsefulness = r.usefulness === 'yes';
    const isPraise = r.review_type === 'praise';

    const isLowRelevance = r.problem_relevance === 'no';
    const isLowClarity = r.solution_clarity === 'no';
    const isLowUsefulness = r.usefulness === 'no';

    if (isPraise || (isHighRelevance && isHighClarity && isHighUsefulness)) {
      positiveCount++;
    } else if (isLowUsefulness && (isLowRelevance || isLowClarity)) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const total = reviews.length;
  return {
    positivePercentage: Math.round((positiveCount / total) * 100),
    neutralPercentage: Math.round((neutralCount / total) * 100),
    negativePercentage: Math.round((negativeCount / total) * 100),
    hasEnoughData: true
  };
}

/**
 * Extracts distinct concrete features from project specifications.
 */
export function extractProjectFeatures(project: Project): string[] {
  const features: string[] = [];

  // Split value proposition or differentiation into clear points if available
  if (project.differentiation) {
    const diffSentences = project.differentiation
      .split(/(?<=[.?!])\s+|;\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 8 && s.length < 120);
    features.push(...diffSentences.slice(0, 3));
  }

  if (project.value_proposition && features.length < 4) {
    const vpSentences = project.value_proposition
      .split(/(?<=[.?!])\s+|;\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 8 && s.length < 120);
    features.push(...vpSentences.slice(0, 2));
  }

  // Include top project tags as functional capabilities
  if (project.tags && project.tags.length > 0) {
    project.tags.slice(0, 4).forEach(t => {
      const formattedTag = t.charAt(0).toUpperCase() + t.slice(1);
      if (!features.some(f => f.toLowerCase().includes(t.toLowerCase()))) {
        features.push(formattedTag);
      }
    });
  }

  return Array.from(new Set(features)).slice(0, 6);
}

/**
 * Generates deterministic grounded AI fallback insights when Gemini is offline.
 */
function generateDeterministicComparisonInsights(items: ProjectComparisonItem[]): AIComparisonResult {
  const criteria: AIComparisonCriteria[] = [
    {
      name: 'Problem Addressed',
      projects: items.map(item => ({
        project_id: item.project.id,
        analysis: item.project.problem_description || item.project.problem_title || 'Focuses on domain friction in ' + item.project.category
      }))
    },
    {
      name: 'Proposed Solution & Mechanism',
      projects: items.map(item => ({
        project_id: item.project.id,
        analysis: item.project.solution_description || item.project.value_proposition || 'Implements tailored architecture for ' + item.project.category
      }))
    },
    {
      name: 'Target Audience & User Segment',
      projects: items.map(item => ({
        project_id: item.project.id,
        analysis: item.project.target_audience || 'Specialized users in ' + item.project.category
      }))
    },
    {
      name: 'Differentiation & Competitive Angle',
      projects: items.map(item => ({
        project_id: item.project.id,
        analysis: item.project.differentiation || 'Emphasizes direct execution and specialized workflow.'
      }))
    }
  ];

  // Calculate common points
  const allCategories = Array.from(new Set(items.map(i => i.project.category)));
  const commonPoints: string[] = [];
  if (allCategories.length === 1) {
    commonPoints.push(`Both projects operate within the ${allCategories[0]} innovation ecosystem.`);
  } else {
    commonPoints.push(`Projects span diverse focus domains (${allCategories.join(', ')}).`);
  }

  // Check common tags
  const tagSets = items.map(i => new Set(i.project.tags.map(t => t.toLowerCase())));
  const commonTags = (items[0]?.project.tags || []).filter(t => 
    tagSets.every(set => set.has(t.toLowerCase()))
  );
  if (commonTags.length > 0) {
    commonPoints.push(`Shared technical or thematic tags: ${commonTags.join(', ')}.`);
  }
  commonPoints.push('Both projects support open community validation and peer reviews.');

  const differences = items.map(item => ({
    project_id: item.project.id,
    point: `"${item.project.title}" targets ${item.project.target_audience || 'its core cohort'} with a ${item.project.project_type} focus.`
  }));

  const potentialGaps = [
    'Cross-platform interoperability across disparate user workflows.',
    'Scalability and long-term data synchronization depending on deployment tier.'
  ];

  const additionalObservations = items.map(item => 
    `"${item.project.title}" maintains a readiness score of ${item.project.readiness_score || 50}% with ${item.votes.upvotes} community upvotes.`
  );

  return {
    comparison_summary: `Comparative evaluation of ${items.map(i => `"${i.project.title}"`).join(' and ')} across problem definition, targeted user segment, architectural solutions, and community metrics.`,
    criteria,
    common_points: commonPoints,
    differences,
    potential_gaps: potentialGaps,
    additional_observations: additionalObservations
  };
}

/**
 * Direct comparison flow:
 * 1. Takes 2 to 4 project IDs
 * 2. Fetches exact projects & real reviews from database (or context cache)
 * 3. Verifies all project IDs exist
 * 4. Preserves 100% individual project identity
 * 5. Synthesizes AI comparison without hallucinating or declaring arbitrary winners
 */
export async function fetchAndBuildComparison(
  projectIds: string[],
  contextProjects: Project[] = [],
  contextReviews: Review[] = []
): Promise<{ report: ProjectComparisonReport | null; error: string | null }> {
  if (!projectIds || projectIds.length < 2) {
    return { report: null, error: 'Select at least 2 projects to compare.' };
  }

  if (projectIds.length > 4) {
    return { report: null, error: 'Compare up to 4 projects at a time.' };
  }

  try {
    let loadedProjects: Project[] = [];
    let loadedReviews: Review[] = [];

    // 1. Fetch exact projects from Supabase if configured
    if (isSupabaseConfigured) {
      const { data: dbProjects, error: pErr } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles(id, full_name, avatar_url, username),
          tags:project_tags(tag),
          signals:innovation_signals(*),
          votes:project_votes(*)
        `)
        .in('id', projectIds);

      if (!pErr && dbProjects && dbProjects.length > 0) {
        loadedProjects = dbProjects.map((p: any) => {
          const upCount = p.votes?.filter((v: any) => v.vote_type === 'up').length || 0;
          const downCount = p.votes?.filter((v: any) => v.vote_type === 'down').length || 0;

          return {
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
            demo_url: p.demo_url,
            cover_image_url: p.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
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
            upvotes_count: upCount,
            downvotes_count: downCount,
            is_demo: false
          };
        });

        // Fetch actual reviews for these exact project IDs
        const { data: dbReviews } = await supabase
          .from('reviews')
          .select('*')
          .in('project_id', projectIds);

        if (dbReviews) {
          loadedReviews = dbReviews;
        }
      }
    }

    // Fallback to context/seed projects for any project not in cloud DB
    const loadedIds = new Set(loadedProjects.map(p => p.id));
    const missingIds = projectIds.filter(id => !loadedIds.has(id));

    if (missingIds.length > 0) {
      let localProjects: Project[] = [];
      try {
        const stored = localStorage.getItem('innovexa_projects_store');
        if (stored) localProjects = JSON.parse(stored);
      } catch (e) {}

      const allAvailableFallback = [...contextProjects, ...localProjects, ...SEED_PROJECTS];
      for (const mid of missingIds) {
        const found = allAvailableFallback.find(p => p.id === mid);
        if (found && !loadedProjects.some(lp => lp.id === found.id)) {
          loadedProjects.push(found);
        }
      }

      // Add matching reviews from context/seed/local
      let localReviews: Review[] = [];
      try {
        const storedRev = localStorage.getItem('innovexa_reviews_store');
        if (storedRev) localReviews = JSON.parse(storedRev);
      } catch (e) {}

      const allAvailableReviews = [...contextReviews, ...localReviews, ...SEED_REVIEWS];
      const matchedFallbackReviews = allAvailableReviews.filter(r => projectIds.includes(r.project_id));
      loadedReviews = [...loadedReviews, ...matchedFallbackReviews];
    }

    // 2. Validate that ALL requested projects exist
    if (loadedProjects.length < projectIds.length) {
      const foundIds = new Set(loadedProjects.map(p => p.id));
      const notFound = projectIds.filter(id => !foundIds.has(id));
      return {
        report: null,
        error: `One or more selected projects (${notFound.length}) could not be loaded from the database.`
      };
    }

    // Preserve the exact order of requested projectIds
    const orderedProjects = projectIds
      .map(id => loadedProjects.find(p => p.id === id)!)
      .filter(Boolean);

    // 3. Build side-by-side ProjectComparisonItems
    const comparisonItems: ProjectComparisonItem[] = orderedProjects.map(p => {
      // Strictly match reviews by review.project_id
      const projectReviews = loadedReviews.filter(r => r.project_id === p.id);
      const sentiment = calculateReviewSentiment(projectReviews);
      const features = extractProjectFeatures(p);

      const upvotes = p.upvotes_count || 0;
      const downvotes = p.downvotes_count || 0;

      return {
        project: p,
        votes: {
          upvotes,
          downvotes,
          netScore: upvotes - downvotes
        },
        reviews: projectReviews,
        reviewsCount: projectReviews.length || p.reviews_count || 0,
        positivePercentage: sentiment.positivePercentage,
        neutralPercentage: sentiment.neutralPercentage,
        negativePercentage: sentiment.negativePercentage,
        hasEnoughReviewData: sentiment.hasEnoughData,
        features
      };
    });

    // 4. Calculate Common Features and Unique Features
    const allFeatureSets = comparisonItems.map(item => 
      new Set(item.features.map(f => f.toLowerCase()))
    );

    const commonFeatures = comparisonItems[0].features.filter(f => 
      allFeatureSets.every(set => set.has(f.toLowerCase()))
    );

    const uniqueFeatures = comparisonItems.map(item => {
      const otherSets = allFeatureSets.filter((_, idx) => idx !== comparisonItems.indexOf(item));
      const specific = item.features.filter(f => 
        !otherSets.some(set => set.has(f.toLowerCase()))
      );
      return {
        projectId: item.project.id,
        projectTitle: item.project.title,
        features: specific.length > 0 ? specific : item.features.slice(0, 3)
      };
    });

    // 5. Trigger Gemini AI Comparison Analysis
    let aiAnalysis: AIComparisonResult | null = null;
    let aiError: string | null = null;

    try {
      const response = await fetch('/api/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: orderedProjects
        })
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.data && resJson.data.criteria) {
          aiAnalysis = resJson.data;
        } else if (resJson.reason === 'no_gemini_key_configured') {
          // Clean fallback when no API key is configured
          aiAnalysis = generateDeterministicComparisonInsights(comparisonItems);
        } else {
          aiError = 'Project data loaded successfully, but AI comparison is temporarily unavailable.';
          aiAnalysis = generateDeterministicComparisonInsights(comparisonItems);
        }
      } else {
        aiError = 'Project data loaded successfully, but AI comparison is temporarily unavailable.';
        aiAnalysis = generateDeterministicComparisonInsights(comparisonItems);
      }
    } catch (e: any) {
      console.warn('AI comparison request failed, using deterministic grounded synthesis:', e);
      aiError = 'Project data loaded successfully, but AI comparison is temporarily unavailable.';
      aiAnalysis = generateDeterministicComparisonInsights(comparisonItems);
    }

    const hasEnoughCommunityData = comparisonItems.some(i => i.hasEnoughReviewData || i.votes.upvotes > 0);

    return {
      report: {
        projects: comparisonItems,
        commonFeatures,
        uniqueFeatures,
        aiAnalysis,
        aiError,
        hasEnoughCommunityData,
        createdAt: new Date().toISOString()
      },
      error: null
    };
  } catch (err: any) {
    console.error('Failed to fetch and build comparison:', err);
    return {
      report: null,
      error: 'Unable to load comparison data. Please try again.'
    };
  }
}

/**
 * Backward-compatible helper for Project Uniqueness & Market Benchmark Report
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

  const similarWorkspace = workspaceProjects
    .filter(p => p.id !== project.id && (p.category === category || (p.tags || []).some(t => combinedText.includes(t.toLowerCase()))))
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
        'Focuses primarily on ' + (wp.problem_title || '').slice(0, 45) + '...',
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

  const hasStrongDifferentiation = Boolean(project.differentiation && project.differentiation.length > 30);
  const hasUvp = Boolean(project.value_proposition && project.value_proposition.length > 20);
  const uniquenessScore = Math.min(
    96,
    Math.max(62, (hasStrongDifferentiation ? 35 : 15) + (hasUvp ? 25 : 10) + (matchedSolutions.length <= 2 ? 30 : 20))
  );

  return {
    projectTitle: title,
    category,
    similarSolutionsCount: matchedSolutions.length,
    marketCrowdedness: matchedSolutions.length >= 3 ? 'Moderate' : 'Low',
    overallUniquenessScore: uniquenessScore,
    executiveMessage: `We analyzed "${title}" against ${matchedSolutions.length} existing market solutions in ${category}. Dominant opportunities lie in ${project.value_proposition || 'vertical execution and privacy'}.`,
    similarSolutions: matchedSolutions,
    differentiatorStrategies: [
      {
        title: 'Hyper-Specific Vertical Specialization',
        badge: 'HIGH IMPACT',
        description: `Tailor workflows around: "${project.problem_title || 'the core user bottleneck'}".`,
        actionableHook: `Target the top 20% most underserved power users in ${project.target_audience || 'your domain'}.`
      }
    ],
    comparisonMatrix: [
      {
        dimension: 'Core Philosophy',
        yourInnovation: `${title}: Focused workflow for ${project.target_audience || 'specialized users'}.`,
        existingSolutions: 'Generic, complex all-in-one software with steep learning curves.',
        whyYoursWins: 'Zero friction onboarding with immediate time-to-value.'
      }
    ]
  };
}
