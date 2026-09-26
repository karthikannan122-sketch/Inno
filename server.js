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

// Root Health Check Route (for Render & Monitoring)
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

// Render-provided PORT with 0.0.0.0 host binding
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
