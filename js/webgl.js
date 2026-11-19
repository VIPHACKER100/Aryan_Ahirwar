/**
 * Lazy-loaded Three.js r187 ES module holographic cyber-globe.
 * Features:
 * - Deferred import after initial paint (zero LCP blocking)
 * - Framerate-independent delta-time physics (60/120/240Hz consistent)
 * - Pauses automatically when tab is hidden or user disables 3D
 * - Respects prefers-reduced-motion (renders single static frame)
 * - Scoped mouse drag (never hijacks cards, text selection, or mobile touch scroll)
 * - Graceful fallback on WebGL failure or context loss
 */
const THREE_CDN_URL = 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.min.js';
const STORAGE_KEY = 'vh_webgl_enabled';

export function initWebGLController() {
  const container = document.getElementById('webgl-container');
  const toggleBtn = document.getElementById('webgl-toggle');
  const toggleLabel = document.getElementById('webgl-label');
  if (!container) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const savedPref = localStorage.getItem(STORAGE_KEY);
  let enabled = savedPref === null ? !reducedMotionQuery.matches : savedPref === 'true';

  let sceneApi = null;
  let loading = false;

  function syncButton() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-pressed', String(enabled));
    if (toggleLabel) toggleLabel.textContent = enabled ? '3D: ON' : '3D: OFF';
  }

  async function mountScene() {
    if (sceneApi || loading) return;
    loading = true;
    try {
      const THREE = await import(THREE_CDN_URL);
      sceneApi = createCyberGlobe(THREE, container, reducedMotionQuery);
      if (!enabled) {
        sceneApi.setPaused(true);
      }
    } catch {
      // WebGL or CDN unavailable: keep CSS grid atmosphere cleanly without errors.
      container.classList.add('webgl-paused');
      enabled = false;
      syncButton();
    } finally {
      loading = false;
    }
  }

  syncButton();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', async () => {
      enabled = !enabled;
      localStorage.setItem(STORAGE_KEY, String(enabled));
      syncButton();
      if (enabled) {
        container.classList.remove('webgl-paused');
        if (!sceneApi) {
          await mountScene();
        } else {
          sceneApi.setPaused(false);
        }
      } else {
        container.classList.add('webgl-paused');
        if (sceneApi) sceneApi.setPaused(true);
      }
    });
  }

  // Defer WebGL download & compile until browser is idle after first paint
  const scheduleMount = () => {
    if (!enabled) {
      container.classList.add('webgl-paused');
      return;
    }
    mountScene();
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(scheduleMount, { timeout: 1200 });
  } else {
    window.setTimeout(scheduleMount, 200);
  }
}

function createCyberGlobe(THREE, container, reducedMotionQuery) {
  const isCompact = window.innerWidth < 900;
  const lowCores = (navigator.hardwareConcurrency || 4) <= 4;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isCompact && !lowCores,
    powerPreference: 'default',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.replaceChildren(renderer.domElement);

  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  function updateCorePosition() {
    if (window.innerWidth > 1100) {
      coreGroup.position.set(7.5, 0, 0);
    } else {
      coreGroup.position.set(0, 2, -4);
    }
  }
  updateCorePosition();

  // 1. Holographic Wireframe Sphere
  const sphereGeo = new THREE.IcosahedronGeometry(9, isCompact ? 2 : 3);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  });
  coreGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

  // 2. Inner Core Sphere
  const innerGeo = new THREE.SphereGeometry(6.5, 20, 20);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  coreGroup.add(new THREE.Mesh(innerGeo, innerMat));

  // 3. Orbiting Scanner Rings
  const ring1 = new THREE.Mesh(
    new THREE.RingGeometry(11.2, 11.4, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.62,
    })
  );
  ring1.rotation.x = Math.PI / 3;
  coreGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(12.8, 13.0, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
    })
  );
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.x = -Math.PI / 6;
  coreGroup.add(ring2);

  // 4. Security Nodes on Sphere
  const nodeCount = 36;
  const nodePositions = [];
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    const r = 9.1;
    nodePositions.push(
      r * Math.cos(theta) * Math.sin(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(phi)
    );
  }
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
  coreGroup.add(
    new THREE.Points(
      nodeGeo,
      new THREE.PointsMaterial({ color: 0x00ff88, size: 0.72, transparent: true, opacity: 0.9 })
    )
  );

  // 5. Adaptive Ambient Cyber Particle Field
  const particleCount = isCompact || lowCores ? 260 : 650;
  const particlePositions = [];
  const particleColors = [];
  const cEmerald = new THREE.Color(0x00ff88);
  const cCyan = new THREE.Color(0x00e5ff);
  const cWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount; i++) {
    particlePositions.push(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60
    );
    const r = Math.random();
    const col = r > 0.6 ? cEmerald : r > 0.25 ? cCyan : cWhite;
    particleColors.push(col.r, col.g, col.b);
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
  const particleField = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ size: 0.34, vertexColors: true, transparent: true, opacity: 0.52 })
  );
  scene.add(particleField);

  // Scoped Mouse Pointer Interaction (never breaks mobile touch scrolling or text selection)
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let isDragging = false;
  let prevPos = { x: 0, y: 0 };

  const INTERACTIVE_SELECTOR =
    'a, button, input, textarea, select, label, summary, details, .surface-card, .terminal-hud, header, footer, dialog';

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    if (isDragging) {
      targetRotY += (e.clientX - prevPos.x) * 0.006;
      targetRotX += (e.clientY - prevPos.y) * 0.006;
      prevPos = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest(INTERACTIVE_SELECTOR)) return;
    isDragging = true;
    prevPos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  window.addEventListener('pointercancel', () => {
    isDragging = false;
  });

  // Resize handler (debounced via rAF)
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateCorePosition();
      if (paused || reducedMotionQuery.matches) {
        renderer.render(scene, camera);
      }
    });
  });

  // WebGL context loss safety
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stopLoop();
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    if (!paused && !document.hidden) startLoop();
  });

  let paused = false;
  let rafId = 0;
  let lastTime = performance.now();

  function renderFrame(now) {
    rafId = 0;
    if (paused || document.hidden) return;

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!isDragging) {
      targetRotY += 0.18 * dt;
      targetRotX += 0.06 * dt;
    }

    const damping = 1 - Math.exp(-3.2 * dt);
    coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * damping;
    coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * damping;

    ring1.rotation.z += 0.58 * dt;
    ring2.rotation.z -= 0.46 * dt;

    const camDamping = 1 - Math.exp(-2.6 * dt);
    camera.position.x += (mouseX * 2.4 - camera.position.x) * camDamping;
    camera.position.y += (-mouseY * 2.4 - camera.position.y) * camDamping;
    camera.lookAt(0, 0, 0);

    particleField.rotation.y += 0.025 * dt;

    renderer.render(scene, camera);

    if (!reducedMotionQuery.matches) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function startLoop() {
    if (rafId || paused || document.hidden) return;
    lastTime = performance.now();
    if (reducedMotionQuery.matches) {
      renderer.render(scene, camera);
      return;
    }
    rafId = requestAnimationFrame(renderFrame);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else if (!paused) {
      startLoop();
    }
  });

  reducedMotionQuery.addEventListener('change', () => {
    if (reducedMotionQuery.matches) {
      stopLoop();
      renderer.render(scene, camera);
    } else if (!paused) {
      startLoop();
    }
  });

  startLoop();

  return {
    setPaused(nextPaused) {
      paused = nextPaused;
      if (paused) {
        stopLoop();
      } else {
        startLoop();
      }
    },
  };
}
