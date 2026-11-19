/**
 * Subtle Web Audio API synthesizer for Cyber-HUD UI telemetry clicks.
 * Properly awaits AudioContext.resume() so the first toggle tone plays reliably.
 */
export const CyberAudio = (() => {
  let audioCtx = null;
  let muted = true;

  function ensureContext() {
    if (!audioCtx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) {
        audioCtx = new AudioCtor();
      }
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.06, gainLevel = 0.035) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio playback blocked or unavailable; fail silently.
    }
  }

  return {
    async toggle() {
      const ctx = ensureContext();
      if (muted && ctx && ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          return false;
        }
      }
      muted = !muted;
      return !muted;
    },
    isMuted() {
      return muted;
    },
    click() {
      playTone(1200, 'triangle', 0.04, 0.025);
    },
    cmd() {
      playTone(880, 'sine', 0.07, 0.035);
    },
    success() {
      playTone(1760, 'sine', 0.08, 0.035);
    },
    error() {
      playTone(320, 'sawtooth', 0.11, 0.04);
    },
  };
})();

export function initAudioControls() {
  const toggleBtn = document.getElementById('audio-toggle');
  const label = document.getElementById('audio-label');
  const wave1 = document.getElementById('audio-wave-1');
  const wave2 = document.getElementById('audio-wave-2');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', async () => {
      const isActive = await CyberAudio.toggle();
      toggleBtn.setAttribute('aria-pressed', String(isActive));
      if (label) label.textContent = isActive ? 'FX: ON' : 'FX: OFF';
      if (wave1) wave1.setAttribute('opacity', isActive ? '1' : '0.35');
      if (wave2) wave2.setAttribute('opacity', isActive ? '1' : '0.35');
      if (isActive) CyberAudio.success();
    });
  }

  // Single delegated click sound listener covers both static and dynamically rendered buttons
  document.addEventListener('click', (event) => {
    const target = event.target.closest(
      '.btn, .quick-cmd-btn, .filter-btn, .channel-btn, .phone-chip-btn, .copy-trigger-btn'
    );
    if (target) {
      CyberAudio.click();
    }
  });
}
