/**
 * Home page behaviour (DESIGN.md 11.1). Shared motion (M2, M4-M8, M10, M12, M16, M21) comes from motion.ts via
 * data attributes; this file adds the home-only parts:
 *   search panel tabs, "More options", price range -> min/max (10.6)
 *   hero dome scale-in + tower rise
 *   featured scroll moment (scrubbed clip on the large photo, row drift; timed M4 below 64rem)
 *   services scroll region + progress line (H5)
 *   map: coast draw, M11 pin drop + pulse, chips, M22 popups, list <-> pin highlight (10.13)
 *   M9 pinned how-it-works (desktop + motion)
 *   M23 neighbourhood photo swap
 * Everything works without it: forms submit, all panels and fields show, the list replaces the map.
 */
import { gsap, ScrollTrigger, mm, entranceOk } from './motion';

const MOTION = '(prefers-reduced-motion: no-preference)';
const DESKTOP = '(min-width: 64rem)';
const EASE_OUT = 'power2.out';

const $ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  scope.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(selector));

/* ------------------------------------------------------------------ search panel (10.6) */
function initSearch() {
  const root = $('[data-search]');
  if (!root) return;
  const tabs = $$<HTMLButtonElement>('[data-search-tab]', root);
  const panels = $$('[data-search-panel]', root);

  const select = (index: number, focus: boolean) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i]?.classList.toggle('is-active', on);
      if (panels[i]) panels[i].hidden = !on;
    });
    if (focus) tabs[index]?.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const to =
        event.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
        : event.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
        : event.key === 'Home' ? 0
        : event.key === 'End' ? last
        : -1;
      if (to < 0) return;
      event.preventDefault();
      select(to, true);
    });
  });
  select(0, false);

  // "More options" disclosure (phones only; CSS shows everything from 768px).
  $$<HTMLButtonElement>('[data-search-more]', root).forEach((button) => {
    const target = document.getElementById(button.getAttribute('aria-controls') ?? '');
    const label = $('[data-search-more-label]', button);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      target?.classList.toggle('is-open', open);
      if (label) label.textContent = (open ? button.dataset.labelFewer : button.dataset.labelMore) ?? '';
    });
  });

  // The price select carries "min-max"; the /properties contract wants min and max. Empty fields are dropped
  // so the URL stays short (an empty search shows every home).
  $$<HTMLFormElement>('form', root).forEach((form) => {
    form.addEventListener('formdata', (event) => {
      const data = event.formData;
      const price = data.get('price');
      data.delete('price');
      if (typeof price === 'string' && price.includes('-')) {
        const [min, max] = price.split('-');
        if (min) data.set('min', min);
        if (max) data.set('max', max);
      }
      for (const [key, value] of Array.from(data.entries())) {
        if (value === '') data.delete(key);
      }
    });
  });
}

/* ------------------------------------------------------------------ hero (dome scale-in, tower rise) */
function initHero() {
  const hero = $('[data-hero-root]');
  if (!hero) return;
  const dome = $('[data-hero-dome]', hero);
  const tower = $('[data-hero-tower]', hero);
  if (!entranceOk) return;

  mm.add(MOTION, () => {
    // CSS holds the start states (dome scaled down and clear, tower 2.5rem low and a little faded; the tower is
    // never fully transparent so it stays the LCP). Transforms only: nothing moves in the layout.
    // M2 (the headline) starts on fonts ready + 120ms in motion.ts; the stage follows it.
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (dome) tl.to(dome, { scale: 1, opacity: 1, duration: 1.3 }, 0.1);
    if (tower) tl.to(tower, { y: 0, opacity: 1, duration: 1.2 }, 0.3);
    return () => {
      tl.kill();
      gsap.set([dome, tower].filter(Boolean), { clearProps: 'opacity,transform' });
    };
  });
}

/* ------------------------------------------------------------------ featured (scroll moment) */
/* Desktop: the large photo opens with the scroll (scrubbed inset clip) while the row of three cards drifts in
   from the right at three rates and lands in its grid place; the tall second card is a depth layer
   (Featured.astro). Nothing pins, so nothing changes on phones but the timed M4 on the large photo. The image
   itself belongs to M5 (data-parallax) from 48rem, so only phones scale it here. */
function initFeatured() {
  const frame = $('.featured .property-card--large .photo');
  const row = $$('.featured__item--3, .featured__item--4, .featured__item--5');
  if (!frame) return;
  mm.add(
    { desktop: `${MOTION} and ${DESKTOP}`, phone: `${MOTION} and (max-width: 47.99rem)`, motion: MOTION },
    (context) => {
      const { desktop, phone, motion } = context.conditions as { desktop: boolean; phone: boolean; motion: boolean };
      if (!motion) return;
      if (desktop) {
        gsap.fromTo(
          frame,
          { clipPath: 'inset(10% 8% 10% 8%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'top 30%', scrub: 0.4 } },
        );
        const visible = row.filter((item) => item.offsetParent);
        if (visible.length) {
          gsap.fromTo(
            visible,
            { x: (i: number) => 64 * (i + 1) },
            { x: 0, ease: 'none', scrollTrigger: { trigger: visible[0], start: 'top bottom', end: 'top 45%', scrub: 0.5 } },
          );
        }
        return;
      }
      if (!entranceOk) return;
      const img = $('img', frame);
      const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } });
      tl.fromTo(frame, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out' });
      if (img && phone) tl.from(img, { scale: 1.12, duration: 1.1, ease: 'expo.out' }, 0);
    },
  );
}

/* ------------------------------------------------------------------ services row (H5, phones) */
function initServices() {
  const row = $('[data-services-row]');
  const fill = $('[data-services-progress]');
  if (!row) return;
  // The region is a tab stop only while it actually scrolls (phones).
  const sync = () => {
    const scrolls = row.scrollWidth > row.clientWidth + 1;
    if (scrolls) row.setAttribute('tabindex', '0');
    else row.removeAttribute('tabindex');
    update();
  };
  const update = () => {
    if (!fill) return;
    const max = row.scrollWidth - row.clientWidth;
    const visible = row.clientWidth / row.scrollWidth;
    const progress = max > 0 ? row.scrollLeft / max : 1;
    fill.style.setProperty('--size', String(visible));
    fill.style.setProperty('--pos', String(progress * (1 - visible)));
  };
  row.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(sync).observe(row);
  sync();
}

/* ------------------------------------------------------------------ map (10.13) */
function initMap() {
  const section = $('[data-map-section]');
  const map = $('[data-map]', section ?? document);
  if (!section || !map) return;
  const pins = $$<HTMLButtonElement>('[data-pin]', map);
  const popups = new Map($$('[data-popup]', map).map((p) => [p.dataset.popup ?? '', p]));
  const rows = $$('[data-row]', section);
  const chips = $$<HTMLButtonElement>('[data-map-filter]', section);
  const phone = window.matchMedia('(max-width: 47.99rem)');
  let open: HTMLButtonElement | null = null;
  let closeTimer = 0;

  const place = (pin: HTMLButtonElement, popup: HTMLElement) => {
    popup.style.removeProperty('left');
    popup.style.removeProperty('top');
    if (phone.matches) return; // docks under the map, in flow
    const frame = map.getBoundingClientRect();
    const pinBox = pin.getBoundingClientRect();
    const dot = $('.pin__dot', pin)?.getBoundingClientRect() ?? pinBox;
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    const gap = 8;
    const dotX = dot.left + dot.width / 2 - frame.left;
    const top = pinBox.top - frame.top;
    const bottom = pinBox.bottom - frame.top;
    const above = top - gap - height;
    // Above the pin (8px gap); below when the pin is within 240px of the map top. When the card fits on neither
    // side of a short map, it takes the side with more room so it leaves the frame as little as possible.
    const room = frame.height - bottom - gap;
    const below = top < 240 || (above < 0 && room >= height) || (above < 0 && room < height && room > top - gap);
    const y = below ? bottom + gap : above;
    const x = Math.min(Math.max(dotX - width / 2, 0), Math.max(frame.width - width, 0));
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.setProperty('--origin', `${dotX - x}px ${below ? '0' : '100%'}`);
  };

  const close = (returnFocus: boolean) => {
    if (!open) return;
    const pin = open;
    const popup = popups.get(pin.dataset.pin ?? '');
    open = null;
    pin.setAttribute('aria-expanded', 'false');
    if (popup) {
      popup.classList.remove('is-open');
      window.clearTimeout(closeTimer);
      const ms = document.documentElement.classList.contains('motion-ok') ? 150 : 0;
      closeTimer = window.setTimeout(() => {
        if (!popup.classList.contains('is-open')) popup.hidden = true;
      }, ms);
    }
    if (returnFocus) pin.focus();
  };

  const show = (pin: HTMLButtonElement) => {
    if (open === pin) return close(false);
    close(false);
    const popup = popups.get(pin.dataset.pin ?? '');
    if (!popup) return;
    window.clearTimeout(closeTimer);
    popups.forEach((p) => {
      if (p !== popup && !p.classList.contains('is-open')) p.hidden = true;
    });
    popup.hidden = false;
    place(pin, popup);
    // Next frame so the M22 transition runs from its start state.
    requestAnimationFrame(() => {
      if (open === pin) popup.classList.add('is-open');
    });
    pin.setAttribute('aria-expanded', 'true');
    open = pin;
  };

  pins.forEach((pin) => pin.addEventListener('click', () => show(pin)));
  popups.forEach((popup) => {
    $('[data-popup-close]', popup)?.addEventListener('click', () => close(true));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !open) return;
    const popup = popups.get(open.dataset.pin ?? '');
    const inside = popup?.contains(document.activeElement) || open === document.activeElement;
    close(Boolean(inside));
  });
  document.addEventListener('pointerdown', (event) => {
    if (!open) return;
    const target = event.target as Node;
    const popup = popups.get(open.dataset.pin ?? '');
    if (popup?.contains(target) || open.contains(target)) return;
    close(false);
  });
  window.addEventListener('resize', () => {
    if (!open) return;
    const popup = popups.get(open.dataset.pin ?? '');
    if (popup) place(open, popup);
  });

  // List rows light up their pin (hover state only, nothing opens).
  rows.forEach((row) => {
    const pin = pins.find((p) => p.dataset.pin === row.dataset.row);
    if (!pin) return;
    const on = () => pin.classList.add('is-hot');
    const off = () => pin.classList.remove('is-hot');
    row.addEventListener('pointerenter', on);
    row.addEventListener('pointerleave', off);
    row.addEventListener('focusin', on);
    row.addEventListener('focusout', off);
  });

  // Chips: single choice; filtered-out pins and rows are removed (hidden), not dimmed.
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.mapFilter ?? 'all';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const visible = (status?: string) => filter === 'all' || status === filter;
      pins.forEach((pin) => {
        const show = visible(pin.dataset.status);
        pin.hidden = !show;
        if (!show && open === pin) close(false);
      });
      rows.forEach((row) => {
        row.hidden = !visible(row.dataset.status);
      });
    });
  });

  // M10-style coast draw, then M11 pin drop; the CSS pulse starts once the pins have landed.
  if (!entranceOk) return;
  mm.add(MOTION, () => {
    const coast = $$<SVGPathElement>('[data-map-coast] path', map);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: map, start: 'top 70%', once: true },
      onComplete: () => map.classList.add('is-live'),
    });
    tl.fromTo(coast, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
    tl.fromTo(pins, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: EASE_OUT, stagger: 0.08 }, 0.5);
    return () => map.classList.remove('is-live');
  });
}

/* ------------------------------------------------------------------ how it works (M9) */
function initSteps() {
  const section = $('[data-steps]');
  if (!section) return;
  const steps = $$('[data-step]', section);
  const drawings = $$('.steps__drawing', section);
  const fill = $('[data-steps-fill]', section);

  mm.add(`${MOTION} and ${DESKTOP}`, () => {
    section.classList.add('is-pinned');
    gsap.set(steps, { opacity: 0, y: 16 });
    gsap.set(steps[0] ?? [], { opacity: 1, y: 0 });
    gsap.set(drawings, { opacity: 0 });
    gsap.set(drawings[0] ?? [], { opacity: 1 });
    const pathsOf = (el: Element) => {
      const layers = $$('[data-layer]', el);
      return layers.length ? layers.map((layer) => $$('path', layer)) : [$$('path', el)];
    };
    gsap.set($$('path', section.querySelector('.steps__stage') ?? section), { strokeDasharray: 1, strokeDashoffset: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 0.6,
        refreshPriority: 1,
        anticipatePin: 1,
      },
    });
    if (fill) tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, duration: 4 }, 0);
    drawings.forEach((drawing, i) => {
      const at = i;
      if (i > 0) {
        tl.to(steps[i - 1] ?? [], { opacity: 0, y: -16, duration: 0.2 }, at - 0.1);
        tl.to(drawings[i - 1] ?? [], { opacity: 0, duration: 0.2 }, at - 0.1);
        tl.fromTo(steps[i] ?? [], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, at + 0.05);
        tl.to(drawing, { opacity: 1, duration: 0.1 }, at);
      }
      const groups = pathsOf(drawing);
      const per = 0.7 / groups.length;
      groups.forEach((paths, g) => tl.to(paths, { strokeDashoffset: 0, duration: per }, at + 0.05 + g * per));
    });
    ScrollTrigger.refresh();

    return () => {
      section.classList.remove('is-pinned');
    };
  });
}

/* ------------------------------------------------------------------ neighbourhoods (M23) */
function initPlaces() {
  const section = $('[data-places]');
  if (!section) return;
  const layers = $$('[data-place-layer]', section);
  let current = 0;
  let timer = 0;
  const activate = (index: number) => {
    if (index === current || !layers[index]) return;
    const old = layers[current];
    const next = layers[index];
    window.clearTimeout(timer);
    layers.forEach((layer) => layer.classList.remove('is-prev', 'is-entering'));
    old?.classList.remove('is-active');
    old?.classList.add('is-prev');
    next.classList.add('is-active', 'is-entering');
    current = index;
    timer = window.setTimeout(() => {
      layers.forEach((layer) => layer.classList.remove('is-prev', 'is-entering'));
    }, 650);
  };
  $$<HTMLAnchorElement>('[data-place]', section).forEach((link) => {
    const index = Number(link.dataset.place);
    link.addEventListener('pointerenter', () => activate(index));
    link.addEventListener('focus', () => activate(index));
  });
}

initSearch();
initHero();
initFeatured();
initServices();
initMap();
initSteps();
initPlaces();
