/**
 * NARADH Platform Registry & Capabilities Matrix
 * Platform capabilities are heuristic routing weights (0.0 to 1.0) used by the engine.
 */

const PLATFORMS = {
  claude: {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai",
    description: "Best for complex coding, long-form writing, careful step-by-step reasoning",
    capabilities: {
      coding: 0.95,
      reasoning: 0.96,
      longContext: 0.90,
      webResearch: 0.60,
      multimodal: 0.85,
      creativeWriting: 0.95,
      localIndic: 0.50,
      realtimeX: 0.30
    },
    projectCapable: true,
    researchCapable: false,
    longContextCapable: true,
    multimodalCapable: true
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    description: "Best for general reasoning, brainstorming, multimodal workflows, conversational tasks",
    capabilities: {
      coding: 0.90,
      reasoning: 0.92,
      longContext: 0.82,
      webResearch: 0.80,
      multimodal: 0.95,
      creativeWriting: 0.92,
      localIndic: 0.65,
      realtimeX: 0.50
    },
    projectCapable: true,
    researchCapable: true,
    longContextCapable: true,
    multimodalCapable: true
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com",
    description: "Best for huge documents, Google Workspace synthesis, massive context handling",
    capabilities: {
      coding: 0.88,
      reasoning: 0.88,
      longContext: 0.98,
      webResearch: 0.88,
      multimodal: 0.96,
      creativeWriting: 0.85,
      localIndic: 0.70,
      realtimeX: 0.60
    },
    projectCapable: true,
    researchCapable: true,
    longContextCapable: true,
    multimodalCapable: true
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    url: "https://perplexity.ai",
    description: "Best for live web research with citations, factual lookup, news & current events",
    capabilities: {
      coding: 0.70,
      reasoning: 0.80,
      longContext: 0.70,
      webResearch: 0.98,
      multimodal: 0.75,
      creativeWriting: 0.60,
      localIndic: 0.60,
      realtimeX: 0.80
    },
    projectCapable: false,
    researchCapable: true,
    longContextCapable: false,
    multimodalCapable: false
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
    description: "Best for coding and math on a budget, complex algorithmic reasoning",
    capabilities: {
      coding: 0.96,
      reasoning: 0.95,
      longContext: 0.80,
      webResearch: 0.50,
      multimodal: 0.40,
      creativeWriting: 0.70,
      localIndic: 0.40,
      realtimeX: 0.20
    },
    projectCapable: true,
    researchCapable: false,
    longContextCapable: false,
    multimodalCapable: false
  },
  kimi: {
    id: "kimi",
    name: "Kimi",
    url: "https://kimi.com",
    description: "Best for reading very long documents / long-context PDF summaries",
    capabilities: {
      coding: 0.75,
      reasoning: 0.80,
      longContext: 0.96,
      webResearch: 0.65,
      multimodal: 0.60,
      creativeWriting: 0.75,
      localIndic: 0.40,
      realtimeX: 0.30
    },
    projectCapable: false,
    researchCapable: false,
    longContextCapable: true,
    multimodalCapable: false
  },
  indus: {
    id: "indus",
    name: "Indus",
    url: "https://indus.sarvam.ai",
    description: "Best for Indian-language & local-context tasks, Indic text and voice",
    capabilities: {
      coding: 0.60,
      reasoning: 0.70,
      longContext: 0.60,
      webResearch: 0.60,
      multimodal: 0.70,
      creativeWriting: 0.80,
      localIndic: 0.98,
      realtimeX: 0.40
    },
    projectCapable: false,
    researchCapable: false,
    longContextCapable: false,
    multimodalCapable: false
  },
  grok: {
    id: "grok",
    name: "Grok",
    url: "https://grok.com",
    description: "Best for real-time X/Twitter trends, live social commentary, casual unfiltered tone",
    capabilities: {
      coding: 0.80,
      reasoning: 0.82,
      longContext: 0.65,
      webResearch: 0.85,
      multimodal: 0.80,
      creativeWriting: 0.85,
      localIndic: 0.40,
      realtimeX: 0.98
    },
    projectCapable: false,
    researchCapable: true,
    longContextCapable: false,
    multimodalCapable: false
  }
};

module.exports = { PLATFORMS };
