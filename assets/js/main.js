/* ============================================================
   MAIN.JS — Global init: footer year, Escape key, helper glue
   ============================================================ */

(function () {
  // Footer year
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Global Escape handler — closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.closeProjectModal) window.closeProjectModal();
      if (window.closeCertModal) window.closeCertModal();
      const chatPanel = document.getElementById('chatPanel');
      const chatFab = document.getElementById('chatFab');
      if (chatPanel && chatPanel.classList.contains('open')) {
        chatPanel.classList.remove('open');
        setTimeout(() => { chatPanel.hidden = true; }, 300);
        if (chatFab) chatFab.style.display = '';
      }
    }
  });

  // Helper: open project by ID (used by Lab related-project links)
  window.openProjectByName = function (id) {
    if (typeof PROJECTS === 'undefined') return;
    const proj = PROJECTS.find(p => p.id === id);
    if (proj) {
      // Simulate clicking the matching card
      const cards = document.querySelectorAll('.project-card');
      cards.forEach(card => {
        if (card.getAttribute('aria-label') === 'Open project: ' + proj.title) {
          card.click();
        }
      });
    }
  };

  // Reveal refresh helper (called after dynamic content injection)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.RevealRefresh = function () {
    if (reduce) {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
  };
})();
