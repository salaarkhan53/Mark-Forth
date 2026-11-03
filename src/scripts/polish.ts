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

export function initPolish() {
  const run = (fn: () => void) => { try { fn(); } catch (e) { console.error(e); } };
  run(buttonSparks);
  run(shimmer);
  run(flameLine);
  run(progressEmber);
  run(launchTop);
  run(dialogs);
  run(focusReveal);
}
