/* ============================================================
   PROJECTS.JS — Renders project cards + opens detail modal
   ============================================================ */

(function () {
  const grid = document.getElementById('projectGrid');
  if (!grid || typeof PROJECTS === 'undefined') return;

  // Render cards
  PROJECTS.forEach((p, idx) => {
    const card = document.createElement('article');
    card.className = 'project-card reveal';
    card.style.transitionDelay = (idx * 0.1) + 's';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Open project: ' + p.title);

    const imgHTML = p.image
      ? `<img src="${p.image}" alt="${p.title}" loading="lazy" />`
      : `<div class="project-img-placeholder">[ PROJECT IMAGE PENDING ]<br/>assets/projects/${p.id}.jpg</div>`;

    const tagsHTML = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

    card.innerHTML = `
      <div class="project-card-img">
        ${imgHTML}
        <span class="project-card-status">${p.status}</span>
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-desc">${p.short}</p>
        <div class="project-card-tags">${tagsHTML}</div>
        <div class="project-card-footer">
          <span class="project-card-explore">Explore Project</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openProject(p));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProject(p);
      }
    });

    grid.appendChild(card);
  });

  // Re-trigger reveal observer for new cards
  if (window.RevealRefresh) window.RevealRefresh();

  // Modal
  const overlay = document.getElementById('projectModal');
  const modalBody = document.getElementById('projectModalBody');
  const closeBtn = document.getElementById('projectModalClose');

  function openProject(p) {
    const tagsHTML = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const hwHTML = p.hardware.map(h => `<span class="tech-tag">${h}</span>`).join('');
    const swHTML = p.software.map(s => `<span class="tech-tag">${s}</span>`).join('');
    const archHTML = p.architecture.map((node, i) => {
      const arrow = i < p.architecture.length - 1 ? '<span class="pm-arch-arrow">→</span>' : '';
      return `<span class="pm-arch-node">${node}</span>${arrow}`;
    }).join('');
    const timelineHTML = p.howItWorks.map(t => `
      <div class="pm-timeline-item">
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
      </div>
    `).join('');

    const circuitHTML = p.circuitDiagram
      ? `<img src="${p.circuitDiagram}" alt="Circuit diagram for ${p.title}" loading="lazy" style="width:100%;border-radius:var(--radius-sm);border:1px solid var(--border);" />`
      : `<div class="pm-img-placeholder">[ CIRCUIT DIAGRAM PENDING ]<br/>assets/projects/${p.id}-circuit.png</div>`;

    const photosHTML = p.buildPhotos && p.buildPhotos.length
      ? p.buildPhotos.map(ph => `<img src="${ph}" alt="Build photo" loading="lazy" style="width:100%;border-radius:var(--radius-sm);margin-bottom:var(--sp-3);" />`).join('')
      : `<div class="pm-img-placeholder">[ BUILD PHOTOS PENDING ]</div>`;

    const videoHTML = p.demoVideo
      ? `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:var(--radius-sm);"><iframe src="${p.demoVideo}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe></div>`
      : `<div class="pm-img-placeholder">[ DEMO VIDEO PENDING ]</div>`;

    const githubHTML = p.github
      ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="pm-github">View on GitHub →</a>`
      : `<span class="pm-github" style="opacity:0.5;cursor:default;">[ GITHUB LINK PENDING ]</span>`;

    modalBody.innerHTML = `
      <h2>${p.title}</h2>
      <p class="pm-sub">${p.status} · ${p.tech.join(' · ')}</p>

      <div class="pm-section">
        <h3>// OVERVIEW</h3>
        <p>${p.overview}</p>
      </div>

      <div class="pm-section">
        <h3>// THE PROBLEM</h3>
        <p>${p.problem}</p>
      </div>

      <div class="pm-section">
        <h3>// MY SOLUTION</h3>
        <p>${p.solution}</p>
      </div>

      <div class="pm-section">
        <h3>// HOW IT WORKS</h3>
        <div class="pm-timeline">${timelineHTML}</div>
      </div>

      <div class="pm-section">
        <h3>// HARDWARE</h3>
        <div class="pm-tags">${hwHTML}</div>
      </div>

      <div class="pm-section">
        <h3>// SOFTWARE</h3>
        <div class="pm-tags">${swHTML}</div>
      </div>

      <div class="pm-section">
        <h3>// SYSTEM ARCHITECTURE</h3>
        <div class="pm-arch">${archHTML}</div>
      </div>

      <div class="pm-section">
        <h3>// CIRCUIT DIAGRAM</h3>
        ${circuitHTML}
      </div>

      <div class="pm-section">
        <h3>// BUILD PHOTOS</h3>
        ${photosHTML}
      </div>

      <div class="pm-section">
        <h3>// DEMO VIDEO</h3>
        ${videoHTML}
      </div>

      <div class="pm-section">
        <h3>// CHALLENGES</h3>
        <p>${p.challenges}</p>
      </div>

      <div class="pm-section">
        <h3>// RESULTS</h3>
        <p>${p.results}</p>
      </div>

      <div class="pm-section">
        <h3>// WHAT I LEARNED</h3>
        <p>${p.learned}</p>
      </div>

      <div class="pm-section">
        <h3>// TECHNOLOGIES USED</h3>
        <div class="pm-tags">${tagsHTML}</div>
      </div>

      <div class="pm-section">
        <h3>// SOURCE CODE</h3>
        ${githubHTML}
      </div>
    `;

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeProject() {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.hidden = true; }, 250);
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeProject);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeProject();
  });

  // Expose close for global Escape handler
  window.closeProjectModal = closeProject;
})();
