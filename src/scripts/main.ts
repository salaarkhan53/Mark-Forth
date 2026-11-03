import { startMotion } from './motion';
import { initPolish } from './polish';

declare global {
  interface Window {
    MFAPI?: { submit(fd: FormData, type: string, id: string): Promise<{ reference: string }>; id(): string };
  }
}

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
// Intl formatters are costly to build; make each one once.
const fmts = new Map<string, Intl.DateTimeFormat>();
const dtf = (tz: string, o: Intl.DateTimeFormatOptions) => {
  const k = tz + JSON.stringify(o);
  let f = fmts.get(k);
  if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, ...o }); fmts.set(k, f); }
  return f;
};

// Old one-page anchors now live on their own pages.
function redirectOldAnchors() {
  if (document.body.dataset.page !== 'home') return;
  const map: Record<string, string> = {
    // #services and #industries are sections on this page; #privacy opens the notice here
    '#contact': '/contact.html', '#about': '/about.html', '#partnership': '/about.html', '#careers': '/careers.html',
  };
  const go = () => {
    const to = map[location.hash];
    if (to) location.replace(to);
  };
  go();
  addEventListener('hashchange', go);
}

function nav() {
  const header = $('.site-header');
  const menu = $<HTMLButtonElement>('.menu');
  const links = $('.links');
  const legacy = document.body.hasAttribute('data-legacy');
  if (menu && links) {
    const set = (open: boolean) => {
      if (!legacy) {
        links.classList.toggle('open', open);
        menu.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
      document.body.classList.toggle('menu-open', open);
      // the header always shows while the menu is open (logo and close button),
      // and the page underneath stops scrolling without shifting sideways
      document.documentElement.classList.toggle('menu-open', open);
      if (open) header?.classList.remove('is-hidden');
      dispatchEvent(new CustomEvent('mf:menu', { detail: open }));
    };
    // On legacy pages the original script toggles the menu; we only mirror the scroll lock.
    menu.addEventListener('click', () => {
      if (legacy) requestAnimationFrame(() => set(links.classList.contains('open')));
      else set(menu.getAttribute('aria-expanded') !== 'true');
    });
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { if (legacy) links.classList.remove('open'); set(false); }));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && links.classList.contains('open')) { if (legacy) links.classList.remove('open'); set(false); menu.focus(); } });
  }
  // Hide the bar while reading down, bring it back on the way up.
  let last = scrollY;
  header?.classList.toggle('is-solid', scrollY > 8);
  addEventListener('scroll', () => {
    const y = scrollY;
    if (!header || document.body.classList.contains('menu-open')) return;
    header.classList.toggle('is-solid', y > 8);
    header.classList.toggle('is-hidden', y > last && y > 600);
    last = y;
  }, { passive: true });
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
    $('.site-header .logo')?.focus();
  }));
}

// Header: one of the emblem's bars slides behind the link under the pointer, and rests on the current page.
function glide() {
  const navEl = $('[data-glide]');
  const bar = navEl?.querySelector<HTMLElement>('.glide');
  if (!navEl || !bar) return;
  const links = $$<HTMLAnchorElement>('a', navEl);
  const current = links.find((a) => a.getAttribute('aria-current') === 'page');
  const moveTo = (a?: HTMLElement) => {
    if (!a) { navEl.classList.remove('has-glide'); return; }
    bar.style.left = `${a.offsetLeft}px`;
    bar.style.width = `${a.offsetWidth}px`;
    navEl.classList.add('has-glide');
  };
  links.forEach((a) => { a.addEventListener('pointerenter', () => moveTo(a)); a.addEventListener('focus', () => moveTo(a)); });
  navEl.addEventListener('pointerleave', () => moveTo(current));
  navEl.addEventListener('focusout', (e) => { if (!navEl.contains(e.relatedTarget as Node)) moveTo(current); });
  const settle = () => moveTo(current);
  document.fonts?.ready.then(settle);
  addEventListener('resize', settle);
  // the capsule changes link sizes; re-measure after it settles
  new MutationObserver(() => setTimeout(settle, 650)).observe($('.site-header')!, { attributes: true, attributeFilter: ['class'] });
  settle();
}

// Campaign explorer: tabs on the left, one campaign at a time on the right.
function campaignExplorer() {
  $$('[data-cx]').forEach((root) => {
    const tabs = $$<HTMLButtonElement>('[role=tab]', root);
    const panels = $$<HTMLElement>('[role=tabpanel]', root);
    const glideEl = root.querySelector<HTMLElement>('.cx__glide');
    if (!tabs.length) return;
    let index = 0, timer = 0, hovering = false, visible = false;
    const dur = 7000;
    const auto = !reduced.matches && matchMedia('(min-width: 1001px)').matches;
    const place = () => {
      const t = tabs[index];
      // the red pill slides (transform only) from the last tab to the chosen one
      if (glideEl && t) {
        glideEl.style.width = `${t.offsetWidth}px`;
        glideEl.style.height = `${t.offsetHeight}px`;
        glideEl.style.transform = `translate3d(${t.offsetLeft}px, ${t.offsetTop}px, 0)`;
      }
    };
    const select = (i: number, focus = false) => {
      const nextIndex = (i + tabs.length) % tabs.length;
      // the artwork slides in from the side we are travelling towards
      if (nextIndex !== index) root.style.setProperty('--dir', String(i > index ? 1 : -1));
      index = nextIndex;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === index)); t.tabIndex = k === index ? 0 : -1; });
      panels.forEach((p, k) => { if (k === index) p.setAttribute('data-active', ''); else p.removeAttribute('data-active'); });
      // restart the progress line
      root.classList.remove('is-playing'); void root.offsetWidth; if (auto && visible) root.classList.add('is-playing');
      place();
      if (focus) tabs[index].focus();
      if (matchMedia('(max-width: 1000px)').matches) {
        const strip = tabs[index].parentElement!;
        const left = tabs[index].offsetLeft - (strip.clientWidth - tabs[index].offsetWidth) / 2;
        strip.scrollTo({ left: Math.max(0, left), behavior: reduced.matches ? 'auto' : 'smooth' });
      }
      schedule();
    };
    const schedule = () => {
      clearTimeout(timer);
      if (!auto || hovering || !visible) return;
      timer = window.setTimeout(() => select(index + 1), dur);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { select(i); });
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); select(index + 1, true); }
        if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); select(index - 1, true); }
        if (k === 'Home') { e.preventDefault(); select(0, true); }
        if (k === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    root.addEventListener('pointerenter', () => { hovering = true; root.classList.add('is-paused'); clearTimeout(timer); });
    root.addEventListener('pointerleave', () => { hovering = false; root.classList.remove('is-paused'); select(index); });
    root.addEventListener('focusin', () => { hovering = true; root.classList.add('is-paused'); clearTimeout(timer); });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget as Node)) { hovering = false; root.classList.remove('is-paused'); schedule(); } });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) select(index); else clearTimeout(timer); }, { threshold: 0.35 }).observe(root);
    addEventListener('resize', place);
    document.fonts?.ready.then(place);
    root.classList.add('is-ready');
    select(0);
  });
}

// Process steps. Wide screens: four cards in one row that light up in turn as the section scrolls by.
// Smaller screens: a row that scrolls sideways (swipe, drag, arrows, or the step names), with the
// counter and the red bar following the row's real scroll position.
function processJourney() {
  $$('[data-pro]').forEach((pro) => {
    const viewport = $('.pro__viewport', pro)!;
    const cards = $$('.pro__card:not(.pro__card--end)', pro);
    const names = $$<HTMLButtonElement>('[data-pro-go]', pro);
    const count = $('[data-pro-count]', pro);
    const bar = $('[data-pro-bar]', pro);
    const prev = $<HTMLButtonElement>('[data-pro-prev]', pro);
    const next = $<HTMLButtonElement>('[data-pro-next]', pro);
    if (!viewport || !cards.length) return;
    const wide = matchMedia('(min-width: 1280px)');
    const n = cards.length;
    let current = -1;
    const setActive = (i: number) => {
      i = Math.max(0, Math.min(n - 1, i));
      if (i === current) return;
      current = i;
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
      names.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
    };
    const setBar = (p: number) => { if (bar) bar.style.transform = `scaleX(${(1 / n + p * (1 - 1 / n)).toFixed(4)})`; };
    const stride = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth);
    const max = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const onRow = () => {
      if (wide.matches) return;
      const m = max();
      const p = m ? viewport.scrollLeft / m : 0;
      setBar(p);
      setActive(Math.round(viewport.scrollLeft / Math.max(1, stride())));
      pro.classList.toggle('at-start', viewport.scrollLeft < 4);
      pro.classList.toggle('at-end', viewport.scrollLeft > m - 4);
      if (prev) prev.disabled = viewport.scrollLeft < 4;
      if (next) next.disabled = viewport.scrollLeft > m - 4;
    };
    // wide: the steps light up one by one while the section crosses the screen
    const onPage = () => {
      if (!wide.matches) return;
      const r = pro.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.1)));
      setBar(p);
      setActive(Math.floor(p * n * 0.999));
    };
    const go = (i: number) => {
      i = Math.max(0, Math.min(n - 1, i));
      if (wide.matches) { setActive(i); return; }
      viewport.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: reduced.matches ? 'auto' : 'smooth' });
    };
    names.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.proGo))));
    prev?.addEventListener('click', () => go(Math.round(viewport.scrollLeft / Math.max(1, stride())) - 1));
    next?.addEventListener('click', () => go(Math.round(viewport.scrollLeft / Math.max(1, stride())) + 1));
    viewport.addEventListener('scroll', onRow, { passive: true });
    addEventListener('scroll', onPage, { passive: true });
    addEventListener('resize', () => { onRow(); onPage(); });
    wide.addEventListener?.('change', () => { onRow(); onPage(); });

    // drag to scroll with a mouse (touch already swipes)
    let down = false, moved = 0, startX = 0, startLeft = 0;
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || wide.matches || e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startLeft = viewport.scrollLeft;
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) pro.classList.add('is-dragging');
      viewport.scrollLeft = startLeft - dx;
    });
    const end = () => {
      if (!down) return;
      down = false;
      pro.classList.remove('is-dragging');
      if (moved > 4) go(Math.round(viewport.scrollLeft / Math.max(1, stride())));
    };
    viewport.addEventListener('pointerup', end);
    viewport.addEventListener('pointercancel', end);
    // a drag never counts as a click on the card's button
    viewport.addEventListener('click', (e) => { if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next?.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev?.click(); }
    });

    setActive(0); setBar(0); onRow(); onPage();
    // first view on a scrolling row: the cards nudge left and back once, a hint that they move
    if (!reduced.matches) {
      const track = $('.pro__track', pro);
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (wide.matches || max() < 8 || !track) return;
        setTimeout(() => track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-20px)' }, { transform: 'translateX(0)' }], { duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }), 600);
      }, { threshold: 0.5 });
      io.observe(viewport);
    }
  });
}

// Application form: the ring and the bar show how much has been completed:
// finished steps plus the share of required fields filled on the current step,
// and 100% once the application is submitted. Reads the original form; changes nothing in it.
function applyProgress() {
  const form = document.getElementById('application-form') as HTMLFormElement | null;
  const nav = document.querySelector<HTMLElement>('.form-navigation');
  if (!form || !nav) return;
  const steps = Array.from(form.querySelectorAll<HTMLElement>('.form-step'));
  const pct = document.querySelector('[data-ring-pct]');
  const submitted = document.getElementById('submit-panel');
  const filled = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) =>
    el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
  const update = () => {
    let v = 0;
    if (submitted && !submitted.hidden) v = 1;
    else {
      const current = steps.findIndex((s) => !s.hidden);
      if (current >= 0) {
        const req = Array.from(steps[current].querySelectorAll<HTMLInputElement>('[required]'))
          .filter((el) => !el.closest('[hidden]') && el.type !== 'hidden' && !el.readOnly);
        const part = req.length ? req.filter(filled).length / req.length : 1;
        v = (current + part) / steps.length;
      }
    }
    v = Math.min(1, Math.max(0, v));
    nav.style.setProperty('--p', String(v));
    document.documentElement.style.setProperty('--apply-p', String(v));
    if (pct) pct.textContent = `${Math.round(v * 100)}%`;
  };
  update();
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  // step changes and the success panel are toggled by the original script
  const watch = new MutationObserver(update);
  steps.forEach((s) => watch.observe(s, { attributes: true, attributeFilter: ['hidden'] }));
  if (submitted) watch.observe(submitted, { attributes: true, attributeFilter: ['hidden'] });
  const count = document.getElementById('step-count');
  if (count) watch.observe(count, { childList: true, characterData: true, subtree: true });
}

// FAQ: answers open and close smoothly (grid rows 0fr to 1fr), one at a time.
function faq() {
  const items = $$<HTMLDetailsElement>('[data-faq]');
  if (!items.length) return;
  const close = (d: HTMLDetailsElement) => {
    if (!d.open) return;
    if (reduced.matches) { d.open = false; d.classList.remove('is-open'); return; }
    d.classList.remove('is-open');
    d.classList.add('is-closing');
    const a = d.querySelector('.faq__a');
    let done = false;
    const finish = () => { if (done) return; done = true; d.open = false; d.classList.remove('is-closing'); };
    a?.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 700);
  };
  items.forEach((d) => {
    const s = d.querySelector('summary');
    s?.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open && !d.classList.contains('is-closing')) { close(d); return; }
      items.forEach((o) => { if (o !== d) close(o); });
      d.classList.remove('is-closing');
      d.open = true;
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
    });
  });
}

// FAQ card: an index that cycles through the questions and follows the one you point at or open.
function faqIndex() {
  $$('[data-faq-index]').forEach((box) => {
    const section = box.closest('section');
    const items = section ? $$<HTMLDetailsElement>('[data-faq]', section) : [];
    const topics: string[] = JSON.parse(box.dataset.topics || '[]');
    const n = $('[data-faq-index-n]', box);
    const word = $('[data-faq-index-word]', box);
    const bars = $$('.faq__index-bars i', box);
    if (!items.length || !n || !word) return;
    let cur = 0, timer = 0, hold = false, visible = false;
    const show = (i: number) => {
      if (i === cur) return;
      cur = i;
      n.textContent = String(i + 1).padStart(2, '0');
      bars.forEach((b, k) => b.classList.toggle('on', k === i));
      word.classList.remove('is-in');
      void word.offsetWidth;
      word.textContent = topics[i] || '';
      word.classList.add('is-in');
      box.classList.remove('is-tick'); void box.offsetWidth; box.classList.add('is-tick');
    };
    const loop = () => {
      clearTimeout(timer);
      if (reduced.matches || hold || !visible) return;
      timer = window.setTimeout(() => { show((cur + 1) % items.length); loop(); }, 2600);
    };
    const openIndex = () => items.findIndex((d) => d.open && !d.classList.contains('is-closing'));
    items.forEach((d, i) => {
      d.addEventListener('pointerenter', () => { hold = true; show(i); clearTimeout(timer); });
      d.addEventListener('pointerleave', () => { const o = openIndex(); hold = o >= 0; if (o >= 0) show(o); loop(); });
      d.querySelector('summary')?.addEventListener('click', () => setTimeout(() => { const o = openIndex(); hold = o >= 0; if (o >= 0) show(o); loop(); }, 30));
    });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(box);
  });
}

// FAQ background: a field of dots that breathes in a slow wave and lights up red around the cursor.
function faqDots() {
  $$<HTMLCanvasElement>('[data-faq-dots]').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    const host = canvas.parentElement!;
    const section = host.parentElement!;
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = false, t = 0;
    const gap = matchMedia('(max-width: 700px)').matches ? 24 : 30;
    const ptr = { x: -9999, y: -9999, k: 0, want: 0 };
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = host.clientWidth; h = host.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced.matches) draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ptr.k += (ptr.want - ptr.k) * 0.08;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const wave = reduced.matches ? 0.5 : (Math.sin(x * 0.012 - y * 0.008 + t * 0.03) + 1) / 2;
          const d = Math.hypot(x - ptr.x, y - ptr.y);
          const near = Math.max(0, 1 - d / 170) * ptr.k;
          const r = 1 + wave * 0.7 + near * 2.4;
          ctx.fillStyle = near > 0.02
            ? `rgba(223,47,24,${(0.18 + near * 0.6).toFixed(3)})`
            : `rgba(13,15,20,${(0.07 + wave * 0.08).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
    const step = () => {
      if (!visible || document.hidden) { raf = 0; return; }
      t++; draw();
      raf = requestAnimationFrame(step);
    };
    new ResizeObserver(size).observe(host);
    size();
    if (reduced.matches) return;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(step); }).observe(host);
    document.addEventListener('visibilitychange', () => { if (visible && !raf) raf = requestAnimationFrame(step); });
    section.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.want = 1; });
    section.addEventListener('pointerleave', () => { ptr.want = 0; });
  });
}

// Scroll progress: the thin line under the header and the ring round the back-to-top button.
function scrollProgress() {
  const line = $('[data-read-progress]');
  const ring = $<SVGCircleElement>('[data-top-ring]');
  if (!line && !ring) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if (line) { line.style.transform = `scaleX(${p.toFixed(4)})`; line.parentElement?.style.setProperty('--p', p.toFixed(4)); }
    if (ring) ring.style.strokeDashoffset = String(Math.round((1 - p) * 1000) / 10);
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}

// Eyebrow labels: the red slash draws first, then the words fade in (CSS, once the section arrives).
function eyebrows() {
  $$('.eyebrow').forEach((el) => {
    if (el.querySelector('.eb-t')) return;
    const span = document.createElement('span');
    span.className = 'eb-t';
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
  });
}

// WhatsApp buttons pulse every few seconds, three times in all, once they are on screen.
function waPulse() {
  const els = $$('.wa-pulse');
  if (!els.length || reduced.matches) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

// Apply: a sticky stepper (five labelled dots on a red line, ticks for finished steps), steps that
// slide in from the side you are moving towards, and a "Draft saved" note. It mirrors the original
// step indicators that application.js already updates; fields and validation are untouched.
function applyStepper() {
  const form = document.getElementById('application-form');
  const indicators = $$('.step-indicator');
  const steps = $$('.form-step');
  if (!form || !indicators.length || !steps.length) return;
  const host = $('.application-tools')?.parentElement;
  if (!host) return;
  const bar = document.createElement('ol');
  bar.className = 'stepper';
  bar.setAttribute('aria-label', 'Application steps');
  bar.innerHTML = indicators.map((_, i) =>
    `<li class="stepper__step"><span class="stepper__dot" aria-hidden="true"><b>${i + 1}</b><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span><span class="stepper__name"></span></li>`,
  ).join('') + '<li class="stepper__line" aria-hidden="true"><i></i></li>';
  // step names are copied as plain text
  $$('.stepper__name', bar).forEach((el, i) => { el.textContent = indicators[i].querySelector('b')?.textContent || `Step ${i + 1}`; });
  const tools = $('.application-tools', host)!;
  tools.after(bar);
  const items = $$('.stepper__step', bar);
  const fill = $('.stepper__line i', bar)!;
  let last = 0;
  const sync = () => {
    const current = steps.findIndex((s) => !s.hidden);
    const submitted = !document.getElementById('submit-panel')?.hidden;
    items.forEach((li, i) => {
      const done = submitted || i < current;
      li.classList.toggle('is-done', done);
      li.classList.toggle('is-current', !submitted && i === current);
      if (!submitted && i === current) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      li.querySelector('.stepper__name')!.setAttribute('aria-label', `${li.textContent}${done ? ', done' : ''}`);
    });
    fill.style.transform = `scaleX(${submitted ? 1 : Math.max(0, current) / (items.length - 1)})`;
    if (current >= 0 && current !== last) form.style.setProperty('--dir', String(current > last ? 1 : -1));
    if (current >= 0) last = current;
  };
  const watch = new MutationObserver(sync);
  steps.forEach((s) => watch.observe(s, { attributes: true, attributeFilter: ['hidden'] }));
  const panel = document.getElementById('submit-panel');
  if (panel) watch.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  sync();

  // "Draft saved" when draft saving is on (the original script saves half a second after typing stops)
  const toggle = document.getElementById('keep-draft') as HTMLInputElement | null;
  if (!toggle) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span>Draft saved in this tab</span>';
  document.body.appendChild(toast);
  let t = 0, h = 0;
  const show = () => {
    clearTimeout(t); clearTimeout(h);
    t = window.setTimeout(() => {
      if (!toggle.checked) return;
      toast.classList.add('is-on');
      h = window.setTimeout(() => toast.classList.remove('is-on'), 1800);
    }, 700);
  };
  form.addEventListener('input', show);
  toggle.addEventListener('change', show);
}

// Track: the status as a vertical timeline (received, screening, interview, decision), and the
// interview times as cards you can pick. Both read what tracking.js and booking.js render.
function trackEnhance() {
  const status = document.getElementById('public-status');
  if (!status) return;
  const stages = ['Received', 'Screening', 'Interview', 'Decision'];
  const tl = document.createElement('ol');
  tl.className = 'track-line';
  tl.setAttribute('aria-label', 'Application stages');
  tl.innerHTML = stages.map((s) => `<li><span aria-hidden="true"></span><b>${s}</b></li>`).join('');
  status.after(tl);
  const stageOf = (t: string) => {
    t = t.toLowerCase();
    if (/offer|hired|selected|reject|decision|not progress|unsuccess|closed|withdrawn/.test(t)) return 3;
    if (/interview/.test(t)) return 2;
    if (/review|screen|shortlist|assess|progress/.test(t)) return 1;
    return 0;
  };
  const sync = () => {
    const k = stageOf(status.textContent || '');
    $$('li', tl).forEach((li, i) => {
      li.classList.toggle('is-done', i < k);
      li.classList.toggle('is-current', i === k);
      if (i === k) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  };
  new MutationObserver(sync).observe(status, { childList: true, characterData: true, subtree: true });
  document.addEventListener('mf-tracking-render', sync);
  sync();

  const select = document.getElementById('booking-slot') as HTMLSelectElement | null;
  if (!select) return;
  const cards = document.createElement('div');
  cards.className = 'slot-cards';
  cards.setAttribute('role', 'group');
  cards.setAttribute('aria-label', 'Available interview times');
  select.after(cards);
  select.classList.add('slot-select');
  // the cards are the control now; the original list stays for the form, out of the tab order
  select.tabIndex = -1;
  const render = () => {
    const opts = Array.from(select.options).filter((o) => o.value);
    cards.replaceChildren(...opts.map((o) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot-card';
      const [when, ...rest] = o.textContent!.split(' · ');
      b.innerHTML = '<span class="slot-card__tick" aria-hidden="true"></span><b></b><small></small>';
      b.querySelector('b')!.textContent = when;
      b.querySelector('small')!.textContent = rest.join(' · ');
      b.setAttribute('aria-pressed', String(select.value === o.value));
      b.addEventListener('click', () => {
        select.value = o.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        $$('.slot-card', cards).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      });
      return b;
    }));
    cards.hidden = !opts.length;
  };
  new MutationObserver(render).observe(select, { childList: true });
  render();
}

function dialogs() {
  $$('[data-dialog]').forEach((a) => a.addEventListener('click', (e) => {
    const d = document.getElementById(a.dataset.dialog!) as HTMLDialogElement | null;
    if (!d?.showModal) return;
    e.preventDefault();
    d.showModal();
  }));
  $$<HTMLDialogElement>('dialog').forEach((d) => {
    d.querySelectorAll('[data-dialog-close]').forEach((b) => b.addEventListener('click', () => d.close()));
    d.addEventListener('click', (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
  });
}

// Live clocks: Rawalpindi and the US hours the floor works to.
// How many hours Rawalpindi is ahead of New York today (changes with US daylight saving).
function hoursAhead() {
  const els = $$('[data-hours]');
  if (!els.length) return;
  const now = new Date();
  const offset = (tz: string) => {
    const p = dtf(tz, { timeZoneName: 'shortOffset' }).formatToParts(now).find((x) => x.type === 'timeZoneName')?.value || '';
    const m = p.match(/GMT([+-]\d+)(?::(\d+))?/);
    return m ? Number(m[1]) + (m[2] ? Math.sign(Number(m[1])) * Number(m[2]) / 60 : 0) : 0;
  };
  const diff = Math.round(offset('Asia/Karachi') - offset('America/New_York'));
  if (diff < 8 || diff > 11) return;
  const words = ['', '', '', '', '', '', '', '', 'eight', 'nine', 'ten', 'eleven'];
  els.forEach((el) => (el.textContent = String(diff)));
  $$('[data-hours-word]').forEach((el) => (el.textContent = words[diff]));
}

// Whether the Rawalpindi team is on its US-hours shift right now: 9 am Eastern to 5 pm Pacific, weekdays.
export function usShift(now = new Date()) {
  const parts = dtf('America/New_York', { weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
  // Pacific 5 pm is always 8 pm Eastern
  const weekday = !['Sat', 'Sun'].includes(get('weekday'));
  return { on: weekday && mins >= 9 * 60 && mins < 20 * 60, weekday, mins };
}

// Offset from UTC, in hours, for a time zone at a given moment.
function tzOffset(tz: string, at: Date) {
  const p = dtf(tz, { timeZoneName: 'shortOffset' }).formatToParts(at).find((x) => x.type === 'timeZoneName')?.value || '';
  const m = p.match(/GMT([+-]\d+)(?::(\d+))?/);
  return m ? Number(m[1]) + (m[2] ? Math.sign(Number(m[1])) * Number(m[2]) / 60 : 0) : 0;
}

// The 24-hour strip: each US zone's 9 to 5, and the team's shift (9 am Eastern to 5 pm Pacific),
// placed on Rawalpindi's clock. Recomputed live, so daylight saving moves the bars by itself.
function overlapChart(now: Date) {
  const chart = $('[data-overlap-chart]');
  if (!chart) return;
  const pk = tzOffset('Asia/Karachi', now);
  const toPk = (tz: string, localHour: number) => (((localHour + pk - tzOffset(tz, now)) % 24) + 24) % 24;
  const place = (row: HTMLElement, from: number, to: number) => {
    const [a, b] = Array.from(row.querySelectorAll<HTMLElement>('.overlap__track i'));
    const set = (el: HTMLElement, x: number, w: number) => { el.style.left = `${(x / 24) * 100}%`; el.style.width = `${(w / 24) * 100}%`; el.hidden = w <= 0; };
    if (to > from) { set(a, from, to - from); set(b, 0, 0); }
    else { set(a, from, 24 - from); set(b, 0, to); }
  };
  $$('[data-ov]', chart).forEach((row) => {
    const tz = row.dataset.ov!;
    if (tz === 'team') place(row, toPk('America/New_York', 9), toPk('America/Los_Angeles', 17));
    else place(row, toPk(tz, 9), toPk(tz, 17));
  });
  const parts = dtf('Asia/Karachi', { hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const h = (Number(parts.find((p) => p.type === 'hour')?.value) % 24) + Number(parts.find((p) => p.type === 'minute')?.value) / 60;
  const nowEl = $('[data-overlap-now]', chart);
  if (nowEl) nowEl.style.setProperty('--now', String(h / 24));
  const fmt = (x: number) => { const hh = Math.round(x) % 24; return `${hh % 12 || 12} ${hh < 12 ? 'am' : 'pm'}`; };
  const sum = $('[data-overlap-summary]', chart);
  if (sum) sum.textContent = `US business hours, 9 am Eastern to 5 pm Pacific, run from ${fmt(toPk('America/New_York', 9))} to ${fmt(toPk('America/Los_Angeles', 17))} in Rawalpindi.`;
}

// Clocks with a breathing colon and minutes that flip when they change.
function tickClock(el: HTMLElement, txt: string) {
  const m = txt.match(/^(\d{1,2}):(\d{2})\s*(.*)$/);
  if (!m) { el.textContent = txt; return; }
  if (!el.querySelector('.tick')) el.innerHTML = '<span class="tick" aria-hidden="true"><span class="tick__h"></span><span class="tick__c">:</span><span class="tick__m"><span></span></span><span class="tick__ap"></span></span><span class="visually-hidden tick__sr"></span>';
  const h = el.querySelector('.tick__h')!, mm = el.querySelector('.tick__m')!, ap = el.querySelector('.tick__ap')!;
  h.textContent = m[1];
  ap.textContent = ` ${m[3]}`;
  el.querySelector('.tick__sr')!.textContent = txt;
  const inner = mm.firstElementChild as HTMLElement;
  if (inner.textContent !== m[2]) {
    const first = inner.textContent === '';
    inner.textContent = m[2];
    if (!first) { mm.classList.remove('is-flip'); void (mm as HTMLElement).offsetWidth; mm.classList.add('is-flip'); }
  }
}

// About: the 24 hour dial. The red arc is the US-hours shift (9 am Eastern to 5 pm Pacific)
// in Rawalpindi time; the hand points at the time in Rawalpindi now.
function aboutDial(now: Date) {
  const dial = $('[data-dial]');
  if (!dial) return;
  const pk = tzOffset('Asia/Karachi', now);
  const toPk = (tz: string, h: number) => (((h + pk - tzOffset(tz, now)) % 24) + 24) % 24;
  const start = toPk('America/New_York', 9), end = toPk('America/Los_Angeles', 17);
  const len = ((end - start) % 24 + 24) % 24;
  const arc = $('[data-dial-shift]', dial);
  if (arc) { arc.setAttribute('stroke-dasharray', `${len} ${24 - len}`); arc.setAttribute('stroke-dashoffset', String(-start)); }
  const parts = dtf('Asia/Karachi', { hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const h = (Number(parts.find((p) => p.type === 'hour')?.value) % 24) + Number(parts.find((p) => p.type === 'minute')?.value) / 60;
  $('[data-dial-hand]', dial)?.style.setProperty('--a', `${((h / 24) * 360).toFixed(2)}deg`);
  const label = $('[data-dial-now]');
  if (label) label.textContent = `${dtf('Asia/Karachi', { hour: 'numeric', minute: '2-digit' }).format(now).toLowerCase()} in Rawalpindi`;
}

function clocks() {
  const els = $$('[data-clock]');
  if (!els.length) return;
  const fmt = (tz: string) => dtf(tz, { hour: 'numeric', minute: '2-digit' });
  const day = (tz: string) => dtf(tz, { weekday: 'long' });
  const tick = () => {
    const now = new Date();
    els.forEach((el) => {
      const tz = el.dataset.clock!;
      const t = el.querySelector('[data-time]');
      const d = el.querySelector('[data-day]');
      if (t) {
        const txt = fmt(tz).format(now).toLowerCase();
        if (t.hasAttribute('data-time-fx')) tickClock(t as HTMLElement, txt);
        else t.textContent = txt;
      }
      if (d) d.textContent = day(tz).format(now);
      const parts = dtf(tz, { weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
      const get = (k: string) => parts.find((p) => p.type === k)?.value || '0';
      const hr = Number(get('hour')) % 24;
      const h = hr + Number(get('minute')) / 60;
      const weekday = !['Sat', 'Sun'].includes(get('weekday'));
      el.classList.toggle('is-night', hr < 6 || hr >= 18);
      // the sky behind each city card follows its local time
      const sky = hr >= 5 && hr < 7 ? 'dawn' : hr >= 7 && hr < 17 ? 'day' : hr >= 17 && hr < 20 ? 'dusk' : 'night';
      ['dawn', 'day', 'dusk', 'night'].forEach((k) => el.classList.toggle(`sky-${k}`, k === sky));
      // sun (6 am to 6 pm) or moon travels a small arc from the left horizon to the right
      const arc = ((h >= 6 && h < 18 ? h - 6 : (h + 6) % 24) / 12) * 180;
      el.style.setProperty('--deg', `${arc.toFixed(1)}deg`);
      // office windows glow while that city is at work; in Rawalpindi, while our team is on its US shift
      el.classList.toggle('is-open', tz === 'Asia/Karachi' ? usShift(now).on : weekday && h >= 9 && h < 17);
    });
    overlapChart(now);
    aboutDial(now);
    // "Live now" chips: on shift through US business hours (9 am Eastern to 5 pm Pacific), Monday to Friday
    $$('[data-shift]').forEach((el) => {
      const s = usShift(now);
      el.classList.toggle('is-on', s.on);
      const state = el.querySelector('[data-shift-state]');
      const lead = el.querySelector('[data-shift-lead]');
      if (lead) lead.textContent = s.on ? 'Live now:' : 'Now';
      if (state) state.textContent = s.on ? 'our team is on shift' : 'our team is back on shift at 9 am Eastern';
      const status = el.querySelector('[data-status-text]');
      if (status) status.textContent = s.on ? 'Our team is online now' : 'Our team is offline now';
    });
    const pk = $('[data-overlap]');
    if (pk) {
      const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now)) % 24;
      const wd = day('America/New_York').format(now);
      const open = h >= 9 && h < 17 && wd !== 'Saturday' && wd !== 'Sunday';
      pk.textContent = open
        ? 'Right now it’s US business hours, and night in Rawalpindi.'
        : 'US business hours run through the Rawalpindi night.';
    }
  };
  tick();
  // every second, so the minutes flip the moment they change (formatters are cached)
  setInterval(tick, 1000);
}

function emblem() {
  $$('[data-emblem]').forEach((el) => {
    const tilt = el.querySelector<HTMLElement>('.emblem__tilt');
    if (!tilt) return;
    const fine = matchMedia('(pointer: fine)');
    el.addEventListener('pointermove', (e) => {
      if (reduced.matches || !fine.matches) return;
      const r = el.getBoundingClientRect();
      tilt.style.setProperty('--ey', `${(((e.clientX - r.left) / r.width) - 0.5) * 26}deg`);
      tilt.style.setProperty('--ex', `${(((e.clientY - r.top) / r.height) - 0.5) * -18}deg`);
    });
    el.addEventListener('pointerleave', () => { tilt.style.removeProperty('--ey'); tilt.style.removeProperty('--ex'); });
    // phones: tilting the device tilts the emblem (8 degrees at most), where the browser allows it
    if (!fine.matches && !reduced.matches) {
      addEventListener('deviceorientation', (e) => {
        if (e.gamma == null || e.beta == null) return;
        const cl = (v: number) => Math.max(-6, Math.min(6, v));
        tilt.style.setProperty('--ey', `${cl(e.gamma / 3).toFixed(1)}deg`);
        tilt.style.setProperty('--ex', `${cl(-(e.beta - 50) / 3).toFixed(1)}deg`);
      }, { passive: true });
    }
    let visible = true;
    const pause = () => el.classList.toggle('is-paused', !visible || document.hidden || reduced.matches);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; pause(); }).observe(el);
    document.addEventListener('visibilitychange', pause);
    addEventListener('scroll', () => {
      if (!visible || reduced.matches) return;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight));
      el.style.setProperty('--sy', `${(p * 28).toFixed(2)}deg`);
    }, { passive: true });
  });
}

// After an enquiry is received: the emblem draws itself, then the promise and the reference.
function showSent(form: HTMLFormElement, reference: string) {
  const card = form.closest('.card') as HTMLElement | null;
  if (!card || card.querySelector('.sent')) return;
  const paths = [
    'M96.6 60.8H467.2L423.1 136.8H140.1Z', 'M48.8 136.8H140.1L180.3 209.4H87.2Z',
    'M381.1 209.4H180.3L224.7 284.1H337.8Z', 'M130.7 284.1H224.7L281.4 381.5L234.9 461.7L130.7 285.8Z',
  ];
  const box = document.createElement('div');
  box.className = 'sent';
  box.setAttribute('role', 'status');
  box.innerHTML = `<svg class="sent__mark" viewBox="35 45 445 430" aria-hidden="true">${paths.map((d, i) => `<path d="${d}" pathLength="1" style="--i:${i}" class="${i === 3 ? 'w' : 'r'}"/>`).join('')}</svg>
    <h3 class="sent__title" tabindex="-1">Enquiry received.</h3>
    <p class="sent__text">We’ll be in touch within 1 business day.</p>
    <p class="sent__ref">Your reference: <b></b></p>`;
  box.querySelector('.sent__ref b')!.textContent = reference;
  card.classList.add('is-sent');
  card.appendChild(box);
  requestAnimationFrame(() => { box.classList.add('is-in'); box.querySelector<HTMLElement>('.sent__title')?.focus({ preventScroll: true }); });
}

// Business enquiry: same fields and endpoint as the live site, through forms-api.js.
function enquiry() {
  const form = $<HTMLFormElement>('#enquiry');
  if (!form) return;
  const select = form.querySelector<HTMLSelectElement>('select[name=service]');
  const want = new URLSearchParams(location.search).get('interest');
  if (want && select && Array.from(select.options).some((o) => o.value === want)) {
    select.value = want;
    // a starter line in the message, ready to finish
    const msg = form.querySelector<HTMLTextAreaElement>('textarea[name=message]');
    const campaigns = ['Medicare', 'ACA', 'Final Expense', 'Auto Insurance', 'Hospital Indemnity', 'Home Improvement'];
    const what = campaigns.includes(want) ? `a ${want} campaign` : want === 'Lead generation partnership' ? 'a lead generation partnership' : want.toLowerCase();
    if (msg && !msg.value && !['Career enquiry', 'Something else'].includes(want)) msg.value = `We’re interested in ${what}. `;
  }
  // inline checks: each required field is checked when you leave it, with a tick once it is right
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required]').forEach((el) => {
    const label = el.closest('label');
    if (!label) return;
    const msg = document.createElement('span');
    msg.className = 'field-msg';
    msg.id = `${el.name}-msg`;
    msg.setAttribute('aria-live', 'polite');
    label.appendChild(msg);
    el.setAttribute('aria-describedby', msg.id);
    const check = (show: boolean) => {
      const ok = el.value.trim() !== '' && el.checkValidity();
      label.classList.toggle('is-valid', ok);
      label.classList.toggle('is-invalid', show && !ok);
      el.setAttribute('aria-invalid', String(show && !ok));
      msg.textContent = show && !ok ? (el.value.trim() === '' ? 'Please fill this in.' : el.validationMessage) : '';
    };
    el.addEventListener('blur', () => check(el.value.trim() !== '' || label.classList.contains('is-invalid')));
    el.addEventListener('input', () => { if (label.classList.contains('is-invalid') || label.classList.contains('is-valid')) check(true); });
  });
  const note = $('#form-note');
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
  let requestId = window.MFAPI?.id() ?? '';
  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy || !window.MFAPI || !button || !note) return;
    if (!form.reportValidity()) return;
    busy = true;
    const label = button.innerHTML;
    button.disabled = true;
    button.classList.add('is-loading');
    button.innerHTML = '<span class="spin" aria-hidden="true"></span>Sending…';
    note.textContent = 'Saving your enquiry securely. Please keep this page open.';
    try {
      if (!requestId) requestId = window.MFAPI.id();
      const result = await window.MFAPI.submit(new FormData(form), 'contact', requestId);
      note.textContent = `Enquiry received. Your reference is ${result.reference}. Our team will review your message.`;
      note.classList.add('is-success');
      button.classList.remove('is-loading');
      button.textContent = 'Enquiry sent';
      form.querySelectorAll<HTMLInputElement>('input,select,textarea').forEach((el) => (el.disabled = true));
      showSent(form, result.reference);
    } catch (err) {
      note.textContent = (err as Error).message || 'We could not confirm your enquiry. Please retry.';
      button.disabled = false;
      button.classList.remove('is-loading');
      button.innerHTML = label;
    } finally {
      busy = false;
    }
  });
}

export function boot() {
  redirectOldAnchors();
  const run = (fn: () => void) => { try { fn(); } catch (e) { console.error(e); } };
  run(nav);
  run(glide);
  run(campaignExplorer);
  run(processJourney);
  run(dialogs);
  run(faq);
  run(faqDots);
  run(faqIndex);
  run(scrollProgress);
  run(eyebrows);
  run(waPulse);
  run(hoursAhead);
  run(() => {
    // Home: the roles figure follows the live job list (same public endpoint the careers page uses).
    const fig = $('[data-roles]');
    if (!fig || document.getElementById('job-list')) return;
    fetch('/api/jobs.php', { cache: 'no-store', headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d) => { if (d && d.ok && Array.isArray(d.positions) && d.positions.length) fig.textContent = String(d.positions.length); })
      .catch(() => {});
  });
  run(() => {
    // Careers: the roles figure follows the live job list once careers.js renders it.
    const list = document.getElementById('job-list'); const fig = $('[data-roles]');
    if (!list || !fig) return;
    const search = document.getElementById('job-search') as HTMLInputElement | null;
    const dept = document.getElementById('job-department') as HTMLSelectElement | null;
    new MutationObserver(() => {
      const n = list.querySelectorAll('.job-row').length;
      if (n && !search?.value && !dept?.value) fig.textContent = String(n);
    }).observe(list, { childList: true });
  });
  run(clocks);
  run(emblem);
  run(enquiry);
  run(applyProgress);
  run(applyStepper);
  run(trackEnhance);
  run(() => {
    // Slanted edges into dark bands: a live line, speed streaks and rising sparks.
    if (reduced.matches) return;
    const bands = $$('.slant-top').filter((el) => getComputedStyle(el).clipPath !== 'none');
    if (!bands.length) return;
    import('./slantfx').then((m) => bands.forEach((b) => m.initSlantFx(b))).catch(() => {});
  });
  run(() => {
    // A small live fire in the scrolled header bar (desktop, full motion only).
    const c = document.querySelector<HTMLCanvasElement>('[data-bar-fire]');
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!c || !header || reduced.matches || !matchMedia('(min-width: 921px)').matches) return;
    import('./firefx').then((m) => m.initBarFire(c, header)).catch(() => {});
  });
  run(() => {
    // Tiny flames around the closing banner.
    const c = document.querySelector<HTMLCanvasElement>('[data-embers]');
    if (!c || reduced.matches) return;
    import('./embers').then((m) => m.initEmbers(c)).catch(() => {});
  });
  run(() => {
    // Real 3D emblem on the home hero; the CSS emblem stays as the fallback.
    // Desktop pointers only, once the page has settled: phones keep the light CSS emblem.
    const c = document.querySelector<HTMLCanvasElement>('[data-emblem3d]');
    if (!c) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!matchMedia('(pointer: fine) and (min-width: 768px)').matches || conn?.saveData) return;
    const go = () => import('./emblem3d').then((m) => m.initEmblem3D(c)).catch((e) => console.warn('3D emblem unavailable', e));
    // it arrives on the first sign of a person (pointer, scroll, key), so it never slows the first paint
    let started = false;
    const start = () => { if (started) return; started = true; evts.forEach((e) => removeEventListener(e, start)); go(); };
    const evts = ['pointermove', 'scroll', 'keydown', 'pointerdown'];
    evts.forEach((e) => addEventListener(e, start, { passive: true }));
  });
  run(initPolish);
  try {
    startMotion();
  } catch (e) {
    console.error(e);
    document.documentElement.classList.remove('js');
  }
}
