/* ============================================================
   HERO3D.JS — Low-poly PCB/dev-board 3D object (Three.js)
   Lazy-loads Three.js from CDN. Idles gently + reacts to cursor.
   Falls back to static CSS background on mobile / no WebGL.
   ============================================================ */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Skip 3D on mobile or reduced motion — CSS grid background is the fallback
  if (reduce || isMobile) {
    canvas.style.display = 'none';
    return;
  }

  // Lazy-load Three.js
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
  script.onload = initThree;
  script.onerror = () => { canvas.style.display = 'none'; };
  document.head.appendChild(script);

  function initThree() {
    if (typeof THREE === 'undefined') { canvas.style.display = 'none'; return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // ---- Board group ----
    const board = new THREE.Group();
    scene.add(board);

    // PCB base
    const boardGeo = new THREE.BoxGeometry(4, 0.15, 3);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x0a3d2e, metalness: 0.3, roughness: 0.7 });
    const pcb = new THREE.Mesh(boardGeo, boardMat);
    board.add(pcb);

    // Edge glow plane (slightly larger, behind)
    const glowGeo = new THREE.PlaneGeometry(4.4, 3.4);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.06 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = -0.1;
    glow.rotation.x = -Math.PI / 2;
    board.add(glow);

    // Chips (small boxes on the board)
    const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 });
    const chipPositions = [
      { x: -1.2, z: -0.5, w: 0.8, d: 0.6, h: 0.2 },
      { x: 1.0, z: 0.8, w: 0.6, d: 0.6, h: 0.15 },
      { x: 0.3, z: -1.0, w: 0.5, d: 0.4, h: 0.12 },
      { x: -0.8, z: 1.0, w: 0.4, d: 0.4, h: 0.1 }
    ];
    chipPositions.forEach(c => {
      const g = new THREE.BoxGeometry(c.w, c.h, c.d);
      const m = new THREE.Mesh(g, chipMat);
      m.position.set(c.x, 0.15 + c.h / 2, c.z);
      board.add(m);

      // Chip pin dots (tiny cylinders)
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });
      for (let i = 0; i < 4; i++) {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), pinMat);
        pin.position.set(c.x + (i - 1.5) * 0.15, 0.15, c.z + c.d / 2 + 0.05);
        board.add(pin);
      }
    });

    // Trace lines (thin glowing lines on the PCB)
    const traceMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 });
    const tracePoints = [
      [-1.5, 0.08, -0.5], [-0.5, 0.08, -0.5], [-0.5, 0.08, 0.5], [0.5, 0.08, 0.5],
      [0.5, 0.08, 1.2], [1.5, 0.08, 1.2],
      [-1.5, 0.08, 0.8], [-0.8, 0.08, 0.8], [-0.8, 0.08, 1.2],
      [1.2, 0.08, -0.5], [0.3, 0.08, -0.5], [0.3, 0.08, -1.0]
    ];
    const traceGeo = new THREE.BufferGeometry().setFromPoints(tracePoints.map(p => new THREE.Vector3(...p)));
    const traces = new THREE.LineSegments(traceGeo, traceMat);
    board.add(traces);

    // LED dots (small glowing spheres)
    const ledColors = [0x00ff9d, 0x00e5ff, 0xffb800, 0xff4757];
    ledColors.forEach((col, i) => {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: col })
      );
      led.position.set(-1.5 + i * 0.9, 0.1, 1.3);
      led.userData = { baseColor: col, phase: i * 0.5 };
      board.add(led);
    });

    // Header pins (row of thin cylinders)
    const pinMat2 = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 8; i++) {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), pinMat2);
      pin.position.set(-1.5 + i * 0.2, 0.2, -1.3);
      board.add(pin);
    }

    // Lighting
    const ambient = new THREE.AmbientLight(0x445566, 0.6);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0x00e5ff, 0.8);
    key.position.set(3, 5, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x00ff9d, 0.3);
    fill.position.set(-3, 3, -2);
    scene.add(fill);
    const top = new THREE.PointLight(0xffffff, 0.5, 10);
    top.position.set(0, 4, 0);
    scene.add(top);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0.3, targetRotY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = mouseX * 0.4;
      targetRotX = 0.3 + mouseY * 0.2;
    });

    // Resize
    function onResize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // Animation loop
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.01;

      // Gentle idle rotation + mouse parallax
      board.rotation.y += (targetRotY + Math.sin(t * 0.3) * 0.1 - board.rotation.y) * 0.05;
      board.rotation.x += (targetRotX - board.rotation.x) * 0.05;
      board.position.y = Math.sin(t * 0.5) * 0.15;

      // LED blink
      board.children.forEach(child => {
        if (child.userData && child.userData.baseColor !== undefined) {
          child.material.opacity = 0.5 + Math.sin(t * 2 + child.userData.phase) * 0.5;
          child.material.transparent = true;
        }
      });

      renderer.render(scene, camera);
    }
    animate();
  }
})();
