import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';


export function startMotion() {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // the house easing for every new motion: cubic-bezier(.2,.8,.2,1)
  CustomEase.create('brand', '0.2,0.8,0.2,1');
  const BRAND = 'brand';
  const legacy = document.body.hasAttribute('data-legacy');
  const fine = matchMedia('(pointer: fine) and (min-width: 921px)').matches;

  // Smooth scrolling on desktop pointers; form pages keep native scrolling.
  let lenis: Lenis | null = null;
  if (fine && !legacy) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not([href="#"])').forEach((a) =>
      a.addEventListener('click', (e) => {
        if (a.hasAttribute('data-dialog') || a.hasAttribute('data-top')) return;
        const target = document.querySelector(a.getAttribute('href')!);
        if (target) { e.preventDefault(); lenis!.scrollTo(target as HTMLElement, { offset: -80 }); }
      }),
    );
    // the menu overlay locks the page underneath
    addEventListener('mf:menu', (e) => ((e as CustomEvent).detail ? lenis!.stop() : lenis!.start()));
  }


  // 1. Hero entrance: label, headline words, text, buttons, then the emblem.
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  if (hero) {
    const head = hero.querySelector<HTMLElement>('[data-headline]');
    // Home: the bars launch first, the emblem settles, then the headline. Inner pages start with the headline.
    const isHome = hero.classList.contains('hero');
    const tl = gsap.timeline({ delay: 0.05 });
    const stage = hero.querySelectorAll('[data-stage]');
    const pop = hero.querySelectorAll('[data-pop]');
    const t0 = performance.now();
    if (head) {
      gsap.set(head, { opacity: 0 });
      ready.then(() => {
        const split = SplitText.create(head, { type: 'words', mask: 'words', wordsClass: 'hw' });
        gsap.set(head, { opacity: 1 });
        hero.classList.add('is-split');
        // its own tween: the intro timeline may already have finished by the time fonts are ready
        const wait = Math.max(0, (isHome ? 0.45 : 0.05) - (performance.now() - t0) / 1000);
        gsap.from(split.words, {
          yPercent: 110, duration: 0.5, ease: BRAND, stagger: 0.04, delay: wait,
          onComplete: () => hero.classList.add('is-streak'),
        });
      });
    }
    tl.to(stage, { opacity: 1, y: 0, duration: 0.6, ease: BRAND, stagger: 0.05 }, isHome ? 0.55 : 0.2);
    if (pop.length) tl.to(pop, { opacity: 1, scale: 1, duration: 0.7, ease: BRAND }, isHome ? 0.3 : 0.15);
    // Signature: the emblem's three forward bars sweep in behind the hero, then drift with the scroll.
    const slashes = hero.querySelectorAll<HTMLElement>('.slashes i');
    if (slashes.length) {
      // the strips come to rest further left (behind the headline on desktop, the emblem on phones)
      tl.fromTo(slashes, { xPercent: -315, opacity: 0 }, { xPercent: -155, opacity: 1, duration: 0.6, ease: BRAND, stagger: 0.1 }, 0);
      // drift uses its own x offset so it never fights the entrance sweep (which uses xPercent)
      slashes.forEach((s, i) => gsap.fromTo(s, { x: 0 }, { x: (i + 1) * 36, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }));
    }
    // Glow blobs lean towards the pointer.
    if (fine) {
      const blobs = hero.querySelectorAll<HTMLElement>('.mesh .blob');
      const qx = Array.from(blobs).map((b) => gsap.quickTo(b, 'x', { duration: 1.6, ease: 'power3' }));
      const qy = Array.from(blobs).map((b) => gsap.quickTo(b, 'y', { duration: 1.6, ease: 'power3' }));
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        qx.forEach((f, i) => f(dx * (i + 1) * 40)); qy.forEach((f, i) => f(dy * (i + 1) * 30));
      });
    }
    // Hero content drifts up and fades as it scrolls away.
    const inner = hero.querySelector('.hero__inner, .page-hero__inner');
    if (inner) gsap.to(inner, { yPercent: -8, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // 2. Section headings rise line by line.
  // Each heading is split only shortly before it scrolls into view, so the first screen stays light.
  ready.then(() => {
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((h) => {
      if (h.closest('[data-hero]')) return;
      ScrollTrigger.create({
        trigger: h, start: 'top bottom+=240', once: true,
        onEnter: () => {
          const split = SplitText.create(h, { type: 'lines', mask: 'lines', linesClass: 'ln' });
          gsap.from(split.lines, { yPercent: 105, duration: 0.7, ease: BRAND, stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 96%', once: true } });
        },
      });
    });
  });

  // 3. Everything else arrives in reading order, group by group.
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((g) => {
    const parts = g.querySelectorAll(':scope [data-r]');
    if (!parts.length) return;
    gsap.to(parts, { opacity: 1, y: 0, duration: 0.6, ease: BRAND, stagger: 0.06, scrollTrigger: { trigger: g, start: 'top 97%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('[data-r]').forEach((el) => {
    if (el.closest('[data-reveal]')) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: BRAND, scrollTrigger: { trigger: el, start: 'top 97%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('[data-pop]').forEach((el) => {
    if (el.closest('[data-hero]')) return;
    gsap.to(el, { opacity: 1, scale: 1, duration: 0.8, ease: BRAND, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // 4. Counters count up once, to whatever value the page holds at that moment.
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        const end = Number(el.textContent) || Number(el.dataset.count) || 0;
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(o.v))) });
      },
    });
  });

  // 5. Process: the red line fills as you read across the steps.
  gsap.utils.toArray<HTMLElement>('[data-process]').forEach((p) => {
    const line = p.querySelector('.process__line i');
    if (line) gsap.to(line, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 } });
  });

  // 6. Campaign rows: a photo follows the pointer.
  gsap.utils.toArray<HTMLElement>('[data-rows]').forEach((rows) => {
    const preview = rows.querySelector<HTMLElement>('.preview');
    if (!preview || !fine) return;
    const x = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
    const shots = preview.querySelectorAll<HTMLElement>('[data-key]');
    rows.querySelectorAll<HTMLElement>('.row').forEach((row) => {
      row.addEventListener('pointerenter', () => {
        preview.classList.add('on');
        shots.forEach((s) => s.classList.toggle('on', s.dataset.key === row.dataset.photo));
      });
      row.addEventListener('pointerleave', () => preview.classList.remove('on'));
    });
    rows.addEventListener('pointermove', (e) => { x(e.clientX + 170); y(e.clientY); });
  });

  // 7. Large photographs drift slightly inside their frames.
  // (the old scroll parallax on photos is replaced by the CSS slow zoom in polish.css)

  // 8. Magnetic primary buttons.
  if (fine) {
    document.querySelectorAll<HTMLElement>('[data-magnetic], .btn-primary').forEach((b) => {
      const mx = gsap.quickTo(b, 'x', { duration: 0.45, ease: 'power3' });
      const my = gsap.quickTo(b, 'y', { duration: 0.45, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        // a gentle pull, never more than 6px
        mx(gsap.utils.clamp(-6, 6, (e.clientX - r.left - r.width / 2) * 0.15));
        my(gsap.utils.clamp(-6, 6, (e.clientY - r.top - r.height / 2) * 0.25));
      });
      b.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  // 9. Sections switch on as they arrive: CSS then runs the small details
  // (eyebrow bars, checklist ticks, tag pills, icon boxes) in sequence.
  ScrollTrigger.batch('section, .site-footer', {
    start: 'top 92%', once: true,
    onEnter: (els) => els.forEach((el) => el.classList.add('in-view')),
  });

  // 10. Photographs open from the bottom edge as they scroll in.
  gsap.utils.toArray<HTMLElement>('.photo').forEach((ph) => {
    if (ph.closest('[data-hero], .cx__panel')) return;
    gsap.fromTo(ph, { clipPath: 'inset(18% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 0.8, ease: BRAND, clearProps: 'clipPath', scrollTrigger: { trigger: ph, start: 'top 90%', once: true } });
  });

  // 11. The faint outlined words inside dark bands drift sideways (60px each way) as the band passes.
  gsap.utils.toArray<HTMLElement>('.edge-mark [data-drift]').forEach((w) => {
    const d = Number(w.dataset.drift) || 1;
    const band = w.closest('section') || w;
    gsap.fromTo(w, { x: -60 * d }, { x: 60 * d, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // 12. Footer: the emblem bars race in from the left.
  const edge = document.querySelectorAll('.foot-edge i');
  if (edge.length) gsap.from(edge, { xPercent: -120, duration: 0.8, ease: BRAND, stagger: 0.1, scrollTrigger: { trigger: '.foot-edge', start: 'top 95%', once: true } });

  // Footer: the slanted name fills with red, left to right, as the page ends.
  // It reads the word's live position every frame, so pages whose height changes
  // after load (job list, application steps, FAQ answers) stay in step on any device.
  const word = document.querySelector<HTMLElement>('[data-ft-word]');
  if (word) {
    const fill = word.querySelector<HTMLElement>('.ft__fill')!;
    const edgeEl = word.querySelector<HTMLElement>('.ft__edge')!;
    let cur = 0;
    gsap.ticker.add(() => {
      const r = word.getBoundingClientRect();
      if (r.top > innerHeight + 200 && cur === 0) return;
      const target = Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height * 0.92)));
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.001) cur = target;
      fill.style.clipPath = `inset(0% ${((1 - cur) * 100).toFixed(2)}% 0% 0%)`;
      edgeEl.style.left = `${(cur * 100).toFixed(2)}%`;
      edgeEl.style.opacity = cur > 0.01 && cur < 0.985 ? '0.7' : '0';
    });
  }

  // FAQ: the big question mark tilts slowly as the section scrolls.
  document.querySelectorAll<HTMLElement>('[data-faq-mark]').forEach((q) => {
    gsap.fromTo(q, { rotation: -8 }, { rotation: 8, ease: 'none', scrollTrigger: { trigger: q.closest('section') || q, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // 13. Cards and panels: a soft red light follows the pointer.
  if (fine) {
    document.querySelectorAll<HTMLElement>('.card, .cx__panel, .stat, .trust li, .clock, .clock-main, .faq__card, .status, .cx__tab, .roles-hero, .bridge').forEach((c) => {
      const spot = document.createElement('span');
      spot.className = 'spot';
      spot.setAttribute('aria-hidden', 'true');
      c.appendChild(spot);
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${e.clientX - r.left}px`);
        c.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // Closing card: a soft red glow drifts after the pointer.
  if (fine) {
    document.querySelectorAll<HTMLElement>('[data-cta]').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--cx', `${Math.round(e.clientX - r.left)}px`);
        c.style.setProperty('--cy', `${Math.round(e.clientY - r.top)}px`);
      });
    });
  }

  // 14. The marquee follows the scroll: faster while reading down, slower on the way up,
  // then eases back to its own pace. Hover pauses it (CSS).
  const tracks = document.querySelectorAll<HTMLElement>('.marquee__track');
  if (tracks.length) {
    let anims: Animation[] = [];
    let rate = 1, want = 1;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        want = gsap.utils.clamp(0.35, 3, 1 + v / 1200);
      },
    });
    gsap.ticker.add(() => {
      if (!anims.length) anims = Array.from(tracks).flatMap((t) => t.getAnimations());
      want += (1 - want) * 0.04;
      const next = rate + (want - rate) * 0.12;
      if (Math.abs(next - rate) < 0.001) return;
      rate = next;
      anims.forEach((a) => (a.playbackRate = rate));
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
  // keep every scroll effect in step when content changes the page height
  let lastH = document.documentElement.scrollHeight, rt = 0;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastH) < 4) return;
    lastH = h; clearTimeout(rt); rt = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
  root.classList.add('motion-on');
}
