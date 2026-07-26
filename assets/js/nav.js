/* ============================================================
   NAV.JS — Sticky nav, mobile toggle, active section tracking
   ============================================================ */

(function () {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  // Add scrolled state to nav
  function onScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    updateActive();
  }

  // Track active section using IntersectionObserver
  let activeId = 'home';
  function updateActive() {
    const scrollPos = window.scrollY + 100;
    let current = sections[0]?.id || 'home';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        current = sec.id;
      }
    });
    if (current !== activeId) {
      activeId = current;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });

  // Initial state
  onScroll();
})();
