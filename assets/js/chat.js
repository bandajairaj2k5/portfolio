/* ============================================================
   CHAT.JS — AI Portfolio Assistant UI + API call
   Calls /api/chat serverless function (Gemini).
   Falls back to local FAQ if the API is unavailable.
   ============================================================ */

(function () {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const messages = document.getElementById('chatMessages');
  const suggestions = document.getElementById('chatSuggestions');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  const SUGGESTED = [
    "What has Jairaj built?",
    "Does he know ESP32?",
    "Tell me about his RC car.",
    "Which project demonstrates IoT skills?",
    "What technologies does Jairaj work with?",
    "Is Jairaj familiar with ROS 2?",
    "Give me a 30-second recruiter summary of Jairaj."
  ];

  const LOADING_MESSAGES = [
    "Thinking at approximately 240 MHz...",
    "Compiling response...",
    "Querying sensor array...",
    "Establishing communication..."
  ];

  let history = [];

  // Welcome message
  addBot("Hi \u{1F44B} I know about Jairaj's projects, skills and engineering background. Ask me something.");

  // Render suggestions
  SUGGESTED.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'chat-suggestion';
    btn.textContent = q;
    btn.addEventListener('click', () => {
      input.value = q;
      form.requestSubmit();
    });
    suggestions.appendChild(btn);
  });

  // Toggle panel
  fab.addEventListener('click', () => {
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('open'));
    fab.style.display = 'none';
    setTimeout(() => input.focus(), 300);
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    setTimeout(() => { panel.hidden = true; }, 300);
    fab.style.display = '';
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addUser(text);
    input.value = '';
    suggestions.style.display = 'none';

    // Loading message
    const loadMsg = addBot(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)], true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, history })
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      loadMsg.remove();

      if (data.fallback) {
        addBot(data.answer + "\n\n\u26A0 (Running in offline FAQ mode — answers may be limited.)");
      } else {
        addBot(data.answer);
      }

      history.push({ role: 'user', text });
      history.push({ role: 'assistant', text: data.answer });
    } catch (err) {
      loadMsg.remove();
      addBot("I'm having trouble reaching my AI backend right now. Try the suggested questions, or reach out to Jairaj directly via the contact section.");
    }
  });

  function addUser(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg user';
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function addBot(text, isLoading) {
    const el = document.createElement('div');
    el.className = 'chat-msg bot' + (isLoading ? ' loading' : '');
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }
})();
