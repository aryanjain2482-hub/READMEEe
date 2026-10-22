/**
 * Tiny sound-effect engine. Every sound is synthesized live with the Web Audio API
 * (no audio files, nothing copied from any show or game). Muted state is remembered.
 */
let ctx: AudioContext | null = null;
let muted = false;

try { muted = localStorage.getItem("rw-muted") === "1"; } catch { /* storage may be blocked */ }

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", delay = 0, vol = 0.12, slideTo?: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  isMuted: () => muted,
  setMuted(v: boolean) {
    muted = v;
    try { localStorage.setItem("rw-muted", v ? "1" : "0"); } catch { /* ignore */ }
  },
  /** small button tap */
  click: () => tone(660, 0.07, "square", 0, 0.05),
  /** new order popped in */
  pop: () => { tone(420, 0.12, "sine", 0, 0.14, 900); tone(900, 0.08, "sine", 0.1, 0.08); },
  /** optimizing: quick whoosh */
  whoosh: () => tone(900, 0.28, "sawtooth", 0, 0.05, 160),
  /** cancel / oops */
  boing: () => tone(520, 0.3, "triangle", 0, 0.14, 130),
  /** warning (something doesn't fit) */
  buzz: () => { tone(140, 0.18, "square", 0, 0.08); tone(120, 0.18, "square", 0.2, 0.08); },
  /** success jingle */
  tada: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "triangle", i * 0.09, 0.13));
    tone(1047, 0.45, "sine", 0.4, 0.1);
  },
};
