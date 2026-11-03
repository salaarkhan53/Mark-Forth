// Polish pass: small vanilla behaviours shared by every page (no libraries).
// Each block is independent; to switch one off, remove its line in initPolish().

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

// P2: a small burst of ember sparks from a point (primary buttons, back to top).
export function sparks(x: number, y: number, n = 10, up = false) {
  if (reduced.matches) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.className = 'p-spark';
    document.body.appendChild(s);
    const a = up ? -Math.PI / 2 + (Math.random() - 0.5) * 1.1 : Math.random() * Math.PI * 2;
    const d = 22 + Math.random() * 38;
    const dx = Math.cos(a) * d, dy = Math.sin(a) * d - (up ? 0 : 10);
    const size = 0.6 + Math.random() * 0.8;
    s.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(${size})`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + dy}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 420 + Math.random() * 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
    ).onfinish = () => s.remove();
  }
}
function buttonSparks() {
  document.addEventListener('pointerdown', (e) => {
    const b = (e.target as Element | null)?.closest?.('.btn-primary');
    if (!b) return;
    sparks(e.clientX, e.clientY, 10);
  });
}

// P6: accent words shimmer once, the first time they are seen.
function shimmer() {
  const els = $$('.hero .accent, .page-hero .accent, .cta .accent, .faq__card .accent, .pro__card--end .accent');
  if (!els.length || reduced.matches) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target as HTMLElement;
    // headlines in a hero wait for their words to rise first
    setTimeout(() => el.classList.add('is-shimmer'), el.closest('[data-hero]') ? 900 : 350);
    io.unobserve(el);
  }), { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

// P6: the hand-drawn red underline under "forward." on the home hero.
function flameLine() {
  const accent = document.querySelector<HTMLElement>('.hero .accent');
  if (!accent) return;
  const add = (draw: boolean) => {
    if (accent.querySelector('.flame-line')) return;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'flame-line');
    svg.setAttribute('viewBox', '0 0 300 30');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    // a quick, slightly uneven brush stroke with a flick at the end
    svg.innerHTML = '<path pathLength="1" d="M4 20 C 50 12, 96 16, 140 13 S 230 8, 262 11 C 276 12, 286 9, 296 4"/><path pathLength="1" d="M30 23 C 90 18, 170 19, 250 15"/>';
    accent.appendChild(svg);
    if (draw) requestAnimationFrame(() => svg.classList.add('is-drawing'));
  };
  if (reduced.matches) { add(false); return; }
  const hero = accent.closest('.hero')!;
  const go = () => { if (hero.classList.contains('is-streak')) { add(true); mo.disconnect(); } };
  const mo = new MutationObserver(go);
  mo.observe(hero, { attributes: true, attributeFilter: ['class'] });
  go();
  // safety: if the headline animation never runs, draw anyway
  setTimeout(() => add(true), 3500);
}

// P7: the ember at the front of the header's reading line.
function progressEmber() {
  const bar = document.querySelector('.bar-progress');
  if (!bar || bar.querySelector('.p-dot')) return;
  const dot = document.createElement('i');
  dot.className = 'p-dot';
  bar.appendChild(dot);
}

// P12: back to top launches with a little ember trail.
function launchTop() {
  $$('[data-top]').forEach((a) => a.addEventListener('click', () => {
    if (reduced.matches) return;
    a.classList.remove('is-launch'); void a.offsetWidth; a.classList.add('is-launch');
    const r = a.getBoundingClientRect();
    sparks(r.left + r.width / 2, r.top + r.height / 2, 8, true);
  }));
}

// P15: privacy popup behaviour shared by every dialog on the site.
function dialogs() {
  const close = (d: HTMLDialogElement) => {
    if (!d.open) return;
    if (reduced.matches) { d.close(); return; }
    d.classList.add('is-closing');
    setTimeout(() => { d.classList.remove('is-closing'); d.close(); }, 210);
  };
  $$<HTMLDialogElement>('dialog').forEach((d) => {
    // a round close button in the corner and a grab bar on phones, on every dialog
    if (!d.querySelector('.dlg__x')) {
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'dlg__x';
      x.setAttribute('aria-label', d.id.includes('privacy') ? 'Close privacy notice' : 'Close');
      x.textContent = '×';
      x.addEventListener('click', () => close(d));
      d.prepend(x);
    }
    if (!d.querySelector('.dlg__grip')) { const g = document.createElement('span'); g.className = 'dlg__grip'; g.setAttribute('aria-hidden', 'true'); d.prepend(g); }
    d.addEventListener('cancel', (e) => { e.preventDefault(); close(d); });
    d.addEventListener('click', (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { e.stopImmediatePropagation(); close(d); }
    }, true);
    // links from emails or the old site: #privacy opens the notice; closing tidies the address
    d.addEventListener('close', () => { if (location.hash === '#privacy' || location.hash === `#${d.id}`) history.replaceState(null, '', location.pathname + location.search); });
  });
  if (location.hash === '#privacy') {
    const own = document.getElementById('privacy') as HTMLDialogElement | null;
    if (own?.showModal) own.showModal();
    else document.querySelector<HTMLElement>('#privacy-link, #application-privacy-link')?.click();
  }
  // a small "Privacy notice" link beside the submit buttons on the apply and track forms
  const addMini = (after: Element | null, trigger: string) => {
    if (!after || after.parentElement?.querySelector('.privacy-mini')) return;
    const a = document.createElement('a');
    a.href = '#privacy';
    a.className = 'privacy-mini';
    a.textContent = 'Privacy notice';
    a.addEventListener('click', (e) => { e.preventDefault(); document.querySelector<HTMLElement>(trigger)?.click(); });
    after.after(a);
  };
  addMini(document.querySelector('#application-form .form-navigation'), '#application-privacy-link');
  addMini(document.querySelector('#track-request button[type=submit]'), '#privacy-link');
}

// Keyboard: anything reached with Tab shows at once, even if its reveal has not played yet.
function focusReveal() {
  document.addEventListener('focusin', (e) => {
    const el = (e.target as Element | null)?.closest?.('[data-r], [data-stage], [data-pop]') as HTMLElement | null;
    if (el && getComputedStyle(el).opacity === '0') { el.style.opacity = '1'; el.style.transform = 'none'; }
  });
}

// S1: service widgets play their loop only while on screen.
function serviceWidgets() {
  const els = $$('[data-sw]');
  if (!els.length || reduced.matches) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-play', e.isIntersecting)), { threshold: 0.35 });
  els.forEach((el) => io.observe(el));
}

// S2: the sticky service bar shows where you are and how far through each service.
function chapters() {
  const bar = document.querySelector<HTMLElement>('[data-chapters]');
  if (!bar) return;
  const wrap = bar.parentElement!;
  const links = $$<HTMLAnchorElement>('[data-chapter]', bar);
  const secs = links.map((a) => document.querySelector<HTMLElement>(`[data-chapter-section="${a.dataset.chapter}"]`));
  let raf = 0;
  const update = () => {
    raf = 0;
    const w = wrap.getBoundingClientRect();
    bar.classList.toggle('is-on', w.top < innerHeight * 0.35 && w.bottom > innerHeight * 0.5);
    const mid = innerHeight * 0.45;
    secs.forEach((sec, i) => {
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      links[i].style.setProperty('--p', p.toFixed(3));
      const active = r.top <= mid && r.bottom > mid;
      links[i].classList.toggle('is-active', active);
      links[i].classList.toggle('is-done', p >= 1);
      if (active) links[i].setAttribute('aria-current', 'location'); else links[i].removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}

// S6: the four-step strip fills as you scroll past it; passed steps get a tick.
function stepStrip() {
  const strips = $$('.pt__steps');
  if (!strips.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    strips.forEach((ol) => {
      const r = ol.getBoundingClientRect();
      const p = reduced.matches ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (innerHeight * 0.55)));
      ol.style.setProperty('--pt', p.toFixed(3));
      $$('li', ol).forEach((li, i, all) => li.classList.toggle('is-passed', p >= (i + 1) / all.length - 0.02));
    });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}

// A1: People. Process. Progress. One panel open at a time; they take turns until someone chooses.
function motto() {
  $$('[data-motto]').forEach((box) => {
    const panels = $$('.motto__p', box);
    let i = 0, timer = 0, auto = !reduced.matches, visible = false;
    const open = (k: number) => {
      i = k;
      panels.forEach((p, n) => { p.classList.toggle('is-open', n === k); p.setAttribute('aria-expanded', String(n === k)); });
      // restart the little timer bar
      box.classList.remove('is-auto'); void box.offsetWidth; if (auto && visible) box.classList.add('is-auto');
      schedule();
    };
    const schedule = () => { clearTimeout(timer); if (auto && visible) timer = window.setTimeout(() => open((i + 1) % panels.length), 5000); };
    const choose = (k: number) => { auto = false; box.classList.remove('is-auto'); clearTimeout(timer); open(k); };
    panels.forEach((p, k) => {
      p.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType === 'mouse') choose(k); });
      p.addEventListener('click', () => choose(k));
      p.addEventListener('focus', () => choose(k));
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(k); } });
    });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) open(i); else clearTimeout(timer); }, { threshold: 0.4 }).observe(box);
  });
}

// A2: the principle in the middle of the screen lights up; the counter and bar follow.
function approach() {
  $$('[data-ap]').forEach((root) => {
    const items = $$('[data-ap-item]', root);
    const count = root.querySelector('[data-ap-count]');
    const bar = root.querySelector<HTMLElement>('[data-ap-bar]');
    if (!items.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = innerHeight * 0.5;
      let best = 0, dist = Infinity;
      items.forEach((it, k) => { const r = it.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - mid); if (d < dist) { dist = d; best = k; } });
      items.forEach((it, k) => it.classList.toggle('is-active', k === best));
      if (count) count.textContent = String(best + 1).padStart(2, '0');
      bar?.style.setProperty('--ap', String((best + 1) / items.length));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  });
}

// A4: the lift display climbs from G to the 1st floor when the office comes into view.
function lift() {
  const el = document.querySelector<HTMLElement>('[data-lift]');
  const floor = el?.querySelector('[data-lift-floor]');
  if (!el || !floor) return;
  if (reduced.matches) { floor.textContent = '1'; el.classList.add('is-arrived'); return; }
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    el.classList.add('is-moving');
    setTimeout(() => { floor.textContent = '1'; el.classList.remove('is-moving'); el.classList.add('is-arrived'); }, 1500);
  }, { threshold: 0.6 });
  io.observe(el);
}

// C1-C4: careers. Reads what careers.js renders and decorates it; the job list itself is untouched.
const DEPT_ICONS: Record<string, string> = {
  agent: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  quality: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  hr: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 13h20"/>',
  tech: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
  all: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5"/>',
};
const deptOf = (t: string) => {
  t = t.toLowerCase();
  if (/agent/.test(t)) return 'agent';
  if (/quality|training/.test(t)) return 'quality';
  if (/team|operation/.test(t)) return 'team';
  if (/hr|admin/.test(t)) return 'hr';
  if (/tech|data|it\b/.test(t)) return 'tech';
  return 'agent';
};
const svg = (k: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${DEPT_ICONS[k]}</svg>`;
function careers() {
  const list = document.getElementById('job-list');
  if (!list) return;
  // rows: department colour and icon, a short ripple as they arrive
  const decorate = () => {
    $$('.job-row', list).forEach((row, i) => {
      if (row.dataset.dept) return;
      const tag = row.querySelector<HTMLElement>('.job-department');
      const d = deptOf(tag?.textContent || '');
      row.dataset.dept = d;
      row.style.setProperty('--i', String(i));
      if (tag && !tag.querySelector('svg')) tag.insertAdjacentHTML('afterbegin', svg(d));
      row.classList.add('is-new');
    });
  };
  new MutationObserver(decorate).observe(list, { childList: true });
  decorate();
  // quick department chips, built from the department list once it loads
  const select = document.getElementById('job-department') as HTMLSelectElement | null;
  const filters = document.querySelector('.job-filters');
  if (select && filters) {
    const box = document.createElement('div');
    box.className = 'dept-chips';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Filter by department');
    filters.after(box);
    const sync = () => $$<HTMLButtonElement>('.dept-chip', box).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === select.value)));
    const build = () => {
      const opts = Array.from(select.options);
      if (opts.length < 2) return;
      box.replaceChildren(...opts.map((o) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dept-chip';
        b.dataset.value = o.value;
        b.innerHTML = svg(o.value ? deptOf(o.textContent || '') : 'all') + `<span>${o.value ? o.textContent : 'All roles'}</span>`;
        b.addEventListener('click', () => { select.value = o.value; select.dispatchEvent(new Event('change', { bubbles: true })); sync(); });
        return b;
      }));
      sync();
    };
    new MutationObserver(build).observe(select, { childList: true });
    select.addEventListener('change', sync);
    document.getElementById('clear-job-filters')?.addEventListener('click', () => setTimeout(sync, 0));
    build();
  }
  // the count gives a small tick when it changes
  const count = document.getElementById('job-count');
  if (count) new MutationObserver(() => { count.classList.remove('is-tick'); void count.offsetWidth; count.classList.add('is-tick'); }).observe(count, { childList: true, characterData: true, subtree: true });
  // the dot on the "what happens next" path travels the line's length
  $$('.steps-flow').forEach((el) => { const set = () => el.style.setProperty('--flow-w', `${Math.round(el.clientWidth * 0.84)}px`); set(); addEventListener('resize', set); });
}

export function initPolish() {
  const run = (fn: () => void) => { try { fn(); } catch (e) { console.error(e); } };
  run(buttonSparks);
  run(shimmer);
  run(flameLine);
  run(progressEmber);
  run(launchTop);
  run(dialogs);
  run(focusReveal);
  run(serviceWidgets);
  run(chapters);
  run(stepStrip);
  run(motto);
  run(approach);
  run(lift);
  run(careers);
}
