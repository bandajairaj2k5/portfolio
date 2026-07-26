/* ============================================================
   LAB.JS — Renders The Lab workbench modules + detail display
   ============================================================ */

(function () {
  const container = document.getElementById('labModules');
  const display = document.getElementById('labDisplay');
  if (!container || !display || typeof LAB_MODULES === 'undefined') return;

  LAB_MODULES.forEach((m, idx) => {
    const el = document.createElement('div');
    el.className = 'lab-module reveal';
    el.style.transitionDelay = (idx * 0.05) + 's';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Inspect ' + m.name);

    el.innerHTML = `
      <div class="lab-module-icon">${m.icon}</div>
      <div class="lab-module-name">${m.name}</div>
      <div class="lab-module-status">
        <span class="status-dot status-${m.statusType}"></span> ${m.status}
      </div>
    `;

    el.addEventListener('click', () => showDetail(m));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showDetail(m);
      }
    });

    container.appendChild(el);
  });

  function showDetail(m) {
    // Mark active
    document.querySelectorAll('.lab-module').forEach(el => el.classList.remove('active'));
    event && event.currentTarget && event.currentTarget.classList.add('active');

    const skillsHTML = m.skills.map(s => `<span class="tech-tag">${s}</span>`).join('');
    const relatedHTML = m.related.map(r => `<span class="lab-detail-link" data-project="${r}">${r}</span>`).join('');

    display.innerHTML = `
      <div class="lab-detail">
        <div class="lab-detail-header">
          <div class="lab-detail-icon">${m.icon}</div>
          <div>
            <div class="lab-detail-name">${m.name}</div>
            <div class="lab-detail-status"><span class="status-dot status-${m.statusType}"></span> ${m.status}</div>
          </div>
        </div>
        <div class="lab-detail-section">
          <h4>// WHAT IT'S USED FOR</h4>
          <p>${m.used}</p>
        </div>
        <div class="lab-detail-section">
          <h4>// CAPABILITIES</h4>
          <div class="pm-tags">${skillsHTML}</div>
        </div>
        <div class="lab-detail-section">
          <h4>// RELATED PROJECTS</h4>
          <div class="lab-detail-links">${relatedHTML}</div>
        </div>
      </div>
    `;

    // Click related project links to open project modal
    display.querySelectorAll('.lab-detail-link').forEach(link => {
      link.addEventListener('click', () => {
        const name = link.getAttribute('data-project');
        if (typeof PROJECTS !== 'undefined') {
          const proj = PROJECTS.find(p => p.title === name);
          if (proj && window.openProjectByName) window.openProjectByName(proj.id);
        }
      });
    });
  }
})();
