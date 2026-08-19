/**
 * NARADH — Personal AI Task Router (Frontend Application Controller)
 * Architecture: Clean, Event-Driven, Secure Single-Page Application
 * Zero unescaped innerHTML injections — textContent DOM updates.
 */

/* ==========================================================================
   APP STATE
   ========================================================================== */
const state = {
  user: null, // Authenticated Google Profile { id, googleId, email, name, picture }
  activeProject: null, // Active Project Domain Model
  projects: [], // List of user's projects
  history: [], // User's routing history
  platforms: {}, // Platform capability matrix
  mode: 'quick', // 'quick' | 'project'
  effort: 'low', // 'low' | 'medium' | 'high'
  workspaceTag: localStorage.getItem('naradh_workspace_tag') || 'Default Workspace',
  currentRouteResult: null
};

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM (Replaces alert)
   ========================================================================== */
const Toast = {
  container: null,

  init() {
    let el = document.getElementById('toastContainer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toastContainer';
      el.className = 'toast-container';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    this.container = el;
  },

  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, duration);
    }
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 6000); },
  warning(msg) { this.show(msg, 'warning', 5000); },
  info(msg) { this.show(msg, 'info'); }
};

/* ==========================================================================
   ACCESSIBLE CONFIRMATION MODAL SYSTEM (Replaces confirm)
   ========================================================================== */
const Modal = {
  confirm(title, message, confirmText = 'Confirm', danger = false) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      const card = document.createElement('div');
      card.className = 'modal-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');

      const titleEl = document.createElement('div');
      titleEl.className = 'modal-title';
      titleEl.textContent = title;
      card.appendChild(titleEl);

      const bodyEl = document.createElement('div');
      bodyEl.className = 'modal-body';
      bodyEl.textContent = message;
      card.appendChild(bodyEl);

      const actions = document.createElement('div');
      actions.className = 'modal-actions';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = () => {
        overlay.remove();
        resolve(false);
      };

      const confirmBtn = document.createElement('button');
      confirmBtn.className = danger ? 'btn btn-danger' : 'btn btn-primary';
      confirmBtn.textContent = confirmText;
      confirmBtn.onclick = () => {
        overlay.remove();
        resolve(true);
      };

      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      card.appendChild(actions);

      overlay.appendChild(card);
      document.body.appendChild(overlay);

      confirmBtn.focus();
    });
  }
};

/* ==========================================================================
   API CLIENT WRAPPER (Fetch with HttpOnly Cookies)
   ========================================================================== */
async function apiFetch(endpoint, options = {}) {
  options.credentials = 'include';
  options.headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.code = data.error?.code || 'API_ERROR';
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (fetchErr) {
    // If backend API is un-reachable (e.g. running on static live server or static host)
    if (endpoint === '/api/platforms') {
      return { platforms: getStaticPlatformsFallback() };
    }
    if (endpoint === '/api/config') {
      return { googleClientId: '', environment: 'client' };
    }
    if (endpoint === '/api/auth/me') {
      throw new Error('Not authenticated');
    }
    if (endpoint === '/api/route' && options.body) {
      const body = JSON.parse(options.body);
      return getClientRouteFallback(body.prompt, body.mode, body.effort);
    }
    throw fetchErr;
  }
}

function getStaticPlatformsFallback() {
  return {
    claude: { id: "claude", name: "Claude", url: "https://claude.ai", description: "Coding, long-form writing, step-by-step reasoning", projectCapable: true, researchCapable: false, longContextCapable: true },
    chatgpt: { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", description: "General reasoning, brainstorming, multimodal", projectCapable: true, researchCapable: true, longContextCapable: true },
    gemini: { id: "gemini", name: "Gemini", url: "https://gemini.google.com", description: "Huge documents, Google Workspace synthesis", projectCapable: true, researchCapable: true, longContextCapable: true },
    perplexity: { id: "perplexity", name: "Perplexity", url: "https://perplexity.ai", description: "Live web research with citations, news", projectCapable: false, researchCapable: true, longContextCapable: false },
    deepseek: { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com", description: "Coding & math logic on a budget", projectCapable: true, researchCapable: false, longContextCapable: false },
    kimi: { id: "kimi", name: "Kimi", url: "https://kimi.com", description: "Long document reading & PDF summaries", projectCapable: false, researchCapable: false, longContextCapable: true },
    indus: { id: "indus", name: "Indus", url: "https://indus.sarvam.ai", description: "Indian-language tasks & Indic context", projectCapable: false, researchCapable: false, longContextCapable: false },
    grok: { id: "grok", name: "Grok", url: "https://grok.com", description: "Real-time X trends & casual commentary", projectCapable: false, researchCapable: true, longContextCapable: false }
  };
}

function getClientRouteFallback(prompt, mode, effort) {
  const p = (prompt || '').toLowerCase();
  let selected = "chatgpt";
  let category = "General Task";
  let reason = "ChatGPT provides versatile general reasoning.";

  if (p.includes("code") || p.includes("script") || p.includes("python") || p.includes("c ") || p.includes("debug") || p.includes("reverse")) {
    selected = mode === 'project' ? "claude" : "deepseek";
    category = "Software Engineering";
    reason = "Selected for superior algorithmic reasoning and code generation.";
  } else if (p.includes("pdf") || p.includes("document") || p.includes("page") || p.includes("summary")) {
    selected = "gemini";
    category = "Document Analysis";
    reason = "Gemini handles massive long-context documents effortlessly.";
  } else if (p.includes("research") || p.includes("search") || p.includes("news") || p.includes("latest") || p.includes("trend")) {
    selected = "perplexity";
    category = "Web Research";
    reason = "Perplexity retrieves live web information with citations.";
  }

  return {
    platform: selected,
    category: category,
    confidence: 0.90,
    reason: reason,
    factors: ["Client fallback classification"]
  };
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  Toast.init();
  initWorkspaceTag();
  await loadPlatforms();
  await checkAuthSession();
  initGoogleAuth();
});

/* ==========================================================================
   PLATFORMS & ROSTER MATRIX
   ========================================================================== */
async function loadPlatforms() {
  try {
    const res = await apiFetch('/api/platforms');
    state.platforms = res.platforms || {};
    renderRosterTable();
  } catch (err) {
    console.error("Failed to load platforms matrix:", err);
  }
}

function renderRosterTable() {
  const tbody = document.getElementById('rosterTableBody');
  if (!tbody || !state.platforms) return;

  tbody.textContent = ''; // Clear safely

  Object.values(state.platforms).forEach(p => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.className = 'platform-cell';
    tdName.textContent = p.name;
    tr.appendChild(tdName);

    const tdBestFor = document.createElement('td');
    tdBestFor.textContent = p.description;
    tr.appendChild(tdBestFor);

    const tdProj = document.createElement('td');
    const badgeProj = document.createElement('span');
    badgeProj.className = `capability-badge ${p.projectCapable ? 'cap-yes' : 'cap-no'}`;
    badgeProj.textContent = p.projectCapable ? '✓ Yes' : '✕ No';
    tdProj.appendChild(badgeProj);
    tr.appendChild(tdProj);

    const tdRes = document.createElement('td');
    const badgeRes = document.createElement('span');
    badgeRes.className = `capability-badge ${p.researchCapable ? 'cap-yes' : 'cap-no'}`;
    badgeRes.textContent = p.researchCapable ? '✓ Yes' : '✕ No';
    tdRes.appendChild(badgeRes);
    tr.appendChild(tdRes);

    const tdLong = document.createElement('td');
    const badgeLong = document.createElement('span');
    badgeLong.className = `capability-badge ${p.longContextCapable ? 'cap-yes' : 'cap-no'}`;
    badgeLong.textContent = p.longContextCapable ? '✓ Yes' : '✕ No';
    tdLong.appendChild(badgeLong);
    tr.appendChild(tdLong);

    const tdLink = document.createElement('td');
    const a = document.createElement('a');
    a.className = 'link-open';
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Open ↗';
    tdLink.appendChild(a);
    tr.appendChild(tdLink);

    tbody.appendChild(tr);
  });
}

/* ==========================================================================
   AUTHENTICATION & USER PROFILE
   ========================================================================== */
async function checkAuthSession() {
  try {
    const res = await apiFetch('/api/auth/me');
    state.user = res.user;
    updateUserUi();
    await loadUserData();
  } catch (err) {
    state.user = null;
    updateUserUi();
    renderHistory();
  }
}

async function initGoogleAuth() {
  try {
    const config = await apiFetch('/api/config');
    const clientId = config.googleClientId;

    if (window.google && google.accounts && google.accounts.id && clientId && !clientId.includes('YOUR_GOOGLE')) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: true
      });

      if (!state.user) {
        const container = document.getElementById('googleSignInBtnContainer');
        if (container) {
          container.textContent = '';
          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "medium",
            shape: "pill",
            text: "signin_with"
          });
        }
        google.accounts.id.prompt();
      }
    }
  } catch (err) {
    console.error("GIS initialization error:", err);
  }
}

async function handleGoogleCredentialResponse(response) {
  try {
    const res = await apiFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken: response.credential })
    });

    state.user = res.user;
    updateUserUi();
    Toast.success(`Welcome back, ${state.user.name}!`);
    await loadUserData();

  } catch (err) {
    console.error("Google Auth error:", err);
    Toast.error(err.message || 'Google sign-in failed.');
  }
}

async function handleLogout() {
  const confirm = await Modal.confirm("Sign Out", "Are you sure you want to sign out?");
  if (!confirm) return;

  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    state.user = null;
    state.activeProject = null;
    state.history = [];
    updateUserUi();
    renderActiveProjectBanner();
    renderHistory();
    Toast.info("Signed out successfully.");
    initGoogleAuth();
  } catch (err) {
    Toast.error("Logout failed.");
  }
}

function updateUserUi() {
  const nameEl = document.getElementById('userNameDisplay');
  const emailEl = document.getElementById('userEmailDisplay');
  const dpImg = document.getElementById('userDpImg');
  const btnContainer = document.getElementById('googleSignInBtnContainer');

  if (state.user) {
    nameEl.textContent = state.user.name;
    emailEl.textContent = state.user.email;
    dpImg.src = state.user.picture || getDefaultAvatarSvg();

    btnContainer.textContent = '';
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-secondary';
    logoutBtn.style.padding = '4px 10px';
    logoutBtn.style.fontSize = '0.75rem';
    logoutBtn.style.marginTop = '6px';
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.onclick = handleLogout;
    btnContainer.appendChild(logoutBtn);

  } else {
    nameEl.textContent = 'Guest User';
    emailEl.textContent = 'Sign in to sync history';
    dpImg.src = getDefaultAvatarSvg();
  }
}

function getDefaultAvatarSvg() {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%234F46E5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-1.04-4.83-2.61.03-1.6 3.22-2.48 4.83-2.48s4.8 1.88 4.83 2.48C15.8 18.96 14.03 20 12 20z"/></svg>`;
}

async function loadUserData() {
  if (!state.user) return;
  await Promise.all([loadUserHistory(), loadUserProjects()]);
}

/* ==========================================================================
   WORKSPACE TAG SYSTEM
   ========================================================================== */
function initWorkspaceTag() {
  const input = document.getElementById('workspaceInput');
  const display = document.getElementById('activeWorkspaceDisplay');
  if (input) input.value = state.workspaceTag;
  if (display) display.textContent = state.workspaceTag;
}

function switchWorkspaceTag() {
  const input = document.getElementById('workspaceInput');
  const tag = input.value.trim();
  if (!tag) {
    Toast.warning("Please enter a valid workspace tag.");
    return;
  }
  state.workspaceTag = tag;
  localStorage.setItem('naradh_workspace_tag', tag);
  initWorkspaceTag();
  Toast.info(`Workspace switched to: ${tag}`);
}

/* ==========================================================================
   MODE AND EFFORT SELECTION
   ========================================================================== */
function setRoutingMode(mode) {
  state.mode = mode;
  document.getElementById('modeQuickBtn').classList.toggle('active', mode === 'quick');
  document.getElementById('modeProjectBtn').classList.toggle('active', mode === 'project');
  document.getElementById('modeProjectBtn').classList.toggle('mode-project', mode === 'project');
}

function setEffort(effort) {
  state.effort = effort;
  document.getElementById('effortLowBtn').classList.toggle('active', effort === 'low');
  document.getElementById('effortMedBtn').classList.toggle('active', effort === 'medium');
  document.getElementById('effortHighBtn').classList.toggle('active', effort === 'high');
}

/* ==========================================================================
   AI ROUTING & PROMPT HANDOFF
   ========================================================================== */
async function handleRouteClick() {
  const promptInput = document.getElementById('promptInput');
  const promptText = promptInput.value.trim();

  if (!promptText) {
    Toast.warning("Please enter a prompt to route.");
    promptInput.focus();
    return;
  }

  // Handle Project Continuation Workflow if Active Project exists
  if (state.mode === 'project' && state.activeProject) {
    await handleProjectContinuation(promptText);
    return;
  }

  const routeBtn = document.getElementById('routeBtn');
  routeBtn.disabled = true;
  const originalBtnText = routeBtn.textContent;
  routeBtn.textContent = '⚡ Routing with Gemini...';

  try {
    const result = await apiFetch('/api/route', {
      method: 'POST',
      body: JSON.stringify({
        prompt: promptText,
        mode: state.mode,
        effort: state.effort
      })
    });

    displayRouteResult(result, promptText);

    // Create Project if Project Mode selected
    if (state.mode === 'project' && state.user) {
      await createNewProject(result, promptText);
    } else if (state.mode === 'project' && !state.user) {
      Toast.warning("Sign in to save and manage persistent projects.");
    }

    if (state.user) {
      await loadUserHistory();
    }

  } catch (err) {
    console.error("Routing error:", err);
    Toast.error(err.message || "Failed to route prompt.");
  } finally {
    routeBtn.disabled = false;
    routeBtn.textContent = originalBtnText;
  }
}

function displayRouteResult(result, promptText) {
  const platform = state.platforms[result.platform] || { name: result.platform, url: '#' };
  state.currentRouteResult = {
    platformId: result.platform,
    category: result.category,
    reason: result.reason,
    prompt: promptText
  };

  const nameEl = document.getElementById('resPlatformName');
  const catEl = document.getElementById('resCategoryBadge');
  const reasonEl = document.getElementById('resReasonText');
  const copyBtn = document.getElementById('copyOpenBtn');
  const factorsEl = document.getElementById('resFactorsList');

  nameEl.textContent = platform.name;
  catEl.textContent = (result.category || 'RECOMMENDED').toUpperCase();
  reasonEl.textContent = result.reason;
  copyBtn.textContent = `📋 Copy Prompt & Open ${platform.name} ↗`;

  // Render factors if present
  if (factorsEl) {
    factorsEl.textContent = '';
    if (Array.isArray(result.factors)) {
      result.factors.forEach(factor => {
        const chip = document.createElement('span');
        chip.className = 'factor-chip';
        chip.textContent = factor;
        factorsEl.appendChild(chip);
      });
    }
  }

  const card = document.getElementById('resultCard');
  card.classList.remove('hidden');
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleManualSelect(platformId) {
  if (!platformId || !state.platforms[platformId]) return;
  const promptInput = document.getElementById('promptInput');
  const promptText = promptInput.value.trim();
  const platform = state.platforms[platformId];

  const manualResult = {
    platform: platformId,
    category: "MANUAL SELECTION",
    reason: `Manually selected by user for ${platform.description.toLowerCase()}.`,
    factors: ["Manual user selection"]
  };

  displayRouteResult(manualResult, promptText);
  document.getElementById('manualSelect').value = "";
}

async function executeHandoff() {
  if (!state.currentRouteResult) return;
  const platform = state.platforms[state.currentRouteResult.platformId];
  if (!platform) return;

  const promptText = document.getElementById('promptInput').value.trim() || state.currentRouteResult.prompt;
  await copyAndOpen(promptText, platform.url);
}

async function copyAndOpen(text, url) {
  const copyBtn = document.getElementById('copyOpenBtn');
  let copySuccess = false;

  if (text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copySuccess = true;
      } else {
        // Fallback textarea execCommand
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccess = document.execCommand('copy');
        textArea.remove();
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      copySuccess = false;
    }
  }

  if (copySuccess) {
    Toast.success("Prompt copied to clipboard!");
  } else {
    Toast.warning("Could not auto-copy to clipboard. Opening platform window...");
  }

  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!openedWindow) {
    Toast.error("Popup blocked! Please allow popups to open platform in new tab.");
  }
}

/* ==========================================================================
   PROJECT MODE ARCHITECTURE & CONTINUATION
   ========================================================================== */
async function loadUserProjects() {
  if (!state.user) return;
  try {
    const res = await apiFetch('/api/projects');
    state.projects = res.projects || [];

    // Set first active project if available
    const active = state.projects.find(p => p.status === 'active');
    if (active) {
      const fullProjRes = await apiFetch(`/api/projects/${active.id}`);
      state.activeProject = fullProjRes.project;
    } else {
      state.activeProject = null;
    }
    renderActiveProjectBanner();
  } catch (err) {
    console.error("Error loading user projects:", err);
  }
}

async function createNewProject(routeResult, promptText) {
  if (!state.user) return;
  try {
    const res = await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        platform: routeResult.platform,
        title: promptText.length > 50 ? promptText.substring(0, 50) + '...' : promptText,
        initialGoal: promptText,
        category: routeResult.category,
        reasoning: routeResult.reason
      })
    });

    state.activeProject = res.project;
    renderActiveProjectBanner();
    Toast.success(`New Project thread created on ${state.platforms[routeResult.platform]?.name || routeResult.platform}!`);

  } catch (err) {
    console.error("Failed to create project:", err);
    Toast.error("Failed to save project.");
  }
}

async function handleProjectContinuation(newPromptText) {
  if (!state.activeProject) return;

  const platform = state.platforms[state.activeProject.platform];
  const confirm = await Modal.confirm(
    "Continue Active Project",
    `Add this prompt to active project thread "${state.activeProject.title}" on ${platform?.name}?`
  );

  if (!confirm) return;

  try {
    const res = await apiFetch(`/api/projects/${state.activeProject.id}/prompts`, {
      method: 'POST',
      body: JSON.stringify({ prompt: newPromptText })
    });

    if (state.activeProject.promptHistory) {
      state.activeProject.promptHistory.push(res.prompt);
    }
    renderActiveProjectBanner();
    Toast.success(`Added turn to project thread!`);
    await copyAndOpen(newPromptText, platform.url);

  } catch (err) {
    Toast.error(err.message || "Failed to update project prompt.");
  }
}

function renderActiveProjectBanner() {
  const banner = document.getElementById('projectBanner');
  if (!banner) return;

  if (state.activeProject) {
    const platform = state.platforms[state.activeProject.platform] || { name: state.activeProject.platform, url: '#' };
    
    document.getElementById('projectPlatformBadge').textContent = platform.name.toUpperCase();
    document.getElementById('projectTitle').textContent = state.activeProject.title;
    document.getElementById('projectCategory').textContent = state.activeProject.category || 'Multi-step Project';
    document.getElementById('projectReason').textContent = state.activeProject.reasoning || 'Sustains project context end-to-end.';
    document.getElementById('projectPromptSnippet').textContent = state.activeProject.initialGoal;

    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

async function openActiveProjectPlatform() {
  if (!state.activeProject) return;
  const platform = state.platforms[state.activeProject.platform];
  if (!platform) return;

  const currentInput = document.getElementById('promptInput').value.trim();
  const textToCopy = currentInput || state.activeProject.initialGoal;

  await copyAndOpen(textToCopy, platform.url);
}

async function endProject() {
  if (!state.activeProject) return;

  const confirm = await Modal.confirm(
    "End Active Project",
    `Are you sure you want to mark project "${state.activeProject.title}" as completed?`,
    "End Project",
    true
  );

  if (!confirm) return;

  try {
    await apiFetch(`/api/projects/${state.activeProject.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    });

    state.activeProject = null;
    renderActiveProjectBanner();
    Toast.info("Project completed.");
    await loadUserProjects();
  } catch (err) {
    Toast.error("Failed to update project.");
  }
}

/* ==========================================================================
   USER ROUTING HISTORY
   ========================================================================== */
async function loadUserHistory() {
  if (!state.user) {
    state.history = [];
    renderHistory();
    return;
  }
  try {
    const res = await apiFetch('/api/history');
    state.history = res.history || [];
    renderHistory();
  } catch (err) {
    console.error("Error loading user history:", err);
  }
}

function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;

  container.textContent = ''; // Clear DOM safely

  if (!state.user) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '🔒 Sign in with Google to view and sync your persistent routing history.';
    container.appendChild(empty);
    return;
  }

  if (state.history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No past routing history recorded yet. Route your first prompt!';
    container.appendChild(empty);
    return;
  }

  state.history.forEach(item => {
    const platform = state.platforms[item.platform] || { name: item.platform, url: '#' };
    
    const div = document.createElement('div');
    div.className = 'history-item';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'history-info';

    const metaDiv = document.createElement('div');
    metaDiv.className = 'history-meta';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.style.background = 'var(--accent-indigo-bg)';
    badge.style.color = 'var(--accent-indigo)';
    badge.style.border = '1px solid var(--accent-indigo-border)';
    badge.textContent = platform.name;
    metaDiv.appendChild(badge);

    const catSpan = document.createElement('span');
    catSpan.style.color = 'var(--text-muted)';
    catSpan.style.fontWeight = '600';
    catSpan.textContent = item.category;
    metaDiv.appendChild(catSpan);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'history-time';
    timeSpan.textContent = `• ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    metaDiv.appendChild(timeSpan);

    infoDiv.appendChild(metaDiv);

    const promptDiv = document.createElement('div');
    promptDiv.className = 'history-prompt';
    promptDiv.textContent = item.prompt;
    infoDiv.appendChild(promptDiv);

    div.appendChild(infoDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'history-actions';

    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.style.padding = '4px 10px';
    btn.style.fontSize = '0.78rem';
    btn.textContent = 'Copy & Open ↗';
    btn.onclick = () => copyAndOpen(item.prompt, platform.url);
    actionsDiv.appendChild(btn);

    div.appendChild(actionsDiv);
    container.appendChild(div);
  });
}

async function clearHistory() {
  if (!state.user) {
    Toast.warning("Sign in to manage your history.");
    return;
  }

  const confirm = await Modal.confirm(
    "Clear Routing History",
    "Are you sure you want to clear all your routing history entries?",
    "Clear History",
    true
  );

  if (!confirm) return;

  try {
    await apiFetch('/api/history', { method: 'DELETE' });
    state.history = [];
    renderHistory();
    Toast.info("Routing history cleared.");
  } catch (err) {
    Toast.error("Failed to clear history.");
  }
}
