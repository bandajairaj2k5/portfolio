/* ============================================================
   EASTER-EGG.JS — Logo multi-click easter egg
   Clicking the logo repeatedly triggers a warning banner.
   ============================================================ */

(function () {
  const logo = document.getElementById('navLogo');
  if (!logo) return;

  let clicks = 0;
  let timer = null;
  let banner = null;

  logo.addEventListener('click', (e) => {
    // Allow normal navigation on first click, count rapid clicks
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 1500);

    if (clicks >= 5) {
      clicks = 0;
      showBanner();
    }
  });

  function showBanner() {
    if (banner) {
      banner.remove();
    }
    banner = document.createElement('div');
    banner.className = 'easter-egg-banner';
    banner.textContent = 'SYSTEM WARNING — Engineer clicked his own logo way too many times. No bugs detected. Yet.';
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => { if (banner) banner.remove(); banner = null; }, 400);
    }, 4000);
  }
})();
