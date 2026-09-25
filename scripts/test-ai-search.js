// Test script for AI Innovation Search Engine Verification
const { analyzeSearchQuery, calculateProjectRelevance } = (() => {
  const DOMAIN_KEYWORDS = {
    agriculture: {
      category: 'Agriculture',
      terms: ['crop', 'plant', 'disease', 'leaf', 'farming', 'farmer', 'agriculture', 'agtech', 'soil', 'harvest', 'pest', 'blight', 'fertilizer', 'irrigation', 'botanical', 'greenhouse', 'agronomist', 'yield', 'fungal'],
      defaultUsers: 'Farmers, Agronomists & Agricultural Researchers'
    },
    career_interview: {
      category: 'Education',
      terms: ['interview', 'prep', 'preparation', 'mock', 'resume', 'career', 'job', 'hiring', 'applicant', 'student', 'behavioral', 'technical interview', 'coding challenge', 'recruiting', 'salary', 'internship', 'candidate'],
      defaultUsers: 'College Students, Job Seekers & Career Switchers'
    },
    sustainability_waste: {
      category: 'Sustainability',
      terms: ['waste', 'recycling', 'garbage', 'bin', 'trash', 'compost', 'circular', 'plastic', 'landfill', 'zero waste', 'smart city', 'clean energy', 'sustainability', 'emission', 'carbon', 'eco', 'refill'],
      defaultUsers: 'City Municipalities, Sustainability Teams & Conscious Citizens'
    },
    healthcare_wellness: {
      category: 'Healthcare',
      terms: ['health', 'healthcare', 'medical', 'mental', 'counseling', 'burnout', 'appointment', 'doctor', 'clinic', 'patient', 'therapy', 'hospital', 'wellness', 'disease', 'clinical', 'medicine', 'anxiety', 'prescription', 'ehr', 'fhir'],
      defaultUsers: 'Patients, Healthcare Providers & University Students'
    },
    ecommerce_logistics: {
      category: 'E-Commerce',
      terms: ['grocery', 'delivery', 'store', 'cart', 'order', 'courier', 'ecommerce', 'supermarket', 'market', 'shopping', 'fulfillment', 'retail', 'produce', 'autonomous delivery', 'last mile'],
      defaultUsers: 'Urban Shoppers, Grocery Retailers & Logistics Fleets'
    }
  };

  const STOP_WORDS = new Set(['a', 'an', 'the', 'for', 'with', 'and', 'in', 'of', 'to', 'is', 'on', 'at', 'by', 'from', 'or', 'about', 'how', 'what', 'which', 'based', 'using', 'system', 'app', 'application', 'platform', 'tool', 'solution', 'project', 'like', 'help', 'prepare']);

  function analyze(rawQuery) {
    const normalized = rawQuery.toLowerCase().trim().replace(/[^\w\s-]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(t => t.length > 1);
    const keyTerms = tokens.filter(t => !STOP_WORDS.has(t));
    let detectedDomain = 'Technology';
    let highest = 0;
    for (const [key, conf] of Object.entries(DOMAIN_KEYWORDS)) {
      let count = 0;
      for (const t of conf.terms) {
        if (normalized.includes(t)) count += t.includes(' ') ? 3 : 1;
      }
      if (count > highest) {
        highest = count;
        detectedDomain = conf.category;
      }
    }
    return { rawQuery, normalizedQuery: normalized, domain: detectedDomain, keyTerms };
  }

  function score(project, analysis) {
    const queryLower = analysis.normalizedQuery;
    const keyTerms = analysis.keyTerms;
    const projTitle = (project.title || '').toLowerCase();
    const projProblem = `${project.problem_title || ''} ${project.problem_description || ''}`.toLowerCase();
    const projSolution = `${project.solution_description || ''} ${project.value_proposition || ''}`.toLowerCase();
    const projCat = (project.category || '').toLowerCase();

    let titleScore = 0;
    if (queryLower.length > 2 && projTitle.includes(queryLower)) titleScore = 30;
    else {
      let matches = keyTerms.filter(t => projTitle.includes(t)).length;
      if (keyTerms.length) titleScore = Math.min(30, Math.round((matches / keyTerms.length) * 30));
    }

    let problemScore = 0;
    let pMatches = keyTerms.filter(t => projProblem.includes(t)).length;
    if (keyTerms.length) problemScore = Math.min(20, Math.round((pMatches / keyTerms.length) * 20));

    let solScore = 0;
    let sMatches = keyTerms.filter(t => projSolution.includes(t)).length;
    if (keyTerms.length) solScore = Math.min(20, Math.round((sMatches / keyTerms.length) * 20));

    let domainScore = 0;
    if (projCat.includes(analysis.domain.toLowerCase())) domainScore = 15;

    let tagScore = 0;
    let tags = (project.tags || []).map(t => t.toLowerCase());
    for (const t of tags) {
      if (keyTerms.some(k => t.includes(k))) tagScore += 5;
    }
    tagScore = Math.min(15, tagScore);

    let total = titleScore + problemScore + solScore + domainScore + tagScore;
    const isDomainSpecific = ['agriculture', 'healthcare', 'sustainability', 'education', 'e-commerce'].includes(analysis.domain.toLowerCase());
    if (isDomainSpecific && !projCat.includes(analysis.domain.toLowerCase()) && domainScore === 0) {
      total = Math.min(total, 18);
    }
    return Math.max(0, Math.min(100, total));
  }

  return { analyzeSearchQuery: analyze, calculateProjectRelevance: score };
})();

// Sample Projects Database
const PROJECTS = [
  { id: '1', title: 'AI Plant Disease Detector', category: 'Agriculture', problem_title: 'Early plant and crop diseases destroy harvests', problem_description: 'Classify leaf fungal infections in crops', solution_description: 'Computer vision CNN for plant disease', tags: ['Agriculture', 'CNN', 'Crop Disease'] },
  { id: '2', title: 'AgriVision Satellite Analyzer', category: 'Agriculture', problem_title: 'Crop health monitoring over acreage', problem_description: 'NDVI crop stress heatmaps', solution_description: 'Predict pathogen outbreaks', tags: ['Agriculture', 'Drone', 'Crop Monitoring'] },
  { id: '3', title: 'PrepPulse AI Interview Platform', category: 'Education', problem_title: 'College students lack interview practice', problem_description: 'Mock interview and speech analysis', solution_description: 'AI voice interviewer', tags: ['Education', 'Interview Prep', 'Career'] },
  { id: '4', title: 'CareerMock AI Simulator', category: 'Education', problem_title: 'Software engineers struggle with technical interviews', problem_description: 'Mock technical interview coding challenges', solution_description: 'Live interactive interviewer', tags: ['Education', 'Mock Interview', 'Career'] },
  { id: '5', title: 'EcoWaste AI Smart Routing', category: 'Sustainability', problem_title: 'Municipal waste trucks waste fuel', problem_description: 'Smart urban waste management and IoT bins', solution_description: 'Dynamic truck dispatch', tags: ['Sustainability', 'Smart Waste', 'Recycling'] },
  { id: '6', title: 'CircularBin Automated Recycling', category: 'Sustainability', problem_title: 'Plastic sent to landfill from contamination', problem_description: 'Automated recycling waste sorting', solution_description: 'Computer vision bin flap', tags: ['Sustainability', 'Recycling', 'Waste Management'] },
  { id: '7', title: 'MindEase Student Mental Health', category: 'Healthcare', problem_title: 'University student burnout and anxiety', problem_description: 'Campus student distress triage', solution_description: 'CBT companion and crisis support', tags: ['Healthcare', 'Mental Health', 'Student Wellness'] },
  { id: '8', title: 'CareCal Appointment Optimizer', category: 'Healthcare', problem_title: 'Hospital appointment no-shows', problem_description: 'Clinical scheduling optimization', solution_description: 'Predictive no-show scheduler', tags: ['Healthcare', 'Appointment Optimization'] },
  { id: '9', title: 'FreshDrop Autonomous Grocery Delivery', category: 'E-Commerce', problem_title: 'Last-mile grocery delivery cost and congestion', problem_description: 'High fees on grocery orders', solution_description: 'Micro-fulfillment electric grocery pods', tags: ['E-Commerce', 'Grocery Delivery'] },
  { id: '10', title: 'StudyFlow Workspace', category: 'Education', problem_title: 'Fragmented academic syllabi', problem_description: 'Student assignment organization', solution_description: 'Syllabus spaced repetition', tags: ['Education', 'Productivity'] }
];

const TEST_QUERIES = [
  'AI crop disease detection',
  'AI interview preparation',
  'smart waste management',
  'student mental health',
  'online grocery delivery',
  'underwater coral disease detection'
];

console.log('====================================================');
console.log('RUNNING AI INNOVATION SEARCH VERIFICATION SUITE');
console.log('====================================================\n');

for (const query of TEST_QUERIES) {
  const analysis = analyzeSearchQuery(query);
  const scored = PROJECTS.map(p => ({
    title: p.title,
    category: p.category,
    score: calculateProjectRelevance(p, analysis)
  }))
  .filter(r => r.score >= 20)
  .sort((a, b) => b.score - a.score);

  console.log(`QUERY: "${query}"`);
  console.log(`  Extracted Domain: ${analysis.domain}`);
  console.log(`  Results Found: ${scored.length}`);
  if (scored.length > 0) {
    scored.slice(0, 3).forEach(r => {
      console.log(`    → [${r.score}%] ${r.title} (${r.category})`);
    });
  } else {
    console.log('    → [0 Results] "No strongly related innovations found." state triggered correctly.');
  }
  console.log('----------------------------------------------------');
}
