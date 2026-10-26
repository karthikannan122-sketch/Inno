import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "INNOVEXA backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "innovexa-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Supabase PostgreSQL Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://stfpitwhsemzpnevvheq.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// Helper for Supabase REST API calls
const supabaseFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${SUPABASE_URL}/rest/v1${cleanEndpoint}`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...(options.prefer ? { "Prefer": options.prefer } : {}),
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
};

// Comprehensive Status & Backend Diagnostic Report
app.get("/api/status", async (req, res) => {
  let dbStatus = "unreachable";
  let projectCount = 0;
  try {
    const dbRes = await supabaseFetch("/projects?select=id&limit=1", {
      headers: { "Prefer": "count=exact" }
    });
    if (dbRes.ok) {
      dbStatus = "connected";
      const range = dbRes.headers.get("content-range");
      projectCount = range ? parseInt(range.split("/")[1] || "0", 10) : 1;
    }
  } catch (e) {
    dbStatus = "error: " + e.message;
  }

  res.json({
    online: true,
    service: "innovexa-backend",
    backend_url: "https://inno-backend-0pfj.onrender.com",
    environment: process.env.NODE_ENV || "production",
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      type: "Supabase PostgreSQL",
      project_count: projectCount,
      url: SUPABASE_URL
    },
    ai_engine: {
      status: getGeminiApiKey() ? "ready (gemini-1.5-flash)" : "fallback-mode"
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/projects — Retrieve all projects from PostgreSQL database
app.get("/api/projects", async (req, res) => {
  try {
    const dbRes = await supabaseFetch("/projects?select=*,project_tags(tag),profiles:owner_id(full_name,avatar_url)&order=created_at.desc");
    if (dbRes.ok) {
      const data = await dbRes.json();
      const formatted = (data || []).map(p => ({
        ...p,
        tags: p.project_tags ? p.project_tags.map(t => t.tag) : (p.tags || [p.category || 'Technology']),
        owner_name: p.profiles?.full_name || p.owner_name || 'Community Innovator',
        owner_avatar: p.profiles?.avatar_url || p.owner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        readiness_score: p.validation_score || p.readiness_score || 75
      }));
      return res.json({ success: true, count: formatted.length, data: formatted });
    }
    res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/projects/:id — Single project details
app.get("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dbRes = await supabaseFetch(`/projects?id=eq.${id}&select=*,project_tags(tag),profiles:owner_id(full_name,avatar_url)`);
    if (dbRes.ok) {
      const data = await dbRes.json();
      if (data && data.length > 0) {
        const p = data[0];
        const formatted = {
          ...p,
          tags: p.project_tags ? p.project_tags.map(t => t.tag) : (p.tags || []),
          owner_name: p.profiles?.full_name || p.owner_name || 'Community Innovator',
          owner_avatar: p.profiles?.avatar_url || p.owner_avatar || '',
          readiness_score: p.validation_score || p.readiness_score || 75
        };
        return res.json({ success: true, data: formatted });
      }
    }
    res.status(404).json({ success: false, error: "Project not found" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/projects — Create and persist a new project to PostgreSQL database
app.post("/api/projects", async (req, res) => {
  try {
    const payload = req.body || {};
    let ownerId = payload.owner_id;
    const isValidUuid = (str) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
    if (!isValidUuid(ownerId)) {
      const profRes = await supabaseFetch("/profiles?select=id&limit=1");
      if (profRes.ok) {
        const profs = await profRes.json();
        if (profs && profs.length > 0) ownerId = profs[0].id;
      }
    }

    const projectRecord = {
      owner_id: ownerId || "00000000-0000-0000-0000-000000000001",
      title: payload.title || "Untitled Innovation",
      project_type: payload.project_type || "idea",
      category: payload.category || "Technology",
      problem_title: payload.problem_title || payload.title,
      problem_description: payload.problem_description || payload.problem_title,
      solution_description: payload.solution_description || "",
      target_audience: payload.target_audience || "Early Adopters",
      value_proposition: payload.value_proposition || "",
      differentiation: payload.differentiation || "",
      live_url: payload.live_url || null,
      github_url: payload.github_url || null,
      demo_url: payload.demo_url || null,
      cover_image_url: payload.cover_image_url || null,
      status: payload.status || "under_review",
      validation_status: payload.validation_status || "idea",
      visibility: payload.visibility || "public",
      current_version: payload.current_version || 1,
      validation_score: payload.readiness_score || 70
    };

    const insertRes = await supabaseFetch("/projects", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify(projectRecord)
    });

    if (insertRes.ok) {
      const inserted = await insertRes.json();
      const created = Array.isArray(inserted) ? inserted[0] : inserted;

      if (payload.tags && Array.isArray(payload.tags) && created?.id) {
        for (const tag of payload.tags) {
          await supabaseFetch("/project_tags", {
            method: "POST",
            body: JSON.stringify({ project_id: created.id, tag })
          });
        }
      }

      return res.json({ success: true, data: created });
    }

    const errText = await insertRes.text();
    res.status(400).json({ success: false, error: errText });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/projects/:id — Update project in PostgreSQL database
app.put("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...(req.body || {}) };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date().toISOString();

    const updateRes = await supabaseFetch(`/projects?id=eq.${id}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(updates)
    });

    if (updateRes.ok) {
      const data = await updateRes.json();
      return res.json({ success: true, data: data[0] });
    }
    const errText = await updateRes.text();
    res.status(400).json({ success: false, error: errText });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/projects/:id — Delete project from database
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await supabaseFetch(`/projects?id=eq.${id}`, {
      method: "DELETE"
    });
    if (delRes.ok) {
      return res.json({ success: true, message: "Project deleted successfully" });
    }
    res.status(400).json({ success: false, error: await delRes.text() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reviews — Retrieve community reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const { projectId } = req.query;
    const endpoint = projectId 
      ? `/reviews?project_id=eq.${projectId}&select=*,profiles:reviewer_id(full_name,avatar_url)&order=created_at.desc`
      : `/reviews?select=*,profiles:reviewer_id(full_name,avatar_url)&order=created_at.desc&limit=50`;
    const dbRes = await supabaseFetch(endpoint);
    if (dbRes.ok) {
      const data = await dbRes.json();
      return res.json({ success: true, count: data.length, data });
    }
    res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews — Submit review to database
app.post("/api/reviews", async (req, res) => {
  try {
    const payload = req.body || {};
    const reviewRecord = {
      project_id: payload.project_id || payload.projectId,
      reviewer_id: payload.reviewer_id || payload.reviewerId || "00000000-0000-0000-0000-000000000001",
      problem_relevance: payload.problem_relevance || payload.problemRelevance || "yes",
      solution_clarity: payload.solution_clarity || payload.solutionClarity || "yes",
      usefulness: payload.usefulness || "yes",
      comment: payload.comment || payload.suggestion || "",
      review_type: payload.review_type || payload.reviewType || "constructive",
      quality_score: payload.quality_score || 5
    };

    const insertRes = await supabaseFetch("/reviews", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify(reviewRecord)
    });

    if (insertRes.ok) {
      const inserted = await insertRes.json();
      return res.json({ success: true, data: Array.isArray(inserted) ? inserted[0] : inserted });
    }
    res.status(400).json({ success: false, error: await insertRes.text() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper for Gemini AI calls
const getGeminiApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.VITE_AI_API_KEY || process.env.AI_API_KEY || "";
};

// 1. AI Research & Blueprint Generation
app.post("/api/ai-research", async (req, res) => {
  try {
    const { query } = req.body || {};
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_gemini_key_configured" });
    }

    const prompt = `You are the INNOVEXA Innovation Research & Project-Building Agent.
The user wants to research and build this exact innovation: "${query}"
Perform comprehensive research on the exact query topic above.
Provide real-world solutions, genuine research, and a realistic engineering roadmap.
Output STRICT JSON with query, overview, concept, proposed_solution, how_it_works, related_solutions, solution_comparison, comparative_insights, technologies, resources_and_tools, architecture_pipeline, implementation_phases, mvp_roadmap, improvement_opportunities, next_steps.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.2 }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ success: false, reason: "gemini_api_error" });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textContent = candidate?.content?.parts?.[0]?.text;

    let parsedJson = null;
    if (textContent) {
      const cleanText = textContent.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
      try {
        parsedJson = JSON.parse(cleanText);
      } catch (_) {
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (match) parsedJson = JSON.parse(match[0]);
      }
    }

    res.json({ success: true, data: parsedJson });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Multi-Project Comparison
app.post("/api/ai-compare", async (req, res) => {
  try {
    const { projects } = req.body || {};
    if (!projects || !Array.isArray(projects) || projects.length < 2) {
      return res.status(400).json({ success: false, error: "At least 2 projects required for comparison" });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_gemini_key_configured" });
    }

    const prompt = `You are the INNOVEXA Project Comparison Engine. Compare these projects:\n${JSON.stringify(projects, null, 2)}\nReturn strict JSON comparison with comparison_summary, criteria, common_points, differences, potential_gaps, additional_observations.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ success: false, reason: "gemini_api_error" });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Smart Validation Review Analysis
app.post("/api/ai-review-analyze", async (req, res) => {
  try {
    const { project, review } = req.body || {};
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_gemini_key_configured" });
    }

    const prompt = `You are the INNOVEXA Smart Validation Intelligence Engine.
Analyze this user review for project "${project?.title}":
Review: ${JSON.stringify(review)}
Return strict JSON with sentiment, sentiment_score, intent, topics, detected_concerns, detected_suggestions, ai_summary, actionable_improvement.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ success: false, reason: "gemini_api_error" });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Two-Pass AI Project Analyzer
app.post("/api/ai-project-analyzer", async (req, res) => {
  try {
    const { projectContext, reviews = [] } = req.body || {};
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_gemini_key_configured" });
    }

    const prompt = `You are the INNOVEXA Project Analysis Engine.
Perform full in-depth market, competitor, strengths, weaknesses, recommendations, and launch readiness analysis for:
${JSON.stringify(projectContext, null, 2)}
Reviews: ${JSON.stringify(reviews, null, 2)}
Return strict JSON report.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.2 }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ success: false, reason: "gemini_api_error" });
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    let parsedJson = null;
    if (textContent) {
      const cleanText = textContent.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
      try {
        parsedJson = JSON.parse(cleanText);
      } catch (_) {
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (match) parsedJson = JSON.parse(match[0]);
      }
    }

    res.json({ success: true, data: parsedJson });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Smart Validation Loop: Aggregated Project Insights & Clustering
app.post("/api/ai-validation-aggregate", async (req, res) => {
  try {
    const { project, reviews, individualAnalyses } = req.body || {};
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_gemini_key_configured" });
    }

    const totalReviewsCount = Array.isArray(reviews) ? reviews.length : 0;
    const reviewsContext = (reviews || []).slice(0, 50).map((r, idx) => {
      const analysis = (individualAnalyses || []).find((a) => a.review_id === r.id);
      return `Review #${idx + 1}:
- Reaction: ${r.first_reaction || 'N/A'} | Relevance: ${r.problem_relevance || 'N/A'} | Value: ${r.solution_value || 'N/A'}
- Improvements Selected: ${(r.selected_improvements || []).join(', ') || 'None'}
- Comment: "${r.comment || r.suggestion || 'No comment'}"
- Follow-up: "${r.follow_up_reason || 'N/A'}"
- AI Extracted Concerns: ${(analysis?.detected_concerns || []).join('; ') || 'None'}
- AI Extracted Suggestions: ${(analysis?.detected_suggestions || []).join('; ') || 'None'}`;
    }).join('\n\n');

    const prompt = `You are the INNOVEXA Chief Validation Analyst.
Analyze aggregated community validation reviews for this project and produce actionable clusters and prioritized improvement recommendations.
PROJECT:
- Title: ${project?.title || 'Project'}
- Category: ${project?.category || 'Technology'}
- Problem: ${project?.problem_description || project?.problem_title || ''}
- Solution: ${project?.solution_description || ''}
- Target Audience: ${project?.target_audience || ''}

TOTAL REVIEWS: ${totalReviewsCount}
ALL RECENT REVIEWS:
${reviewsContext || 'No reviews available yet.'}

Return strict JSON conforming to:
{
  "positive_percentage": 75,
  "neutral_percentage": 15,
  "negative_percentage": 10,
  "problem_relevance_rate": 82,
  "solution_interest_rate": 78,
  "top_positive_signals": ["High problem relevance validated by target audience", "Clear value proposition"],
  "top_concerns": [{ "concern": "Onboarding friction", "mention_count": 5 }],
  "top_suggestions": [{ "suggestion": "Provide quick start templates", "mention_count": 6 }],
  "feedback_clusters": [{ "category": "UX & Onboarding", "mention_count": 7, "summary": "Multiple users requested guided templates", "sample_quotes": ["Setup took too many steps"], "sentiment": "neutral" }],
  "improvement_recommendations": [{ "title": "Streamline Onboarding", "description": "Reduce setup friction", "reason": "Feedback signals", "source_review_count": 7, "priority": "high", "cluster_category": "UX & Onboarding" }],
  "validation_summary": "Community validation shows strong interest in the core problem statement.",
  "next_steps": ["Implement onboarding wizard", "Publish roadmap"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ success: false, reason: "gemini_api_error" });
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = textContent ? JSON.parse(textContent) : null;
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. AI Semantic Project Search Engine
app.post("/api/ai-search", async (req, res) => {
  try {
    const { query, results } = req.body || {};
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_gemini_key_configured" });
    }

    const prompt = `You are the INNOVEXA AI Search Synthesis Agent.
Summarize the retrieved community innovation projects for query "${query}".
Retrieved innovations:
${JSON.stringify(results || [], null, 2)}

Return strict JSON conforming to:
{
  "summary": "2-3 sentence overview of findings for this query",
  "key_topics": ["topic1", "topic2"],
  "common_technologies": ["tech1", "tech2"],
  "common_approaches": ["approach1", "approach2"],
  "potential_gaps": ["gap1", "gap2"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ success: false, reason: "gemini_api_error" });
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = textContent ? JSON.parse(textContent) : null;
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dynamic Render Port binding
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
