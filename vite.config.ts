import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Custom secure backend plugin for Gemini AI Search without exposing keys to the client
function aiSearchBackendPlugin() {
  return {
    name: 'ai-search-backend',
    configureServer(server: any) {
      // AI Innovation Research & Project-Building Engine with Google Search Grounding
      server.middlewares.use('/api/ai-research', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { query } = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_AI_API_KEY || process.env.AI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'no_gemini_key_configured' }));
              return;
            }

            const prompt = `You are the INNOVEXA Innovation Research & Project-Building Agent.

The user wants to research and build this exact innovation:
"${query}"

Perform comprehensive research on the exact query topic above.
Find genuine existing solutions, real research papers, open-source repositories, technologies, datasets, and practical implementation blueprints.

CRITICAL GROUNDING & VERIFICATION RULES:
1. Research real-world existing solutions, products, papers, open-source repositories, frameworks, and datasets.
2. DO NOT invent fake company names or fabricated URLs.
3. Every external URL must be a real, accessible URL (e.g. official websites, arXiv papers, GitHub repos, documentation, Kaggle/HuggingFace datasets).
4. If a source link is not known with certainty, omit the URL or mark it clearly.
5. Provide a realistic, query-customized step-by-step engineering roadmap and architecture.
6. Output STRICT JSON adhering to this schema:
{
  "query": "${query}",
  "overview": "Detailed 2-3 paragraph analysis of the problem landscape, current approaches, and market opportunity.",
  "concept": {
    "title": "Clear innovation title",
    "description": "Simple, high-impact explanation of what the concept is.",
    "problem_addressed": "Detailed breakdown of the exact friction or problem.",
    "target_users": "Who experiences this problem and why it matters.",
    "why_it_matters": "The economic, societal, or operational impact."
  },
  "proposed_solution": {
    "title": "Proposed Solution Name / Blueprint",
    "description": "How this system solves the problem.",
    "user_experience": "What the user actually experiences from start to finish.",
    "core_utility": "What makes this solution genuinely useful and actionable."
  },
  "how_it_works": [
    {
      "step_number": 1,
      "stage": "Input / Ingestion",
      "action": "Description of input data",
      "technical_detail": "Specific data format, device sensor, or camera input"
    },
    {
      "step_number": 2,
      "stage": "Preprocessing",
      "action": "Normalization and feature extraction",
      "technical_detail": "Specific pipeline techniques"
    },
    {
      "step_number": 3,
      "stage": "AI / Core Logic",
      "action": "Model inference / intelligence",
      "technical_detail": "Specific neural network architecture or algorithm"
    },
    {
      "step_number": 4,
      "stage": "Decision & Classification",
      "action": "Prediction confidence and thresholding",
      "technical_detail": "Decision parameters"
    },
    {
      "step_number": 5,
      "stage": "Output & Actionable Advice",
      "action": "Prescription, alerts, or visualization",
      "technical_detail": "UI rendering / API response"
    },
    {
      "step_number": 6,
      "stage": "User Feedback & Action",
      "action": "End user execution",
      "technical_detail": "Follow-up workflow"
    }
  ],
  "related_solutions": [
    {
      "name": "Real existing solution or product name",
      "description": "What this solution does and how it operates.",
      "what_it_does": "Key capability",
      "why_related": "How it connects directly to the query",
      "url": "https://...",
      "source_type": "Official Website / Existing Product / Research Paper / GitHub Repository",
      "domain": "example.com",
      "relevance": 90
    }
  ],
  "solution_comparison": [
    {
      "solution_name": "Solution Name",
      "problem_addressed": "Specific problem focus",
      "technical_approach": "Method / Algorithm used",
      "technology_stack": "Key tech used",
      "target_users": "Target cohort",
      "source_url": "https://..."
    }
  ],
  "comparative_insights": {
    "common_approaches": ["Common technique 1", "Common technique 2"],
    "key_differences": ["Difference 1", "Difference 2"],
    "strengths": ["Key industry strength"],
    "limitations": ["Current real-world limitation"],
    "potential_gaps": ["Unaddressed whitespace or opportunity"]
  },
  "technologies": [
    {
      "category": "Frontend / Backend / AI & ML / Database / Infrastructure",
      "name": "Technology Name (e.g. React, FastAPI, PyTorch, PostgreSQL)",
      "purpose": "Why it is recommended for this specific project",
      "url": "https://..."
    }
  ],
  "resources_and_tools": [
    {
      "name": "Resource / Dataset / API / Framework Name",
      "resource_type": "Dataset / API Documentation / Framework / Research Paper",
      "description": "What it provides",
      "url": "https://..."
    }
  ],
  "architecture_pipeline": [
    { "layer": "Client Layer", "components": ["Web UI", "Mobile Scanner"], "details": "Direct user interaction" },
    { "layer": "API Gateway & Security", "components": ["FastAPI", "JWT Auth", "Rate Limiting"], "details": "Request validation" },
    { "layer": "Inference & AI Service", "components": ["Model Server", "Vector Store"], "details": "Predictive pipeline" },
    { "layer": "Storage & Database", "components": ["PostgreSQL", "Cloud Storage"], "details": "Persistence" }
  ],
  "implementation_phases": [
    {
      "phase_number": 1,
      "phase_name": "Problem Definition & Scope",
      "steps": ["Define target users and pain points", "Establish model precision targets"]
    },
    {
      "phase_number": 2,
      "phase_name": "Data Acquisition & Curation",
      "steps": ["Download verified dataset", "Clean and normalize images/records", "Set up augmentation pipeline"]
    },
    {
      "phase_number": 3,
      "phase_name": "Model Architecture & Training",
      "steps": ["Select pre-trained baseline backbone", "Fine-tune with transfer learning", "Benchmark evaluation metrics"]
    },
    {
      "phase_number": 4,
      "phase_name": "Backend API Service",
      "steps": ["Create REST/WebSocket endpoints", "Load model weights in memory", "Write inference handlers"]
    },
    {
      "phase_number": 5,
      "phase_name": "Frontend Application",
      "steps": ["Build responsive UI", "Integrate file upload / live capture", "Render real-time predictions"]
    },
    {
      "phase_number": 6,
      "phase_name": "Database & Telemetry",
      "steps": ["Store prediction history", "Save user feedback and review signals"]
    },
    {
      "phase_number": 7,
      "phase_name": "Testing & Validation",
      "steps": ["Run unit and integration tests", "Evaluate edge cases and false positives"]
    },
    {
      "phase_number": 8,
      "phase_name": "Deployment & Monitoring",
      "steps": ["Containerize with Docker", "Deploy to cloud host", "Configure alerts"]
    }
  ],
  "mvp_roadmap": {
    "mvp_features": ["Core feature 1", "Core feature 2", "Core feature 3", "Basic UI and inference"],
    "version_2_features": ["User accounts and history", "Automated batch processing", "Exportable reports"],
    "advanced_features": ["Offline edge deployment", "Multimodal diagnostics", "Decentralized community peer review"]
  },
  "improvement_opportunities": [
    "Opportunity for offline local-first inference",
    "Opportunity for multi-language localization",
    "Opportunity for automated peer review validation"
  ],
  "next_steps": [
    "Review the problem statement and target user requirements",
    "Inspect the verified external research and datasets",
    "Setup your development environment and clone baseline repositories",
    "Build the core MVP pipeline",
    "Publish your project on INNOVEXA to gather community feedback"
  ]
}`;

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  tools: [{ googleSearch: {} }],
                  generationConfig: {
                    temperature: 0.2
                  }
                })
              }
            );

            if (!response.ok) {
              const errText = await response.text();
              console.warn('Gemini API research returned error:', response.status, errText);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'gemini_api_error', details: response.statusText }));
              return;
            }

            const data = (await response.json()) as any;
            const candidate = data.candidates?.[0];
            const textContent = candidate?.content?.parts?.[0]?.text;

            // Extract Google search grounding metadata
            const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
            const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

            const extractedSources = groundingChunks.map((chunk: any) => ({
              title: chunk.web?.title || 'Web Citation',
              url: chunk.web?.uri,
              domain: chunk.web?.uri ? new URL(chunk.web.uri).hostname.replace(/^www\./, '') : '',
              sourceType: 'Web Grounding Citation',
              relevance: 95
            })).filter((s: any) => s.url && (s.url.startsWith('http://') || s.url.startsWith('https://')));

            // Parse text content as JSON safely
            let parsedJson: any = null;
            if (textContent) {
              const cleanText = textContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
              try {
                parsedJson = JSON.parse(cleanText);
              } catch (parseErr) {
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  parsedJson = JSON.parse(jsonMatch[0]);
                }
              }
            }

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              data: parsedJson,
              groundingSources: extractedSources,
              webSearchQueries
            }));
          } catch (err: any) {
            console.error('Server error handling /api/ai-research:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, reason: 'server_exception', error: err.message }));
          }
        });
      });

      // AI Multi-Project Comparison Endpoint
      server.middlewares.use('/api/ai-compare', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { projects } = JSON.parse(body || '{}');
            if (!projects || !Array.isArray(projects) || projects.length < 2) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'At least 2 projects required for comparison' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_AI_API_KEY || process.env.AI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'no_gemini_key_configured' }));
              return;
            }

            const cleanProjectsPayload = projects.map(p => ({
              id: p.id,
              title: p.title,
              category: p.category,
              project_type: p.project_type,
              problem_title: p.problem_title,
              problem_description: p.problem_description,
              solution_description: p.solution_description,
              target_audience: p.target_audience,
              value_proposition: p.value_proposition,
              differentiation: p.differentiation,
              tags: p.tags,
              readiness_score: p.readiness_score,
              upvotes_count: p.upvotes_count,
              reviews_count: p.reviews_count
            }));

            const prompt = `You are the INNOVEXA Project Comparison Engine.
Compare ONLY the following ${cleanProjectsPayload.length} innovations retrieved from the database.

PROJECT DATA:
${JSON.stringify(cleanProjectsPayload, null, 2)}

TASK:
Provide an objective, structured comparison based SOLELY on the provided project information.

CRITICAL RULES:
1. Do NOT invent features, metrics, technologies, or capabilities not mentioned in the provided data.
2. If information is missing for any project, write "Information not available in project profile".
3. Do NOT declare an arbitrary "winner" or say "Project A is better than Project B". Maintain neutral, analytical observations.
4. Each criterion analysis MUST associate the exact "project_id".
5. Return STRICT JSON conforming to this schema:
{
  "comparison_summary": "Objective 2-3 sentence overview comparing how these projects approach their respective spaces.",
  "criteria": [
    {
      "name": "Problem Addressed",
      "projects": [
        { "project_id": "...", "analysis": "Direct analysis of the specific problem statement" }
      ]
    },
    {
      "name": "Proposed Solution & Mechanism",
      "projects": [
        { "project_id": "...", "analysis": "Analysis of the solution architecture and mechanism" }
      ]
    },
    {
      "name": "Target Audience & User Segment",
      "projects": [
        { "project_id": "...", "analysis": "Target user segment analysis" }
      ]
    },
    {
      "name": "Differentiation & Innovation Wedge",
      "projects": [
        { "project_id": "...", "analysis": "Key unique angle or claimed competitive advantage" }
      ]
    }
  ],
  "common_points": [
    "Identified shared domain, philosophical, or technical commonalities"
  ],
  "differences": [
    { "project_id": "...", "point": "Distinct focus or approach for this project" }
  ],
  "potential_gaps": [
    "Unaddressed problem space or execution risk based on provided specs"
  ],
  "additional_observations": [
    "Neutral architectural or market observations"
  ]
}`;

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1
                  }
                })
              }
            );

            if (!response.ok) {
              const errText = await response.text();
              console.warn('Gemini API comparison returned error:', response.status, errText);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'gemini_api_error', details: response.statusText }));
              return;
            }

            const data = (await response.json()) as any;
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = textContent ? JSON.parse(textContent) : null;

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: parsed }));
          } catch (err: any) {
            console.error('Server error handling /api/ai-compare:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, reason: 'server_exception', error: err.message }));
          }
        });
      });

      // ────────────────────────────────────────────────────────
      // Smart Validation Loop: Individual Review AI Analysis
      // ────────────────────────────────────────────────────────
      server.middlewares.use('/api/ai-review-analyze', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { project, review } = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_AI_API_KEY || process.env.AI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'no_gemini_key_configured' }));
              return;
            }

            const prompt = `You are the INNOVEXA Smart Validation Intelligence Engine.

Analyze this specific user feedback for an innovation project.

PROJECT CONTEXT:
- Title: ${project?.title || 'Innovation Project'}
- Category: ${project?.category || 'General'}
- Problem Addressed: ${project?.problem_title || ''} - ${project?.problem_description || ''}
- Solution Overview: ${project?.solution_description || ''}
- Target Audience: ${project?.target_audience || ''}

USER FEEDBACK:
- First Reaction: ${review?.first_reaction || 'Not specified'}
- Problem Relevance: ${review?.problem_relevance || 'Not specified'}
- Solution Value: ${review?.solution_value || 'Not specified'}
- Selected Improvements Needed: ${(review?.selected_improvements || []).join(', ') || 'None selected'}
- Optional Follow-up Reason: ${review?.follow_up_reason || 'None'}
- Written Comment: "${review?.comment || review?.suggestion || 'No comment provided'}"

RULES FOR ANALYSIS:
1. Do not invent facts or claims not present in the review.
2. Ground all extracted concerns and suggestions strictly in the user's ratings, selections, and written comments.
3. If the user wrote no comment, derive the analysis strictly from their first reaction, problem relevance, solution value, and selected improvements.
4. Classify sentiment as "positive", "neutral", "negative", or "mixed".
5. Classify intent as "support", "suggestion", "concern", "criticism", "question", or "interest".
6. Return strict JSON matching this schema:
{
  "sentiment": "positive",
  "sentiment_score": 0.85,
  "intent": "suggestion",
  "topics": ["UX", "Pricing"],
  "detected_concerns": ["Interface onboarding seems complicated"],
  "detected_suggestions": ["Provide a 1-click quick start template"],
  "ai_summary": "User finds the concept promising but suggests simplifying initial onboarding.",
  "actionable_improvement": "Streamline first-time user wizard and reduce setup steps."
}`;

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1
                  }
                })
              }
            );

            if (!response.ok) {
              const errText = await response.text();
              console.warn('Gemini review analysis returned error:', response.status, errText);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'gemini_api_error', details: response.statusText }));
              return;
            }

            const data = (await response.json()) as any;
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = textContent ? JSON.parse(textContent) : null;

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: parsed }));
          } catch (err: any) {
            console.error('Server error in /api/ai-review-analyze:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, reason: 'server_exception', error: err.message }));
          }
        });
      });

      // ────────────────────────────────────────────────────────
      // Smart Validation Loop: Aggregated Project Insights & Clustering
      // ────────────────────────────────────────────────────────
      server.middlewares.use('/api/ai-validation-aggregate', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { project, reviews, individualAnalyses } = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_AI_API_KEY || process.env.AI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'no_gemini_key_configured' }));
              return;
            }

            const totalReviewsCount = Array.isArray(reviews) ? reviews.length : 0;
            const reviewsContext = (reviews || []).slice(0, 50).map((r: any, idx: number) => {
              const analysis = (individualAnalyses || []).find((a: any) => a.review_id === r.id);
              return `Review #${idx + 1}:
- Reaction: ${r.first_reaction || 'N/A'} | Relevance: ${r.problem_relevance || 'N/A'} | Value: ${r.solution_value || 'N/A'}
- Improvements Selected: ${(r.selected_improvements || []).join(', ') || 'None'}
- Comment: "${r.comment || r.suggestion || 'No comment'}"
- Follow-up: "${r.follow_up_reason || 'N/A'}"
- AI Extracted Concerns: ${(analysis?.detected_concerns || []).join('; ') || 'None'}
- AI Extracted Suggestions: ${(analysis?.detected_suggestions || []).join('; ') || 'None'}`;
            }).join('\n\n');

            const prompt = `You are the INNOVEXA Chief Validation Analyst.

Your task is to analyze aggregated community validation reviews for this project and produce actionable clusters and prioritized improvement recommendations for the creator.

PROJECT:
- Title: ${project?.title || 'Project'}
- Category: ${project?.category || 'Technology'}
- Problem: ${project?.problem_description || project?.problem_title || ''}
- Solution: ${project?.solution_description || ''}
- Target Audience: ${project?.target_audience || ''}

TOTAL REVIEWS: ${totalReviewsCount}

ALL RECENT REVIEWS AND EXTRACTED FEEDBACK:
${reviewsContext || 'No reviews available yet.'}

ANALYSIS REQUIREMENTS:
1. Ground every signal, concern, cluster, and recommendation in the actual feedback above.
2. Group similar feedback into 3 to 6 common themes (Feedback Clusters: e.g. "UX & Navigation", "Pricing & Commercial Clarity", "Performance & Latency", "Core Feature Depth", "Security & Trust").
3. For each cluster, state the actual count of mentions and synthesize a concise summary.
4. Generate 3 to 5 prioritized, high-impact Improvement Recommendations with concrete suggested actions that the creator can accept, save, or dismiss.
5. Provide an objective Final Validation Result summary without arbitrary hype.
6. Return STRICT JSON matching this schema:
{
  "positive_percentage": 75,
  "neutral_percentage": 15,
  "negative_percentage": 10,
  "problem_relevance_rate": 82,
  "solution_interest_rate": 78,
  "top_positive_signals": [
    "High problem relevance validated by target audience",
    "Clean and easy-to-understand core value proposition"
  ],
  "top_concerns": [
    { "concern": "Onboarding and initial setup friction", "mention_count": 5 },
    { "concern": "Unclear pricing model", "mention_count": 3 }
  ],
  "top_suggestions": [
    { "suggestion": "Provide 1-click quickstart templates", "mention_count": 6 },
    { "suggestion": "Add team collaboration permissions", "mention_count": 4 }
  ],
  "feedback_clusters": [
    {
      "category": "UX & Onboarding",
      "mention_count": 7,
      "summary": "Multiple users reported friction during initial setup and requested guided templates.",
      "sample_quotes": ["Setup took too many steps", "Need a quicker onboarding demo"],
      "sentiment": "neutral"
    }
  ],
  "improvement_recommendations": [
    {
      "title": "Streamline Onboarding to 2 Steps",
      "description": "Reduce setup friction by offering pre-configured defaults and a guided tutorial.",
      "reason": "7 users explicitly noted that initial configuration was too complex.",
      "source_review_count": 7,
      "priority": "high",
      "cluster_category": "UX & Onboarding"
    }
  ],
  "validation_summary": "Community validation shows strong interest in the core problem statement, with actionable requests centered on onboarding simplicity and pricing clarity.",
  "next_steps": [
    "1. Implement streamlined 2-step onboarding wizard",
    "2. Publish transparent pricing breakdown",
    "3. Request second-round community re-validation"
  ]
}`;

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1
                  }
                })
              }
            );

            if (!response.ok) {
              const errText = await response.text();
              console.warn('Gemini validation aggregation returned error:', response.status, errText);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, reason: 'gemini_api_error', details: response.statusText }));
              return;
            }

            const data = (await response.json()) as any;
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = textContent ? JSON.parse(textContent) : null;

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: parsed }));
          } catch (err: any) {
            console.error('Server error in /api/ai-validation-aggregate:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, reason: 'server_exception', error: err.message }));
          }
        });
      });

      // ────────────────────────────────────────────────────────
      // Two-Pass AI Project Analyzer Engine with Real-Time Web Grounding
      // ────────────────────────────────────────────────────────
      server.middlewares.use('/api/ai-project-analyzer', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { projectContext, reviews = [] } = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_AI_API_KEY || process.env.AI_API_KEY;
            const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({ 
                success: false, 
                reason: 'no_gemini_key_configured',
                error: 'Gemini API key is not configured in environment variables (GEMINI_API_KEY).' 
              }));
              return;
            }

            if (!projectContext || !projectContext.title) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Valid projectContext with title is required' }));
              return;
            }

            const crypto = await import('crypto');
            const inputHash = crypto.createHash('sha256').update(JSON.stringify(projectContext)).digest('hex').substring(0, 16);
            const startTime = Date.now();

            // ─────────────────────────────────────────────────────
            // PASS 1 — PROJECT UNDERSTANDING & TARGETED QUERY SYNTHESIS
            // ─────────────────────────────────────────────────────
            const pass1Prompt = `You are PASS 1 of the INNOVEXA Project Analysis Engine.
Your task is to analyze ONLY the specific innovation project provided below.
Extract the core problem, solution mechanics, target audience, precise technical/industry domain taxonomy, core features, keywords, and 5-7 highly specific, targeted Google Search queries.

PROJECT CONTEXT:
- Project ID: ${projectContext.projectId || 'Not provided'}
- Title: "${projectContext.title}"
- Category / Domain: "${projectContext.category || 'Not provided'}"
- Project Type: "${projectContext.projectType || 'Not provided'}"
- Problem: "${projectContext.problem || 'Not provided'}"
- Solution: "${projectContext.solution || projectContext.description || 'Not provided'}"
- Target Users: "${projectContext.targetAudience || 'Not provided'}"
- Core Features: "${Array.isArray(projectContext.features) ? projectContext.features.join(', ') : (projectContext.features || 'Not provided')}"
- Technology Stack: "${projectContext.technology || 'Not provided'}"
- Business Model: "${projectContext.businessModel || 'Not provided'}"
- Launch / Public URL: "${projectContext.launchUrl || 'Not provided'}"

RULES FOR PASS 1:
1. Ground your understanding strictly in this project. Do not invent unrelated capabilities.
2. The search queries MUST be specifically tailored to this project's unique domain and problem space.
   - Example for AI Crop Disease Detection: ["AI crop disease detection platforms 2026", "computer vision plant leaf diagnosis startups", "smart agriculture disease detection apps", "crop health image recognition tools", "agritech computer vision market trends"]
   - Example for AI Interview Prep: ["AI technical mock interview platforms 2026", "AI interview coaching startups", "automated voice interview feedback tools", "interview preparation SaaS market", "AI job interview simulator software"]
3. Return STRICT JSON conforming to this schema:
{
  "problem": "Concise summary of the specific user pain point",
  "solution": "Concise summary of the proposed solution approach",
  "target_users": ["Specific user demographic 1", "Specific user demographic 2"],
  "domain": "Precise domain vertical (e.g. Precision Agriculture, EdTech / Career Prep, Healthcare Telemetry)",
  "core_features": ["Specific feature 1", "Specific feature 2", "Specific feature 3"],
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"],
  "search_queries": [
    "Targeted search query 1",
    "Targeted search query 2",
    "Targeted search query 3",
    "Targeted search query 4",
    "Targeted search query 5"
  ]
}`;

            const pass1Response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: pass1Prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1
                  }
                })
              }
            );

            let pass1Result: any = {
              problem: projectContext.problem || 'User pain point',
              solution: projectContext.solution || projectContext.description || 'Proposed solution',
              target_users: [projectContext.targetAudience || 'Target audience'],
              domain: projectContext.category || 'Technology',
              core_features: ['Core Workflow', 'Analytics Dashboard'],
              keywords: [projectContext.title, projectContext.category || 'Innovation'],
              search_queries: [
                `${projectContext.title} alternatives`,
                `${projectContext.category || 'tech'} startups 2026`,
                `${projectContext.title} market solutions`
              ]
            };

            if (pass1Response.ok) {
              const p1Data = (await pass1Response.json()) as any;
              const p1Text = p1Data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (p1Text) {
                try {
                  pass1Result = JSON.parse(p1Text);
                } catch (e) {
                  console.warn('Pass 1 JSON parse fallback:', e);
                }
              }
            }

            // ─────────────────────────────────────────────────────
            // PASS 2 — TARGETED WEB RESEARCH GROUNDING & STRUCTURED ANALYSIS
            // ─────────────────────────────────────────────────────
            const reviewsContext = Array.isArray(reviews) && reviews.length > 0
              ? reviews.map((r: any, idx: number) => `Review ${idx + 1}: Rating/Quality: ${r.quality_score || r.rating || 5}/5, Relevance: ${r.problem_relevance || 'yes'}, Clarity: ${r.solution_clarity || 'yes'}, Usefulness: ${r.usefulness || 'yes'}, Type: ${r.review_type || 'feedback'}, Suggestion: "${r.suggestion || r.comment || 'None'}"`).join('\n')
              : 'No reviews exist in database for this specific project.';

            const pass2Prompt = `You are PASS 2 of the INNOVEXA Project Analysis Engine.
Perform an in-depth, rigorous, grounded market & competitor analysis for the exact project below.

PROJECT CONTEXT:
- Project ID: ${projectContext.projectId || 'Not provided'}
- Title: "${projectContext.title}"
- Domain Taxonomy: "${pass1Result.domain}"
- Identified Problem: "${pass1Result.problem}"
- Proposed Solution: "${pass1Result.solution}"
- Target Users: ${JSON.stringify(pass1Result.target_users)}
- Core Features: ${JSON.stringify(pass1Result.core_features)}
- Technology Stack: "${projectContext.technology || 'Not provided'}"
- Project URL: "${projectContext.launchUrl || 'Not provided'}"

PASS 1 TARGETED RESEARCH QUERIES:
${(pass1Result.search_queries || []).map((q: string, i: number) => `${i + 1}. "${q}"`).join('\n')}

USER REVIEWS FROM DATABASE (ONLY FOR THIS PROJECT):
${reviewsContext}

CRITICAL RULES FOR PASS 2:
1. Conduct real-time web research using Google Search on the queries above.
2. Find REAL, EXISTING market solutions, products, and competitors in "${pass1Result.domain}".
3. DO NOT invent fake company names or fake URLs. Every external source and competitor URL must be genuine (e.g. official domains, GitHub, Product Hunt, arXiv).
4. Market trends must be domain-specific for "${pass1Result.domain}" (e.g. if agriculture, precision ag/computer vision trends; if career/education, edtech/interview AI trends).
5. All recommendations must be concrete and directly reference "${projectContext.title}"'s specific features and target audience.
6. Clearly distinguish FACT, SOURCE, AI_INTERPRETATION, and RECOMMENDATION.
7. Return STRICT JSON with this exact schema:

{
  "executive_summary": "Comprehensive 2-3 paragraph executive summary of the project's current market position, competitive density in ${pass1Result.domain}, primary risks, and high-leverage growth opportunities.",
  "project_understanding": {
    "problem": "${pass1Result.problem.replace(/"/g, '\\"')}",
    "solution": "${pass1Result.solution.replace(/"/g, '\\"')}",
    "target_audience": "${(pass1Result.target_users || []).join(', ').replace(/"/g, '\\"')}",
    "value_proposition": "${(projectContext.valueProposition || pass1Result.solution).replace(/"/g, '\\"')}",
    "core_features": ${JSON.stringify(pass1Result.core_features || [])},
    "business_model": "${(projectContext.businessModel || 'Direct Usage / SaaS Subscription').replace(/"/g, '\\"')}",
    "domain_taxonomy": "${pass1Result.domain.replace(/"/g, '\\"')}"
  },
  "url_analysis": {
    "accessible": true,
    "extracted_title": "${projectContext.title.replace(/"/g, '\\"')}",
    "extracted_description": "Verified project profile and positioning in ${pass1Result.domain}.",
    "detected_features": ${JSON.stringify(pass1Result.core_features || [])},
    "pricing_model": "${(projectContext.businessModel || 'Not publicly identified').replace(/"/g, '\\"')}",
    "user_experience_notes": "First-impression user flow analysis based on provided specs.",
    "status_message": "Project specifications successfully analyzed."
  },
  "related_solutions": [
    {
      "name": "Real existing product/project name 1",
      "url": "https://real-url.com",
      "domain": "real-url.com",
      "description": "What they do in ${pass1Result.domain}.",
      "what_they_do": "Core mechanism.",
      "how_it_differs": "Specific ways ${projectContext.title.replace(/"/g, '\\"')} differs or can differentiate.",
      "similarity_percentage": 85,
      "source_type": "Commercial Platform / Open Source"
    },
    {
      "name": "Real existing product/project name 2",
      "url": "https://real-url-2.com",
      "domain": "real-url-2.com",
      "description": "Alternative approach in this space.",
      "what_they_do": "Key capability.",
      "how_it_differs": "Differentiation angle for ${projectContext.title.replace(/"/g, '\\"')}.",
      "similarity_percentage": 70,
      "source_type": "Open Source Tool"
    }
  ],
  "competitive_landscape": [
    {
      "project_name": "${projectContext.title.replace(/"/g, '\\"')}",
      "problem_solved": "${pass1Result.problem.replace(/"/g, '\\"')}",
      "target_audience": "${(pass1Result.target_users || []).join(', ').replace(/"/g, '\\"')}",
      "core_solution": "${pass1Result.solution.replace(/"/g, '\\"')}",
      "key_features": ${JSON.stringify(pass1Result.core_features || [])},
      "pricing": "Planned / Early Stage",
      "strengths": ["Focused user niche", "Modern architecture"],
      "limitations": ["Early validation phase"],
      "differentiation_opportunity": "Core wedge against incumbents",
      "source_url": "${projectContext.launchUrl || 'https://innovexa.dev'}",
      "is_analyzed_project": true
    },
    {
      "project_name": "Direct Competitor Name",
      "problem_solved": "What problem competitor solves",
      "target_audience": "Competitor audience",
      "core_solution": "Competitor solution mechanism",
      "key_features": ["Competitor feature A", "Competitor feature B"],
      "pricing": "Freemium / $XX per mo / Not publicly identified",
      "strengths": ["Market presence", "Feature breadth"],
      "limitations": ["High pricing or complex UX"],
      "differentiation_opportunity": "How ${projectContext.title.replace(/"/g, '\\"')} can win this user segment",
      "source_url": "https://real-competitor-url.com",
      "is_analyzed_project": false
    }
  ],
  "market_trends": [
    {
      "trend_name": "Domain trend name 1 in ${pass1Result.domain}",
      "category": "Technology & Market Adoption",
      "timeline_phase": "current",
      "evidence": "Concrete observation or market shift in 2026",
      "source_title": "Industry research / publication",
      "source_url": "https://...",
      "why_it_matters": "Direct impact on ${projectContext.title.replace(/"/g, '\\"')}",
      "potential_impact": "High market tailwind",
      "type_tag": "FACT"
    },
    {
      "trend_name": "Emerging shift in user expectations for ${pass1Result.domain}",
      "category": "User Demand & Workflow",
      "timeline_phase": "emerging",
      "evidence": "Growing demand for specialized on-demand workflows",
      "source_title": "Domain analysis",
      "source_url": "https://...",
      "why_it_matters": "Creates immediate differentiation opportunity",
      "potential_impact": "Category leadership opportunity",
      "type_tag": "AI_INTERPRETATION"
    }
  ],
  "strengths": [
    {
      "dimension": "Problem Clarity",
      "assessment": "Detailed evaluation of problem urgency for ${pass1Result.domain}",
      "evidence": "Concrete market pain point validation",
      "rating_level": "High"
    },
    {
      "dimension": "Solution Architecture",
      "assessment": "Evaluation of technical feasibility and value loop",
      "evidence": "Targeted execution capability",
      "rating_level": "High"
    }
  ],
  "weaknesses": [
    {
      "dimension": "Market Distribution & Discovery",
      "description": "Risk of low initial user acquisition velocity in ${pass1Result.domain}",
      "impact_risk": "Moderate",
      "needs_validation": true,
      "suggested_remedy": "Partner with early adopter communities and provide frictionless sample trials."
    }
  ],
  "opportunities": [
    {
      "title": "Specific whitespace opportunity in ${pass1Result.domain}",
      "opportunity_type": "Market Gap",
      "why": "Incumbents overlook this specific user subset",
      "evidence": "Market research findings",
      "source": "Market analysis",
      "source_url": "https://...",
      "how_to_explore": "Build a focused pilot addressing this exact workflow."
    }
  ],
  "risk_map": [
    {
      "risk_category": "Competition Risk",
      "risk_title": "Incumbent feature replication",
      "evidence": "Existing competitors expanding into lightweight tooling",
      "potential_impact": "Moderate",
      "mitigation_strategy": "Double down on vertical-specific workflow depth and faster feedback cycles."
    }
  ],
  "user_feedback_analysis": {
    "has_reviews": ${Array.isArray(reviews) && reviews.length > 0},
    "total_reviews": ${Array.isArray(reviews) ? reviews.length : 0},
    "average_sentiment": "${Array.isArray(reviews) && reviews.length > 0 ? 'Positive' : 'Insufficient Feedback'}",
    "sentiment_score": ${Array.isArray(reviews) && reviews.length > 0 ? 82 : 0},
    "positive_themes": ["Concept clarity", "Strong target problem resonance"],
    "negative_themes": [],
    "repeated_suggestions": ["Streamline initial onboarding", "Add team sharing"],
    "feedback_clusters": [],
    "status_note": "${Array.isArray(reviews) && reviews.length > 0 ? 'Synthesized from verified community reviews.' : 'Insufficient user feedback. No reviews yet.'}"
  },
  "recommendations": [
    {
      "priority": "NOW",
      "title": "Launch quick-start demo for ${pass1Result.target_users?.[0] || 'users'}",
      "problem_addressed": "Initial user friction and time-to-value",
      "why": "Allows early adopters to experience the core utility in under 30 seconds.",
      "expected_benefit": "3x higher trial-to-active conversion rate.",
      "implementation_idea": "Provide pre-loaded sample data or instant 1-click test simulation."
    },
    {
      "priority": "NEXT",
      "title": "Implement automated validation loop",
      "problem_addressed": "Continuous accuracy and feedback gathering",
      "why": "Strengthens product moat and user retention in ${pass1Result.domain}.",
      "expected_benefit": "High confidence metrics for version 2.",
      "implementation_idea": "Add 1-click rating signals after each completed action."
    },
    {
      "priority": "LATER",
      "title": "API & Ecosystem Integrations",
      "problem_addressed": "Workflow silo and scalability",
      "why": "Deepens switching costs and distribution reach.",
      "expected_benefit": "B2B partnership readiness.",
      "implementation_idea": "Publish webhooks and REST endpoints for external tool chains."
    }
  ],
  "differentiation_strategy": {
    "current_positioning": "Focused, agile solution tailored specifically for ${pass1Result.target_users?.[0] || 'target users'}.",
    "existing_alternatives": "Generic or high-cost platforms in ${pass1Result.domain}.",
    "market_gap": "Lack of accessible, specialized workflows designed for modern practitioners.",
    "potential_differentiation": "Deliver 10x faster time-to-insight with zero setup overhead.",
    "possible_unique_feature": "Context-aware AI scoring tuned specifically for ${pass1Result.domain}.",
    "potential_user_segment": "${(pass1Result.target_users || []).join(', ')}",
    "implementation_direction": "Focus initial version strictly on the core friction before expanding secondary features.",
    "validation_disclaimer": "This could provide differentiation if validated with users."
  },
  "feature_gap_matrix": [
    {
      "feature_name": "Core Automated Diagnostic / Workflow",
      "analyzed_project_status": "Available",
      "competitors_status": "Standard",
      "opportunity_note": "Core baseline table stakes.",
      "priority": "High"
    },
    {
      "feature_name": "Instant Zero-Setup Sample Mode",
      "analyzed_project_status": "Planned",
      "competitors_status": "Rare",
      "opportunity_note": "High-leverage differentiator to capture early adopters.",
      "priority": "High"
    }
  ],
  "sources": [
    {
      "title": "Google Search Grounding: ${pass1Result.domain}",
      "url": "https://google.com/search?q=${encodeURIComponent(pass1Result.search_queries?.[0] || pass1Result.domain)}",
      "domain": "google.com",
      "why_it_matters": "Real-time industry search grounding.",
      "source_type": "Search Grounding"
    }
  ]
}`;

            const pass2Response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: pass2Prompt }] }],
                  tools: [{ googleSearch: {} }],
                  generationConfig: {
                    temperature: 0.2
                  }
                })
              }
            );

            if (!pass2Response.ok) {
              const errText = await pass2Response.text();
              console.warn('Gemini Pass 2 analysis error:', pass2Response.status, errText);
              res.statusCode = 200;
              res.end(JSON.stringify({ 
                success: false, 
                reason: 'gemini_api_error', 
                error: `Gemini API returned ${pass2Response.status}: ${pass2Response.statusText}` 
              }));
              return;
            }

            const p2Data = (await pass2Response.json()) as any;
            const candidate = p2Data.candidates?.[0];
            const textContent = candidate?.content?.parts?.[0]?.text;

            // Extract Google search grounding metadata
            const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
            const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || pass1Result.search_queries || [];

            const extractedSources = groundingChunks.map((chunk: any) => ({
              title: chunk.web?.title || 'Web Citation',
              url: chunk.web?.uri,
              domain: chunk.web?.uri ? new URL(chunk.web.uri).hostname.replace(/^www\./, '') : 'web',
              source_type: 'Web Grounding Citation',
              why_it_matters: 'Verified real-time search citation.'
            })).filter((s: any) => s.url && (s.url.startsWith('http://') || s.url.startsWith('https://')));

            // Parse text content as JSON safely
            let parsedReport: any = null;
            if (textContent) {
              const cleanText = textContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
              try {
                parsedReport = JSON.parse(cleanText);
              } catch (parseErr) {
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  parsedReport = JSON.parse(jsonMatch[0]);
                }
              }
            }

            if (!parsedReport) {
              res.statusCode = 200;
              res.end(JSON.stringify({ 
                success: false, 
                reason: 'json_parse_error', 
                error: 'Could not parse structured JSON from AI analysis response.' 
              }));
              return;
            }

            // Output Validation: Merge extracted verified grounding sources
            if (extractedSources.length > 0) {
              const existingUrls = new Set((parsedReport.sources || []).map((s: any) => s.url));
              const newSources = extractedSources.filter((s: any) => !existingUrls.has(s.url));
              parsedReport.sources = [...(parsedReport.sources || []), ...newSources];
            }

            const durationMs = Date.now() - startTime;

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              data: parsedReport,
              inputHash,
              searchQueries: webSearchQueries,
              groundingSources: extractedSources,
              modelName,
              durationMs,
              promptVersion: 'project-analyzer-v2'
            }));
          } catch (err: any) {
            console.error('Server exception in /api/ai-project-analyzer:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ 
              success: false, 
              reason: 'server_exception', 
              error: err.message || 'Unexpected server error occurred during AI analysis.' 
            }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiSearchBackendPlugin()],
  server: {
    port: 5173,
    host: true,
  }
})
