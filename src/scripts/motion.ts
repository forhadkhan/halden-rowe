/**
 * Motion layer (DESIGN.md 6): Lenis + GSAP/ScrollTrigger/SplitText driven by data attributes.
 *
 *   data-reveal[="fade"]  M6 staggered entrance (batched, once)
 *   data-split[="hero"]   M2 line reveal; "hero" plays on fonts ready + 120ms instead of on scroll
 *   data-clip             M4 clip reveal, bottom up, inner <img> settles from scale 1.12
 *   data-clip="scrub"     M4s scroll-scrubbed reveal: the frame opens from an inset and the <img> settles from
 *                         scale 1.18 while it scrolls in; frames already on screen at load get the timed M4 instead
 *   data-parallax         M5 soft parallax of the inner <img>: drift plus a slight scale (scrubbed);
 *                         ="desktop" skips phones (< 48rem)
 *   data-speed="0.1"      Depth layer: the element moves `speed` x the scroll distance (positive = faster, closer;
 *                         negative = slower, further). Written to the CSS `translate` property, so it composes
 *                         with any GSAP transform (reveals, magnetic, intros). Tablet and desktop only unless
 *                         data-speed-phone="<n>" gives a phone value. Inside [data-speed-scope] the scope is the
 *                         trigger (shared range, starts at 0 for a hero); data-speed-mode="settle" floats the
 *                         element in from `speed` x the distance and lands it at 0 when the trigger's top reaches
 *                         35% of the viewport (map pins stay on their points once in view)
 *   data-mouse="12"       Pointer depth inside [data-mouse-root]: up to N px toward the pointer (negative = away);
 *                         fine pointer, desktop, motion only
 *   data-count="1234"     M7 count-up; optional data-count-decimals / -prefix / -suffix
 *   data-magnetic         M12 magnetic pull (fine pointer only), [data-magnetic-label] moves 0.4x extra
 *   data-marquee          M8 CSS marquee; [data-marquee-toggle] is its pause button
 *   data-draw             M10 line drawing of an inline SVG, layers in [data-layer] order
 *   data-dim              M21 dimension line draw (adds .is-drawn)
 *   data-letters          M24 letter rise of an inline SVG's paths
 *   data-cursor="view"    M16 "View" disc follows the pointer (fine pointer only); data-cursor-label overrides
 *   data-curtain          M34 pinned hero: stays put while its next sibling slides up over it (fits viewport only)
 *   data-reveal-unit      M26 auto reveal treats this subtree as one block (footer columns)
 *   data-ambient          M27-M33 always-on loops (CSS, html.motion-ok) inside it pause while it is off screen
 *                         (.is-offscreen) and while the tab is hidden (html.is-tab-hidden), through --ambient-play
 *
 * M26 auto reveal: no hand-tagging. Blocks in <main> and the footer (headings, paragraphs, list items/cards,
 * figures and photos, form fields, buttons, [data-reveal-unit]) that sit below the fold when this module runs get
 * data-auto and fade in once, staggered, when 12% of them is on screen (an IntersectionObserver, so even the last
 * line of a page can reach it). The topmost block wins, so a card moves as one. Skipped, subtree included: SKIP
 * below (hero, sliders, FAQ doors, filters and results, steps, places, map, gallery, [hidden], dialogs). With full
 * motion, OWNED elements (data-reveal/split/clip/parallax/speed/mouse/magnetic/draw/letters, plus data-dim and
 * data-count themselves) are left to their own effect and a block holding one is split into its children; a
 * heading becomes data-split (M2 line reveal). Blocks already on screen are never hidden, so nothing flashes.
 *
 * Content is visible without JS: hidden start states live in CSS under html.motion-ok or html.motion-soft only,
 * and both are set here. motion-ok = no reduced-motion preference: every effect. motion-soft = reduced motion:
 * no transforms, parallax, loops or clip; M26 still runs, as a 400ms opacity-only fade, and covers the blocks
 * that M2/M4/M6 would have animated. If this module arrives after the head script's 4s fallback, neither class
 * is set and nothing is hidden. Every tween lives inside gsap.matchMedia(), so flipping the preference reverts it.
 * Page scripts can import { gsap, ScrollTrigger, mm } from this module.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { SCROLL_LOCK_EVENT } from './scroll-lock';
import { site } from '../data/site';

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

window.__motionReady = true;
gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const EASE_OUT = 'power2.out'; // --ease-out
const EASE_OUT_EXPO = 'expo.out'; // --ease-out-expo
const EASE_IN_OUT = 'power2.inOut'; // --ease-in-out

export const mm = gsap.matchMedia();
export { gsap, ScrollTrigger };

const MOTION = '(prefers-reduced-motion: no-preference)';
const FINE = '(hover: hover) and (pointer: fine)';
const PHONE = '(max-width: 47.99rem)';
const WIDE = '(min-width: 48rem)';
const DESKTOP = '(min-width: 64rem)';

const all = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(selector));

/* ------------------------------------------------------------------ motion gate */
/* If this module arrived after the head script's 4s fallback (BaseLayout.astro), the page is already showing
   everything. Then motion-ok stays off and no entrance (hidden-start) animation runs, so visible content never
   disappears again; scroll-linked depth and pointer effects still run. */
export const entranceOk = !root.hasAttribute('data-motion-fallback');

/* ------------------------------------------------------------------ M26 auto reveal */
const UNIT = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,figure,blockquote,table,pre,address,article,picture,.photo,.btn,[data-field],[data-reveal-unit]';
const SKIP =
  '[hidden],dialog,[aria-hidden="true"],.visually-hidden,[data-hero-root],[data-slider],[data-accordion],[data-filters],[data-results],[data-steps],[data-places],[data-map],[data-gallery],[data-marquee]';
const OWNED = '[data-reveal],[data-split],[data-clip],[data-parallax],[data-speed],[data-mouse],[data-magnetic],[data-draw],[data-letters]';

function autoReveal(full: boolean) {
  const fold = window.innerHeight;
  const blocks: HTMLElement[] = [];
  const headings: HTMLElement[] = [];
  const visit = (parent: Element) => {
    for (const el of Array.from(parent.children)) {
      if (!(el instanceof HTMLElement) || el.matches(SKIP)) continue;
      if (full && el.matches(`${OWNED},[data-dim],[data-count]`)) continue;
      const box = el.getBoundingClientRect();
      if (!box.width && !box.height) continue; // not rendered
      if (box.bottom <= fold) continue; // on screen or above it: stays as it is
      const unit = el.matches(UNIT) && !(full && el.querySelector(OWNED));
      if (!unit || box.top < fold) visit(el);
      else if (full && /^H[1-3]$/.test(el.tagName)) headings.push(el);
      else blocks.push(el);
    }
  };
  document.querySelectorAll('main, .site-footer').forEach(visit);

  headings.forEach((el) => el.setAttribute('data-split', '')); // M2 (below) splits and reveals them
  blocks.forEach((el) => el.setAttribute('data-auto', ''));
  const done = (el: HTMLElement) => {
    el.removeAttribute('data-auto');
    gsap.set(el, { clearProps: 'opacity,transform' });
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach(({ target }, i) => {
          io.unobserve(target);
          gsap.to(target, {
            opacity: 1,
            ...(full && { y: 0 }),
            duration: full ? 0.8 : 0.4,
            ease: EASE_OUT,
            delay: Math.min(i, 6) * 0.07,
            onComplete: () => done(target as HTMLElement),
          });
        });
    },
    { threshold: 0.12 },
  );
  blocks.forEach((el) => io.observe(el));

  return () => {
    io.disconnect();
    gsap.killTweensOf(blocks);
    blocks.forEach(done);
    headings.forEach((el) => el.removeAttribute('data-split'));
  };
}

// Runs before the M2 block below, so the headings tagged here are split with the rest.
mm.add({ motion: MOTION, reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
  const { motion } = context.conditions as { motion: boolean };
  root.classList.toggle('motion-ok', motion && entranceOk);
  root.classList.toggle('motion-soft', !motion && entranceOk);
  if (entranceOk) return autoReveal(motion);
});

/* ------------------------------------------------------------------ M27-M33 ambient loops: pause off screen */
mm.add(MOTION, () => {
  const loops = all('[data-ambient]');
  const io = new IntersectionObserver((entries) =>
    entries.forEach(({ target, isIntersecting }) => target.classList.toggle('is-offscreen', !isIntersecting)),
  );
  loops.forEach((el) => io.observe(el));
  const onVisibility = () => root.classList.toggle('is-tab-hidden', document.hidden);
  document.addEventListener('visibilitychange', onVisibility);
  onVisibility();
  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    loops.forEach((el) => el.classList.remove('is-offscreen'));
    root.classList.remove('is-tab-hidden');
  };
});

/* ------------------------------------------------------------------ M34 curtain (data-curtain) */
/* The element stays pinned (CSS .is-curtain: sticky) while its next sibling, opaque and stacked above it, slides
   over; its children dim and settle back as they are covered. Only while it fits the small viewport (clientHeight),
   so a tall hero on a phone or a short screen scrolls normally and nothing in it is ever out of reach. */
mm.add(MOTION, () => {
  const hero = document.querySelector<HTMLElement>('[data-curtain]');
  const cover = hero?.nextElementSibling;
  if (!hero || !cover) return;
  let tween: gsap.core.Tween | undefined;
  const reset = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = undefined;
    gsap.set(hero.children, { clearProps: 'opacity,scale' });
  };
  const fit = () => {
    const on = hero.offsetHeight <= root.clientHeight;
    if (on === hero.classList.contains('is-curtain')) return;
    hero.classList.toggle('is-curtain', on);
    reset();
    if (on) {
      tween = gsap.to(hero.children, {
        opacity: 0.4,
        scale: 0.96,
        ease: 'none',
        // From scroll 0, not 'top bottom': the cover already peeks into the first screen, and the hero must
        // load undimmed.
        // Fully covered, the pinned hero is still "on screen" for the ambient observer: pause its loops here.
        scrollTrigger: {
          trigger: cover,
          start: 0,
          end: 'top top',
          scrub: true,
          onLeave: () => hero.classList.add('is-offscreen'),
          onEnterBack: () => hero.classList.remove('is-offscreen'),
        },
      });
    }
  };
  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(hero);
  window.addEventListener('resize', fit);
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', fit);
    reset();
    hero.classList.remove('is-curtain');
  };
});

/* ------------------------------------------------------------------ count-up (M7) */
/* Structure is built for everyone so screen readers always get the final value once. */
const counters = all('[data-count]').map((el) => {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.countDecimals ?? 0);
  const format = new Intl.NumberFormat(site.locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const text = (n: number) => `${el.dataset.countPrefix ?? ''}${format.format(n)}${el.dataset.countSuffix ?? ''}`;
  const final = el.textContent?.trim() || text(target);
  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  shown.textContent = final;
  const spoken = document.createElement('span');
  spoken.className = 'visually-hidden';
  spoken.textContent = final;
  el.replaceChildren(shown, spoken);
  return { el, shown, target, text, final };
});

/* ------------------------------------------------------------------ motion-only effects */
mm.add(MOTION, (context) => {
  if (!entranceOk) return;
  let active = true;

  // M6 staggered entrance
  ScrollTrigger.batch(all('[data-reveal]'), {
    start: 'top 88%',
    once: true,
    batchMax: 6,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.07, overwrite: true }),
  });

  // M2 line reveal (aria: SplitText keeps an aria-label with the full text and hides the line spans).
  // The split waits for fonts, after this callback has returned, so context.add() puts it back in this
  // matchMedia context (reverted with it), and it is skipped when reduced motion switched on first.
  document.fonts.ready.then(() => {
    if (!active) return;
    context.add(() => {
      all('[data-split]').forEach((el) => {
        const hero = el.dataset.split === 'hero';
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          aria: 'auto',
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: 'visible' });
            return gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.1,
              ease: EASE_OUT_EXPO,
              stagger: 0.11,
              delay: hero ? 0.12 : 0,
              scrollTrigger: hero ? undefined : { trigger: el, start: 'top 82%', once: true },
            });
          },
        });
      });
    });
  });

  // M4 clip reveal; "scrub" ties it to scroll unless the frame is already on screen (a page-top photo must not
  // load half-closed). The image scale is skipped when M5 owns the image (here or on an inner wrapper).
  all('[data-clip]').forEach((el) => {
    const img = el.querySelector('img');
    const ownsImg = img && !el.hasAttribute('data-parallax') && !el.querySelector('[data-parallax]');
    if (el.dataset.clip === 'scrub' && el.getBoundingClientRect().top > window.innerHeight) {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: 0.4 },
      });
      tl.fromTo(el, { clipPath: 'inset(12% 9% 12% 9%)' }, { clipPath: 'inset(0% 0% 0% 0%)' });
      if (ownsImg) tl.fromTo(img, { scale: 1.18 }, { scale: 1 }, 0);
      return;
    }
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: EASE_OUT_EXPO });
    if (ownsImg) tl.from(img, { scale: 1.12, duration: 1.1, ease: EASE_OUT_EXPO }, 0);
  });

  // M7 count-up
  counters.forEach(({ el, shown, target, text, final }, i) => {
    const state = { n: 0 };
    shown.textContent = text(0);
    gsap.to(state, {
      n: target,
      duration: 1.8,
      ease: 'power2.out',
      delay: (i % 4) * 0.12,
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      onUpdate: () => {
        shown.textContent = text(state.n);
      },
      onComplete: () => {
        shown.textContent = final;
      },
    });
  });

  // M10 line draw: layers in data-layer order, 250ms apart, 1.6s per drawing
  all('[data-draw]').forEach((el) => {
    const layers = all<SVGGElement>('[data-layer]', el);
    const groups = layers.length
      ? layers.map((layer) => all<SVGPathElement>('path', layer))
      : [all<SVGPathElement>('path', el)];
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', once: true } });
    const per = Math.max(0.4, 1.6 - 0.25 * (groups.length - 1));
    groups.forEach((paths, i) => tl.to(paths, { strokeDashoffset: 0, duration: per, ease: EASE_IN_OUT }, i * 0.25));
  });

  // M21 dimension lines
  all('[data-dim]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => el.classList.add('is-drawn') });
  });

  // M24 letter rise
  all('[data-letters]').forEach((el) => {
    gsap.from(all<SVGPathElement>('path', el), {
      yPercent: 100,
      duration: 1.1,
      ease: EASE_OUT_EXPO,
      stagger: 0.04,
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });

  return () => {
    active = false;
    counters.forEach(({ shown, final }) => {
      shown.textContent = final;
    });
    all('.dim.is-drawn').forEach((el) => el.classList.remove('is-drawn'));
  };
});

/* ------------------------------------------------------------------ M5 parallax and depth layers */
/* Phones get the lighter set (only data-speed-phone layers, no "desktop" parallax); crossing 48rem reverts and
   rebuilds through matchMedia. */
mm.add({ phone: `${MOTION} and ${PHONE}`, wide: `${MOTION} and ${WIDE}` }, (context) => {
  const { phone, wide } = context.conditions as { phone: boolean; wide: boolean };
  if (!phone && !wide) return;

  // M5: drift plus a slight settle in scale. Scale never drops below 1.12, so the 5% drift (6% spare per
  // edge) never shows the frame's edge.
  all('[data-parallax]').forEach((el) => {
    const img = el.querySelector('img');
    if (!img || (phone && el.dataset.parallax === 'desktop')) return;
    gsap.set(el, { overflow: 'clip' });
    gsap.fromTo(
      img,
      { yPercent: -5, scale: 1.18 },
      { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  // Depth layers: plain ScrollTriggers writing `translate`, so no tween per element and nothing to fight.
  // A layer that is its own trigger (or sits inside another trigger) must be measured at rest, so from
  // refreshInit to refresh every translate is cleared and no write runs (a scroll update mid-refresh would put a
  // stale offset back); once ScrollTrigger has measured, each layer is written from its new start and end.
  let measuring = false;
  const writers: Array<() => void> = [];
  const layers = all('[data-speed]').filter((el) => {
    const speed = Number(phone ? (el.dataset.speedPhone ?? 0) : el.dataset.speed);
    if (!speed) return false;
    const settle = el.dataset.speedMode === 'settle';
    // Rest point: settle layers land at the end; others sit at 0 when centred in the viewport, except a trigger
    // already on screen at scroll 0 (start clamped to 0, e.g. the hero), which rests at the top so it cannot jump.
    const write = (self: ScrollTrigger) => {
      if (measuring) return;
      const distance = self.end - self.start;
      const rest = self.start <= 0 ? 0 : 0.5;
      const y = settle ? speed * (1 - self.progress) * distance : -speed * (self.progress - rest) * distance;
      el.style.translate = `0 ${y.toFixed(1)}px`;
    };
    el.classList.add('is-layer');
    const st = ScrollTrigger.create({
      trigger: el.closest('[data-speed-scope]') ?? el,
      start: settle ? 'top bottom' : 'clamp(top bottom)',
      end: settle ? 'top 35%' : 'bottom top',
      onUpdate: write,
      onRefresh: write,
    });
    writers.push(() => write(st));
    return true;
  });

  const startMeasure = () => {
    measuring = true;
    layers.forEach((el) => el.style.removeProperty('translate'));
  };
  const endMeasure = () => {
    measuring = false;
    writers.forEach((w) => w());
  };
  ScrollTrigger.addEventListener('refreshInit', startMeasure);
  ScrollTrigger.addEventListener('refresh', endMeasure);

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', startMeasure);
    ScrollTrigger.removeEventListener('refresh', endMeasure);
    measuring = false;
    layers.forEach((el) => {
      el.style.removeProperty('translate');
      el.classList.remove('is-layer');
    });
  };
});

/* ------------------------------------------------------------------ pointer depth (data-mouse) */
mm.add(`${MOTION} and ${FINE} and ${DESKTOP}`, () => {
  const cleanups = all('[data-mouse-root]').map((root) => {
    const movers = all('[data-mouse]', root).map((el) => {
      const depth = Number(el.dataset.mouse) || 0;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
      return (nx: number, ny: number) => {
        xTo(nx * depth);
        yTo(ny * depth);
      };
    });
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = root.getBoundingClientRect();
      const nx = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width) * 2 - 1);
      const ny = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
      movers.forEach((to) => to(nx, ny));
    };
    const leave = () => movers.forEach((to) => to(0, 0));
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', leave);
    return () => {
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
    };
  });
  return () => cleanups.forEach((fn) => fn());
});

/* ------------------------------------------------------------------ fine pointer + motion */
mm.add(`${MOTION} and ${FINE}`, () => {
  // Lenis smooth scroll, driven by GSAP's ticker
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  const onLock = (event: Event) => {
    if ((event as CustomEvent<{ locked: boolean }>).detail.locked) lenis.stop();
    else lenis.start();
  };
  document.addEventListener(SCROLL_LOCK_EVENT, onLock);
  if (root.hasAttribute('data-scroll-locked')) lenis.stop();

  // M12 magnetic buttons: max ~6px, label 0.4x extra
  const cleanups = all('[data-magnetic]').map((el) => {
    const label = el.querySelector<HTMLElement>('[data-magnetic-label]');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    const lxTo = label ? gsap.quickTo(label, 'x', { duration: 0.4, ease: 'power3.out' }) : undefined;
    const lyTo = label ? gsap.quickTo(label, 'y', { duration: 0.4, ease: 'power3.out' }) : undefined;
    const clamp = gsap.utils.clamp(-6, 6);
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = clamp((event.clientX - (rect.left + rect.width / 2)) * 0.25);
      const dy = clamp((event.clientY - (rect.top + rect.height / 2)) * 0.25);
      xTo(dx);
      yTo(dy);
      lxTo?.(dx * 0.4);
      lyTo?.(dy * 0.4);
    };
    const leave = () => {
      gsap.to(label ? [el, label] : el, { x: 0, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  });

  return () => {
    document.removeEventListener(SCROLL_LOCK_EVENT, onLock);
    gsap.ticker.remove(raf);
    lenis.destroy();
    cleanups.forEach((fn) => fn());
  };
});

/* ------------------------------------------------------------------ cursor follow (M16) */
/* A 76px ink disc labelled "View" follows the pointer inside [data-cursor="view"] (card images, gallery).
   Decorative (aria-hidden, pointer-events none); the native cursor stays visible. data-cursor-label overrides
   the label; inside a night section the disc turns brass 300 with night text. */
mm.add(`${MOTION} and ${FINE}`, () => {
  const zones = all('[data-cursor="view"]');
  if (!zones.length) return;
  const disc = document.createElement('div');
  disc.setAttribute('aria-hidden', 'true');
  disc.className = 'cursor-view';
  disc.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'z-index: var(--z-cursor)',
    'display: grid',
    'place-items: center',
    'width: 76px',
    'height: 76px',
    'border-radius: 50%',
    'pointer-events: none',
    'font-family: var(--font-sans)',
    'font-size: var(--text-small)',
    'font-weight: var(--weight-strong)',
  ].join(';');
  document.body.append(disc);
  gsap.set(disc, { xPercent: -50, yPercent: -50, scale: 0 });
  const xTo = gsap.quickTo(disc, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(disc, 'y', { duration: 0.35, ease: 'power3.out' });
  let active = false;

  const move = (event: PointerEvent) => {
    xTo(event.clientX);
    yTo(event.clientY);
  };
  const handlers = zones.map((zone) => {
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const night = Boolean(zone.closest('[data-scheme="night"], .scheme-night'));
      disc.textContent = zone.dataset.cursorLabel || 'View';
      disc.style.backgroundColor = night ? 'var(--hr-brass-300)' : 'var(--hr-ink-900)';
      disc.style.color = night ? 'var(--hr-night-900)' : 'var(--hr-ivory)';
      if (!active) gsap.set(disc, { x: event.clientX, y: event.clientY });
      active = true;
      gsap.to(disc, { scale: 1, duration: 0.28, ease: 'power3.out', overwrite: 'auto' });
    };
    const leave = () => {
      active = false;
      gsap.to(disc, { scale: 0, duration: 0.28, ease: 'power3.out', overwrite: 'auto' });
    };
    zone.addEventListener('pointerenter', enter);
    zone.addEventListener('pointerleave', leave);
    return { zone, enter, leave };
  });
  window.addEventListener('pointermove', move, { passive: true });

  return () => {
    window.removeEventListener('pointermove', move);
    handlers.forEach(({ zone, enter, leave }) => {
      zone.removeEventListener('pointerenter', enter);
      zone.removeEventListener('pointerleave', leave);
    });
    disc.remove();
  };
});

/* ------------------------------------------------------------------ marquee pause (M8, WCAG 2.2.2) */
all('[data-marquee]').forEach((el) => {
  const toggle = el.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
  toggle?.addEventListener('click', () => {
    const paused = el.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
  });
});

/* ------------------------------------------------------------------ refresh after images load */
let refreshQueued = 0;
const queueRefresh = () => {
  window.clearTimeout(refreshQueued);
  refreshQueued = window.setTimeout(() => ScrollTrigger.refresh(), 150);
};
all<HTMLImageElement>('img').forEach((img) => {
  if (!img.complete) img.addEventListener('load', queueRefresh, { once: true });
});
// This module loads after the LCP photo (BaseLayout), so the page may have finished loading already.
if (document.readyState === 'complete') queueRefresh();
else window.addEventListener('load', queueRefresh, { once: true });
document.fonts.ready.then(queueRefresh);
