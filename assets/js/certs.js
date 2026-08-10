/* ============================================================
   CERTS.JS — Renders certification cards + lightbox modal
   Supports images and PDFs. Escape closes. Click to zoom.
   ============================================================ */

(function () {
  const grid = document.getElementById('certGrid');
  if (!grid || typeof CERTS === 'undefined') return;

  const overlay = document.getElementById('certModal');
  const modalBody = document.getElementById('certModalBody');
  const closeBtn = document.getElementById('certModalClose');

  CERTS.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'cert-card reveal';
    card.style.transitionDelay = (idx * 0.08) + 's';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View certificate: ' + c.name);

    const thumbHTML = c.thumb
      ? `<img src="${c.thumb}" alt="${c.name} thumbnail" loading="lazy" />`
      : `<div class="cert-thumb-placeholder">[ CERT THUMBNAIL PENDING ]<br/>assets/certs/${c.id}-thumb.jpg</div>`;

    card.innerHTML = `
      <div class="cert-thumb">${thumbHTML}</div>
      <div class="cert-body">
        <h3 class="cert-name">${c.name}</h3>
        <p class="cert-org">${c.org}</p>
        <div class="cert-meta">
          <span class="cert-date">${c.date}</span>
          <span class="cert-skill">${c.skill}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openCert(c));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCert(c);
      }
    });

    grid.appendChild(card);
  });

  function openCert(c) {
    let viewerHTML = '';

    if (c.file) {
      const isPDF = c.file.toLowerCase().endsWith('.pdf');
      if (isPDF) {
        viewerHTML = `<iframe src="${c.file}" title="${c.name}" loading="lazy"></iframe>`;
      } else {
        viewerHTML = `<div class="cert-zoom-container"><img src="${c.file}" alt="${c.name}" class="cert-zoom-img" loading="lazy" /></div>`;
      }
    } else {
      viewerHTML = `<div class="pm-img-placeholder" style="min-height:300px;">[ CERTIFICATE FILE PENDING ]<br/>assets/certs/${c.id}.pdf</div>`;
    }

    modalBody.innerHTML = `
      <div class="cert-body-viewer">
        <p class="cert-lightbox-title">${c.name}</p>
        <p class="cert-org" style="text-align:center;">${c.org} · ${c.date} · ${c.skill}</p>
        ${viewerHTML}
      </div>
    `;

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    // Zoom toggle for images
    const zoomImg = modalBody.querySelector('.cert-zoom-img');
    if (zoomImg) {
      zoomImg.addEventListener('click', () => zoomImg.classList.toggle('zoomed'));
    }
  }

  function closeCert() {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.hidden = true; }, 250);
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeCert);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCert();
  });

  window.closeCertModal = closeCert;
})();
