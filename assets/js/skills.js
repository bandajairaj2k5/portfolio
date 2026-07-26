/* ============================================================
   SKILLS.JS — Renders skill category cards
   ============================================================ */

(function () {
  const grid = document.getElementById('skillsGrid');
  if (!grid || typeof SKILLS === 'undefined') return;

  SKILLS.forEach((cat, idx) => {
    const el = document.createElement('div');
    el.className = 'skill-category reveal';
    el.style.transitionDelay = (idx * 0.08) + 's';

    const itemsHTML = cat.items.map(item => `<span class="skill-item">${item}</span>`).join('');

    el.innerHTML = `
      <div class="skill-cat-header">
        <div class="skill-cat-icon">${cat.icon}</div>
        <div class="skill-cat-name">${cat.category}</div>
      </div>
      <div class="skill-items">${itemsHTML}</div>
    `;

    grid.appendChild(el);
  });
})();
