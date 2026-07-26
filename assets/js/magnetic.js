/* ============================================================
   MAGNETIC.JS — Magnetic buttons + card tilt effects
   Buttons drift slightly toward the cursor on hover.
   Project cards tilt based on mouse position.
   ============================================================ */

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Magnetic buttons
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // Card tilt (applied to project cards after they render)
  // Delegated listener so dynamically-created cards also work
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.project-card');
    if (card && !card.contains(e.relatedTarget)) {
      card.style.transform = '';
    }
  });

  // Lab module radial glow tracking
  document.addEventListener('mousemove', (e) => {
    const mod = e.target.closest('.lab-module');
    if (!mod) return;
    const rect = mod.getBoundingClientRect();
    mod.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    mod.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
})();
