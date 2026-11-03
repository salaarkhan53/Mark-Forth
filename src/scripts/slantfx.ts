// The slanted top edge of each dark band, brought to life:
// a red line along the edge with a light that runs across it, short speed streaks flying
// forward just under the edge (the emblem's motion), and small sparks rising to the edge
// and fading out against it. Everything is drawn inside the dark band only.
// Pauses offscreen; not started for reduced motion.

type Streak = { x: number; d: number; len: number; v: number; a: number; hue: number; w: number };
type Spark = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number };

export function initSlantFx(section: HTMLElement) {
  const host = document.createElement('div');
  host.className = 'slant-fx';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = '<canvas></canvas>';
  section.prepend(host);
  const canvas = host.querySelector('canvas')!;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const small = matchMedia('(max-width: 700px)').matches;
  const nStreaks = small ? 14 : 30;
  const nSparks = small ? 22 : 46;
  let w = 0, h = 0, slant = 40, dpr = 1, raf = 0, visible = false, t = 0, frame = 0;
  const pointer = { x: -999, active: false };

  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = host.clientWidth; h = host.clientHeight;
    slant = parseFloat(getComputedStyle(section).getPropertyValue('--slant')) || 40;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(size).observe(host);
  size();

  // y of the slanted edge at x (high on the right, low on the left)
  const edge = (x: number) => slant * (1 - x / Math.max(1, w));
  // the edge's angle: streaks travel along it, rising to the right
  const ang = () => Math.atan2(-slant, w);

  const streak = (fresh = false): Streak => ({
    x: fresh ? Math.random() * w : -120 - Math.random() * w * 0.4,
    d: 6 + Math.pow(Math.random(), 1.6) * (h * 0.55),
    len: 30 + Math.random() * 110,
    v: 2.2 + Math.random() * 4.5,
    a: 0.25 + Math.random() * 0.55,
    hue: Math.random() < 0.18 ? -1 : 6 + Math.random() * 26,
    w: Math.random() < 0.2 ? 2.2 : 1.2,
  });
  const spark = (fresh = false): Spark => {
    const x = Math.random() * w;
    return { x, y: fresh ? edge(x) + Math.random() * h : h + Math.random() * 20, vx: 0.15 + Math.random() * 0.35, vy: -(0.25 + Math.random() * 0.6), r: 0.8 + Math.random() * 1.8, life: 0, max: 220 + Math.random() * 260, hue: 8 + Math.random() * 30 };
  };
  const streaks = Array.from({ length: nStreaks }, () => streak(true));
  const sparks = Array.from({ length: nSparks }, () => { const s = spark(true); s.life = Math.random() * s.max; return s; });

  const step = () => {
    if (!visible || document.hidden) { raf = 0; return; }
    // phones draw every other frame (about 30 fps)
    if (small && (frame++ & 1)) { raf = requestAnimationFrame(step); return; }
    t++;
    ctx.clearRect(0, 0, w, h);
    const a = ang(), ca = Math.cos(a), sa = Math.sin(a);

    // the edge line, and a light that runs along it every few seconds
    ctx.lineCap = 'round';
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(223,47,24,0.0)');
    g.addColorStop(0.25, 'rgba(223,47,24,0.55)');
    g.addColorStop(1, 'rgba(255,138,115,0.7)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, edge(0) + 0.75); ctx.lineTo(w, edge(w) + 0.75); ctx.stroke();
    const run = (t % 420) / 300; // 0..1.4, the light rests off-screen for the rest of the cycle
    if (run <= 1.1) {
      const cx = run * (w + 300) - 150;
      const lg = ctx.createLinearGradient(cx - 260 * ca, edge(cx) + 260 * -sa, cx, edge(cx));
      lg.addColorStop(0, 'rgba(255,75,43,0)');
      lg.addColorStop(1, 'rgba(255,220,205,0.95)');
      ctx.strokeStyle = lg; ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(255,90,58,0.9)'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(cx - 260 * ca, edge(cx - 260 * ca) + 1); ctx.lineTo(cx, edge(cx) + 1); ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // speed streaks under the edge, parallel to it
    for (const s of streaks) {
      const boost = pointer.active && Math.abs(s.x - pointer.x) < 160 ? 2.4 : 1;
      s.x += s.v * boost;
      const y = edge(s.x) + s.d;
      const tailX = s.x - s.len * ca, tailY = y - s.len * sa;
      const fade = Math.max(0, 1 - s.d / (h * 0.62));
      const sg = ctx.createLinearGradient(tailX, tailY, s.x, y);
      const col = s.hue < 0 ? '255,255,255' : `255,${Math.round(70 + s.hue * 3)},${Math.round(40 + s.hue)}`;
      sg.addColorStop(0, `rgba(${col},0)`);
      sg.addColorStop(1, `rgba(${col},${(s.a * fade).toFixed(3)})`);
      ctx.strokeStyle = sg; ctx.lineWidth = s.w;
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, y); ctx.stroke();
      if (s.x - s.len > w + 20) Object.assign(s, streak());
    }

    // sparks rising to the edge, fading as they reach it
    for (const p of sparks) {
      p.life++;
      p.x += p.vx + Math.sin((t + p.max) * 0.02) * 0.15;
      p.y += p.vy;
      const top = edge(p.x);
      const near = Math.min(1, Math.max(0, (p.y - top) / 40));
      const k = p.life / p.max;
      const alpha = Math.min(1, k * 6) * (1 - k) * near;
      if (p.life > p.max || p.y < top || p.x > w + 10) { Object.assign(p, spark()); continue; }
      if (alpha <= 0.01) continue;
      const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      rg.addColorStop(0, `hsla(${p.hue + 18},100%,75%,${alpha})`);
      rg.addColorStop(0.4, `hsla(${p.hue},95%,55%,${alpha * 0.7})`);
      rg.addColorStop(1, `hsla(${p.hue},90%,45%,0)`);
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  };
  const start = () => { if (!raf && visible) raf = requestAnimationFrame(step); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '80px' }).observe(host);
  document.addEventListener('visibilitychange', start);
  if (matchMedia('(pointer: fine)').matches) {
    section.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.active = e.clientY - r.top < r.height; });
    section.addEventListener('pointerleave', () => { pointer.active = false; });
  }
}
