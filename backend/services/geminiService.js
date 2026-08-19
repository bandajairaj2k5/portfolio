/**
 * NARADH Gemini AI Routing Engine Service
 * Executes backend prompt analysis using Google Gemini REST API.
 * Uses process.env.GEMINI_API_KEY securely on the server.
 */

const { PLATFORMS } = require('../config/platforms');

const CANDIDATE_MODELS = [
  process.env.GEMINI_ROUTER_MODEL || 'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Route prompt using Gemini API with structured output schema validation
 */
async function routePromptWithGemini(prompt, mode = 'quick', effort = 'low') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_SERVER_GEMINI_API_KEY_HERE') {
    // If no server API key is configured, fallback to rule-based capability engine
    return fallbackCapabilityRouting(prompt, mode, effort, "Server GEMINI_API_KEY not configured. Used rule-based heuristic classifier.");
  }

  let systemInstruction = "";

  if (mode === 'quick') {
    systemInstruction = `You are NARADH, an expert AI task classification router. Analyze the user prompt and recommend the single best AI platform out of these 8 available platforms:

1. claude: Best for complex coding, long-form writing, software architecture, step-by-step reasoning.
2. chatgpt: Best for general reasoning, brainstorming, creative ideation, multimodal analysis, conversational tasks.
3. gemini: Best for huge documents, Google Workspace synthesis, Google ecosystem tasks, massive context handling.
4. perplexity: Best for live web research with citations, factual lookup, news, current events.
5. deepseek: Best for coding and math on a budget, complex algorithmic reasoning.
6. kimi: Best for reading very long documents / long-context PDF summaries.
7. indus: Best for Indian-language tasks, Indic text/translation/culture, local-context tasks.
8. grok: Best for real-time X/Twitter trends, live social commentary, casual unfiltered tone.

Effort Level requested: ${effort.toUpperCase()}.

Select the single best platform ID. Return STRICT JSON ONLY matching this schema:
{
  "platform": "<one of: claude, chatgpt, gemini, perplexity, deepseek, kimi, indus, grok>",
  "category": "<2-3 word category label>",
  "confidence": <number between 0.0 and 1.0>,
  "reason": "<one concise sentence explaining why this platform is the optimal choice>",
  "factors": ["<key factor 1>", "<key factor 2>"]
}`;
  } else { // Project mode
    systemInstruction = `You are NARADH, an expert AI project router. The user wants to start a multi-step end-to-end project.
Select ONE generalist platform capable of owning an entire multi-step project context end-to-end.
FAVOR main generalist platforms: claude, chatgpt, gemini, deepseek.
DO NOT pick narrow single-turn tools like perplexity, grok, kimi, or indus.

Options:
1. claude: Best for complex coding projects, software architecture, long-form technical writing.
2. chatgpt: Best for general project orchestration, product design, creative strategy, multimodal workflows.
3. gemini: Best for document-heavy projects, Google Workspace integrated projects, massive context handling.
4. deepseek: Best for heavy math, backend algorithms, cost-effective coding projects.

Effort Level requested: ${effort.toUpperCase()}.

Return STRICT JSON ONLY matching this schema:
{
  "platform": "<one of: claude, chatgpt, gemini, deepseek>",
  "category": "<2-3 word project domain>",
  "confidence": <number between 0.0 and 1.0>,
  "reason": "<one concise sentence explaining why this platform can anchor the multi-step project context>",
  "factors": ["<key factor 1>", "<key factor 2>"]
}`;
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  let responseData = null;
  let lastError = null;

  // Try candidate models in fallback order
  for (const modelName of CANDIDATE_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    // Set 10-second timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        responseData = await response.json();
        break;
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson.error?.message || `HTTP ${response.status} on ${modelName}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  if (!responseData) {
    console.warn("Gemini API call failed, using heuristic fallback classifier:", lastError?.message);
    return fallbackCapabilityRouting(prompt, mode, effort, `AI service fallback: ${lastError?.message || 'Provider unavailable'}`);
  }

  const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    return fallbackCapabilityRouting(prompt, mode, effort, "Empty response from AI provider.");
  }

  // Parse and validate structured JSON
  try {
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);
    return validateAndNormalizeRoutingResult(parsed, prompt, mode, effort);
  } catch (err) {
    console.error("JSON parsing error on Gemini response:", err);
    return fallbackCapabilityRouting(prompt, mode, effort, "AI returned unstructured output.");
  }
}

/**
 * Validate & Normalize JSON output from Gemini
 */
function validateAndNormalizeRoutingResult(result, prompt, mode, effort) {
  let platformId = (result.platform || '').toLowerCase().trim();

  // Enforce valid platform ID
  if (!PLATFORMS[platformId]) {
    platformId = fallbackCapabilityRouting(prompt, mode, effort).platform;
  }

  // Enforce project mode restrictions (generalist platform only)
  if (mode === 'project' && !PLATFORMS[platformId].projectCapable) {
    platformId = 'claude';
  }

  const category = (typeof result.category === 'string' && result.category.trim())
    ? result.category.trim()
    : (mode === 'project' ? 'Software Project' : 'Task Analysis');

  const reason = (typeof result.reason === 'string' && result.reason.trim())
    ? result.reason.trim()
    : `${PLATFORMS[platformId].name} is optimal for this ${category.toLowerCase()} request.`;

  const confidence = (typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1)
    ? Math.round(result.confidence * 100) / 100
    : 0.90;

  const factors = Array.isArray(result.factors) ? result.factors.map(f => String(f).trim()) : [];

  return {
    platform: platformId,
    category: category,
    confidence: confidence,
    reason: reason,
    factors: factors
  };
}

/**
 * Deterministic Heuristic Capability Routing Fallback
 * Used if Gemini API key is unconfigured, rate-limited, or unavailable
 */
function fallbackCapabilityRouting(prompt, mode, effort, note = "") {
  const p = prompt.toLowerCase();
  let selected = "chatgpt";
  let category = "General Task";
  let reason = "ChatGPT provides versatile general reasoning.";

  if (p.includes("code") || p.includes("script") || p.includes("python") || p.includes("c ") || p.includes("cpp") || p.includes("debug") || p.includes("refactor") || p.includes("reverse an array") || p.includes("algorithm")) {
    selected = mode === 'project' ? "claude" : "deepseek";
    category = "Software Engineering";
    reason = `${PLATFORMS[selected].name} offers top-tier algorithmic reasoning and precise code generation.`;
  } else if (p.includes("pdf") || p.includes("page") || p.includes("document") || p.includes("book") || p.includes("workspace") || p.includes("google")) {
    selected = "gemini";
    category = "Document Analysis";
    reason = "Gemini handles massive documents and long context effortlessly.";
  } else if (p.includes("paper") || p.includes("research") || p.includes("news") || p.includes("search") || p.includes("latest") || p.includes("semiconductor") || p.includes("trend")) {
    selected = mode === 'project' ? "chatgpt" : "perplexity";
    category = "Web Research";
    reason = "Perplexity retrieves live web information with verifiable citations.";
  } else if (p.includes("hindi") || p.includes("indic") || p.includes("india") || p.includes("tamil") || p.includes("marathi")) {
    selected = "indus";
    category = "Indic Language";
    reason = "Indus specializes in Indian-language nuance and local cultural context.";
  } else if (p.includes("x ") || p.includes("twitter") || p.includes("trend") || p.includes("viral")) {
    selected = "grok";
    category = "Real-time Trends";
    reason = "Grok accesses real-time X social data and current events.";
  }

  if (mode === 'project' && !PLATFORMS[selected].projectCapable) {
    selected = "claude";
    category = "Multi-step Project";
    reason = "Claude is selected to maintain long-term multi-step project context.";
  }

  return {
    platform: selected,
    category: category,
    confidence: 0.88,
    reason: note ? `${reason} (${note})` : reason,
    factors: ["Heuristic intent score", "Platform capability matrix match"]
  };
}

module.exports = {
  routePromptWithGemini,
  fallbackCapabilityRouting
};
