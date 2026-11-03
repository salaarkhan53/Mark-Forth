// A small live fire in the scrolled header bar.
// Soft glowing particles rise from the bar's bottom edge and blend additively, so overlapping
// particles burn brighter: a white-yellow core, orange body and red tips, with the odd spark.
// Runs only while the bar is in its scrolled state and the tab is visible; never for reduced motion.

type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; seed: number; spark: boolean };

// pre-drawn soft dots in the fire's colours (drawing images is far cheaper than gradients per frame)
function sprite(r: number, g: number, b: number) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return c;
}

export function initBarFire(canvas: HTMLCanvasElement, header: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const core = sprite(255, 186, 64);    // hot yellow-orange
  const body = sprite(255, 118, 20);    // orange
  const tip = sprite(232, 48, 14);      // red
  const ember = sprite(170, 28, 8);     // deep red at the very tips
  const parts: P[] = [];
  let w = 0, h = 0, dpr = 1, raf = 0, t = 0, boost = 0, want = 0;

  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(size).observe(canvas);
  size();

  // the bed of the fire: wider in the middle, a few tongues
  const spawn = (spark = false): P => {
    const spread = w * 0.21;
    const g = (Math.random() + Math.random() + Math.random()) / 3 - 0.5; // roughly bell-shaped
    // sparks scatter wider than the flame, drifting out to the left and right
    const sx = w / 2 + (Math.random() - 0.5) * w * 0.62;
    return {
      x: spark ? sx : w / 2 + g * spread * 2,
      y: spark ? h - 2 - Math.random() * 6 : h - 1,
      vx: spark ? (sx - w / 2) * 0.012 + (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 0.3,
      vy: spark ? -(1.5 + Math.random() * 1.2) : -(0.9 + Math.random() * 1.1),
      r: spark ? 1 + Math.random() * 0.8 : 5 + Math.random() * 6,
      life: 0,
      max: spark ? 45 + Math.random() * 30 : 34 + Math.random() * 30,
      seed: Math.random() * 1000,
      spark,
    };
  };

  const step = () => {
    raf = 0;
    if (!header.classList.contains('is-solid') || document.hidden) return;
    t++;
    boost += (want - boost) * 0.08;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const target = Math.round(130 + boost * 70);
    for (let i = 0; i < 6 + boost * 4 && parts.length < target; i++) parts.push(spawn(Math.random() < 0.09));
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      const k = p.life / p.max;
      if (k >= 1) { parts.splice(i, 1); continue; }
      // flicker and sway: the flame licks side to side and pulls towards the centre as it rises
      // tongues: a shared side-to-side lick, and each particle drawn in to the centre as it rises
      if (p.spark) { p.vx += Math.sin((t + p.seed) * 0.2) * 0.03; } else {
        p.vx += Math.sin(t * 0.09 + p.seed * 0.002) * 0.05 + Math.sin((t + p.seed) * 0.31) * 0.04 + (w / 2 - p.x) * 0.0035 * k;
        p.vx *= 0.96;
      }
      p.x += p.vx;
      p.y += p.vy * (1 + boost * 0.35);
      const r = p.spark ? p.r : p.r * (1 - k * 0.8);
      const img = p.spark ? core : k < 0.18 ? core : k < 0.5 ? body : k < 0.82 ? tip : ember;
      const fade = k < 0.12 ? 0.75 + (k / 0.12) * 0.25 : 1 - (k - 0.12) / 0.88; // visible from the moment it leaves the surface
      ctx.globalAlpha = p.spark ? (1 - k) : fade * (k < 0.18 ? 0.62 : 0.72) * (0.8 + 0.2 * Math.sin(p.seed + t * 0.6));
      const d = r * 2;
      // stretched upward, like a tongue of flame
      ctx.drawImage(img, p.x - r, p.y - r * 1.8, d, d * 1.9);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(step);
  };
  const start = () => { if (!raf && header.classList.contains('is-solid') && !document.hidden) raf = requestAnimationFrame(step); };

  new MutationObserver(start).observe(header, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', start);
  // it flares up a little while the pointer is over the bar
  const bar = canvas.closest('.bar');
  bar?.addEventListener('pointerenter', () => { want = 1; });
  bar?.addEventListener('pointerleave', () => { want = 0; });
  start();
}
