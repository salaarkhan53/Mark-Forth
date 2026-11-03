// Tiny flames inside the dark closing card: small red, orange and amber flames rise and
// flicker, scatter from the pointer and spark a short trail where it moves.
// The canvas is sized to the card, so nothing drifts over the light page around it.
// Pauses when offscreen; off for reduced motion.

type Flame = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number; seed: number };

export function initEmbers(canvas: HTMLCanvasElement) {
  const band = canvas.parentElement as HTMLElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const small = matchMedia('(max-width: 700px)').matches;
  const target = small ? 34 : 80;
  const flames: Flame[] = [];
  let w = 0, h = 0, dpr = 1, raf = 0, visible = false;
  const pointer = { x: -999, y: -999, active: false };

  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = band.clientWidth; h = band.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(size).observe(band);
  size();

  const spawn = (x?: number, y?: number, burst = false): Flame => ({
    x: x ?? Math.random() * w,
    y: y ?? (Math.random() < 0.55 ? h - Math.random() * 30 : Math.random() * h),
    vx: (Math.random() - 0.5) * (burst ? 1.4 : 0.25),
    vy: -(burst ? 0.6 + Math.random() * 1.2 : 0.35 + Math.random() * 0.75),
    r: burst ? 1.6 + Math.random() * 2.2 : 2 + Math.random() * 3.6,
    life: 0,
    max: burst ? 40 + Math.random() * 40 : 160 + Math.random() * 220,
    hue: 4 + Math.random() * 34, // red to amber
    seed: Math.random() * 1000,
  });
  // start already spread through the band
  for (let i = 0; i < target; i++) { const f = spawn(undefined, Math.random() * h); f.life = Math.random() * f.max; flames.push(f); }

  // a small teardrop flame: amber core, orange body, red edge
  const draw = (f: Flame, t: number) => {
    const k = f.life / f.max;
    const alpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    const flick = 0.82 + Math.sin(t * 0.02 + f.seed) * 0.12 + Math.random() * 0.08;
    const r = f.r * flick * (1 - k * 0.45);
    const lean = Math.sin(t * 0.004 + f.seed) * 0.25 + f.vx * 0.6;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(lean);
    ctx.globalAlpha = Math.max(0, alpha) * 0.9;
    const g = ctx.createRadialGradient(0, r * 0.5, 0, 0, 0, r * 2.2);
    g.addColorStop(0, `hsla(${f.hue + 20}, 100%, 72%, 1)`);
    g.addColorStop(0.35, `hsla(${f.hue}, 95%, 55%, 0.95)`);
    g.addColorStop(1, `hsla(${Math.max(0, f.hue - 8)}, 90%, 45%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -r * 2.4);
    ctx.bezierCurveTo(r * 1.1, -r * 0.9, r * 1.2, r * 0.6, 0, r * 1.15);
    ctx.bezierCurveTo(-r * 1.2, r * 0.6, -r * 1.1, -r * 0.9, 0, -r * 2.4);
    ctx.fill();
    ctx.restore();
  };

  let t = 0;
  const step = () => {
    if (!visible || document.hidden) { raf = 0; return; }
    t++;
    ctx.clearRect(0, 0, w, h);
    while (flames.length < target) flames.push(spawn());
    for (let i = flames.length - 1; i >= 0; i--) {
      const f = flames[i];
      f.life++;
      // drift up with a gentle sway
      f.vx += Math.sin((t + f.seed) * 0.03) * 0.012;
      // scatter away from the pointer
      if (pointer.active) {
        const dx = f.x - pointer.x, dy = f.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 1) { const d = Math.sqrt(d2), push = (1 - d / 120) * 0.9; f.vx += (dx / d) * push; f.vy += (dy / d) * push * 0.6; }
      }
      f.vx *= 0.96; f.vy = f.vy * 0.985 - 0.006;
      f.x += f.vx; f.y += f.vy;
      if (f.life > f.max || f.y < -10 || f.x < -10 || f.x > w + 10) { flames.splice(i, 1); continue; }
      draw(f, t);
    }
    raf = requestAnimationFrame(step);
  };
  const start = () => { if (!raf && visible) raf = requestAnimationFrame(step); };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '100px' }).observe(band);
  document.addEventListener('visibilitychange', start);

  band.addEventListener('pointermove', (e) => {
    const r = band.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const moved = Math.hypot(x - pointer.x, y - pointer.y);
    pointer.x = x; pointer.y = y; pointer.active = true;
    // a short spark trail behind the pointer
    const n = Math.min(4, Math.floor(moved / 10));
    for (let i = 0; i < n && flames.length < target + 80; i++) flames.push(spawn(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, true));
  });
  band.addEventListener('pointerleave', () => { pointer.active = false; });
}
