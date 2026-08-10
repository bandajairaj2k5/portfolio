/* ============================================================
   TERMINAL.JS — Animated hero terminal boot sequence
   Types out lines one-by-one with a blinking cursor.
   ============================================================ */

(function () {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { text: '> Initializing portfolio...', cls: 'term-prompt' },
    { text: '> ESP32 detected ✓', cls: 'term-ok' },
    { text: '> Sensors online ✓', cls: 'term-ok' },
    { text: '> Communication established ✓', cls: 'term-ok' },
    { text: '> Coffee level: questionable', cls: 'term-warn' },
    { text: '> Engineer ready.', cls: 'term-info' }
  ];

  // Respect reduced motion — print all at once if user prefers reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    lines.forEach(l => {
      const div = document.createElement('div');
      div.className = 'term-line ' + l.cls;
      div.textContent = l.text;
      body.appendChild(div);
    });
    return;
  }

  let i = 0;
  function nextLine() {
    if (i >= lines.length) {
      // Add persistent blinking cursor at end
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      body.appendChild(cursor);
      return;
    }
    const line = lines[i];
    const div = document.createElement('div');
    div.className = 'term-line ' + line.cls;
    body.appendChild(div);

    // Typewriter effect per line
    let charIdx = 0;
    const fullText = line.text;
    div.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    div.appendChild(cursor);

    const typeInterval = setInterval(() => {
      charIdx++;
      div.textContent = fullText.slice(0, charIdx);
      div.appendChild(cursor);
      if (charIdx >= fullText.length) {
        clearInterval(typeInterval);
        i++;
        setTimeout(nextLine, 300);
      }
    }, 35);
  }

  // Start after a short delay
  setTimeout(nextLine, 600);
})();
