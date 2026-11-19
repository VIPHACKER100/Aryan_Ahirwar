/**
 * Modern Navigation Suite:
 * 1. Native modal <dialog> swipe navigation drawer with scroll-snap + fallbacks
 * 2. Modern CSS scrollspy (scroll-target-group / :target-current) + IntersectionObserver fallback
 * 3. Compositor-only scroll-progress scaleX fallback when animation-timeline is unsupported
 */
export function initNavigation() {
  initSwipeDrawer();
  initScrollspy();
  initScrollProgressFallback();
}

function initSwipeDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const openBtn = document.getElementById('drawer-open');
  if (!drawer || !openBtn) return;

  const scroller = drawer.querySelector('.Drawer-scroller');
  const sheet = drawer.querySelector('.Drawer-sheet');
  const closeBtn = document.getElementById('drawer-close');
  if (!scroller || !sheet) return;

  let canCloseOnExit = false;

  async function openDrawer() {
    canCloseOnExit = false;
    drawer.showModal();

    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
    }

    // Wait two frames so initial off-screen snap commits before sliding open
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    if (drawer.open) {
      scroller.scrollTo({ left: 0, behavior: 'auto' });
    }
  }

  function closeDrawer() {
    if (!drawer.open) return;
    canCloseOnExit = true;
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  }

  function onDrawerOpened() {
    if (!drawer.open) return;
    canCloseOnExit = true;
    openBtn.setAttribute('aria-expanded', 'true');
  }

  function onDrawerClosed() {
    canCloseOnExit = false;
    if (drawer.open) drawer.close();
    openBtn.setAttribute('aria-expanded', 'false');
  }

  const visibleThreshold = 0.01;
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      if (!entry || !drawer.open) return;
      if (entry.intersectionRatio >= 0.99) {
        onDrawerOpened();
      } else if (canCloseOnExit && entry.intersectionRatio < visibleThreshold) {
        onDrawerClosed();
      }
    },
    { root: drawer, threshold: [visibleThreshold, 0.99] }
  );
  observer.observe(sheet);

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  // Light-dismiss when tapping outside the sheet (without using closedby="any")
  drawer.addEventListener('click', (event) => {
    if (!sheet.contains(event.target)) {
      closeDrawer();
    }
  });

  // Escape slides the drawer out smoothly when cancelable
  drawer.addEventListener('cancel', (event) => {
    if (event.cancelable) {
      event.preventDefault();
      closeDrawer();
    }
  });

  // Navigating via any link inside the drawer closes it cleanly
  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Backdrop opacity fallback when scroll-driven animations are not supported
  if (!CSS.supports('animation-timeline: scroll()')) {
    scroller.addEventListener(
      'scroll',
      () => {
        const width = sheet.offsetWidth || 1;
        const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / width));
        drawer.style.setProperty('--drawer-backdrop', ratio.toFixed(3));
      },
      { passive: true }
    );
  }
}

function initScrollspy() {
  const nav = document.getElementById('primary-nav');
  if (!nav) return;

  const navLinks = nav.querySelectorAll('a[href^="#"]');
  if (!navLinks.length) return;

  if (CSS.supports('scroll-target-group: auto')) {
    const syncAriaCurrent = () => {
      const currentLink = nav.querySelector('a:target-current');
      navLinks.forEach((link) => {
        link.setAttribute('aria-current', link === currentLink ? 'true' : 'false');
      });
    };

    syncAriaCurrent();
    document.addEventListener('scrollend', syncAriaCurrent, { passive: true });
    return;
  }

  // Fallback for browsers without scroll-target-group: IntersectionObserver
  const sections = document.querySelectorAll('main > section[id]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('target-current', isActive);
          link.setAttribute('aria-current', String(isActive));
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initScrollProgressFallback() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (CSS.supports('animation-timeline', 'scroll()')) return;

  let rafId = 0;
  function update() {
    rafId = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}
