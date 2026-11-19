/**
 * Single rAF-throttled 3D tilt + cursor glare controller.
 * Automatically disabled on touch devices and prefers-reduced-motion.
 */
const boundCards = new WeakSet();

export function initTiltCards(root = document) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (reducedMotion || coarsePointer) return;

  const cards = root.querySelectorAll('.tilt-card');
  cards.forEach((card) => {
    if (boundCards.has(card)) return;
    boundCards.add(card);

    let rafId = 0;
    let pointerX = 0;
    let pointerY = 0;

    function applyTilt() {
      rafId = 0;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = pointerX - rect.left;
      const y = pointerY - rect.top;
      card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(3px)`;
    }

    card.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(applyTilt);
      }
    });

    card.addEventListener('pointerleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      card.style.transform = '';
    });
  });
}
