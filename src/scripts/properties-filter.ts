/**
 * /properties: client-side filter, sort and keyword search over the twelve server-rendered cards
 * (DESIGN.md 10.7, 11.2). State lives in the URL: each discrete change (status, selects, chips, Saved, sort,
 * Clear all) is a history entry (pushState) so Back undoes it; typing in the keyword replaces the current entry.
 * popstate restores the state, and a reload reads it from the URL.
 * M25: each results update runs inside document.startViewTransition() when motion is allowed.
 * Without JS none of this runs and the page lists every home.
 */
import xIcon from 'lucide-static/icons/x.svg?raw';
import { ScrollTrigger } from './motion';
import { lockScroll } from './scroll-lock';
import {
  DEFAULT_STATE,
  activeCount,
  closeMatches,
  filterHomes,
  parseParams,
  sheetCount,
  toParams,
  withBar,
  type FilterState,
  type Home,
  type Mode,
  type Options,
  type Sort,
} from './lib/listing-filter';
import { SAVED_EVENT, SAVED_KEY, readSaved } from './lib/saved';

interface Plural {
  zero?: string;
  one: string;
  other: string;
}

interface Config extends Options {
  stepsBuy: number[];
  stepsRent: number[];
  rentSuffix: string;
  locale: string;
  currency: string;
  status: { buy: string; rent: string };
  chip: Record<'status' | 'city' | 'type' | 'min' | 'max' | 'beds' | 'q', string>;
  removeChip: string;
  count: Plural;
  show: Plural;
  open: string;
  openWithCount: string;
  saved: string;
}

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
const pluralise = (n: number, forms: Plural) => fill(n === 0 && forms.zero ? forms.zero : n === 1 ? forms.one : forms.other, { count: n });

const root = document.querySelector<HTMLElement>('[data-filters]');
const grid = document.querySelector<HTMLElement>('[data-results]');
const empty = document.querySelector<HTMLElement>('[data-empty]');
const closeWrap = document.querySelector<HTMLElement>('[data-close-matches]');
const closeList = document.querySelector<HTMLElement>('[data-close-list]');

if (root && grid) init(root, grid);

function init(root: HTMLElement, grid: HTMLElement) {
  const config = JSON.parse(root.dataset.config ?? '{}') as Config;
  const money = new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency, maximumFractionDigits: 0 });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const cards = new Map<string, HTMLElement>();
  const homes: Home[] = [];
  grid.querySelectorAll<HTMLElement>('[data-home]').forEach((cell) => {
    const d = cell.dataset;
    cards.set(d.home ?? '', cell);
    homes.push({
      slug: d.home ?? '',
      status: d.status === 'rent' ? 'rent' : 'sale',
      city: d.city ?? '',
      type: d.type ?? '',
      price: Number(d.price),
      beds: Number(d.beds),
      sqft: Number(d.sqft),
      listed: d.listed ?? '',
      text: d.text ?? '',
    });
    // M25: cards keep their own name across a results change.
    cell.style.setProperty('view-transition-name', `card-${d.home}`);
  });

  const form = root.querySelector<HTMLFormElement>('[data-filter-form]');
  const desk = root.querySelector<HTMLElement>('.filters__desk');
  const sheet = root.querySelector<HTMLDialogElement>('[data-filter-sheet]');
  const sheetBody = sheet?.querySelector<HTMLElement>('.filter-sheet__body') ?? null;
  const q = root.querySelector<HTMLInputElement>('[data-filter="q"]');
  const sort = root.querySelector<HTMLSelectElement>('[data-filter="sort"]');
  const count = root.querySelector<HTMLElement>('[data-filter-count]');
  const active = root.querySelector<HTMLElement>('[data-filter-active]');
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-filter-clear]');
  const chips = root.querySelector<HTMLElement>('[data-filter-chips]');
  const openBtn = root.querySelector<HTMLButtonElement>('[data-filter-open]');
  const openLabel = root.querySelector<HTMLElement>('[data-filter-open-label]');
  const showLabel = root.querySelector<HTMLElement>('[data-filter-sheet-show]');
  const savedBtn = root.querySelector<HTMLButtonElement>('[data-filter-saved]');
  const savedLabel = root.querySelector<HTMLElement>('[data-filter-saved-label]');
  const title = document.querySelector<HTMLElement>('[data-filter-title]');
  const titleDefault = title?.textContent?.trim() ?? '';
  // Empty-state texts: the default ("no match") and data-alt ("no saved homes yet").
  const emptyTexts = [...document.querySelectorAll<HTMLElement>('[data-empty] [data-alt]')].map((el) => ({
    el,
    text: el.textContent?.trim() ?? '',
    alt: el.dataset.alt ?? '',
  }));

  let state: FilterState = parseParams(new URLSearchParams(location.search), config);
  let draft: FilterState = { ...state };
  let saved = new Set(readSaved());

  /* ---------------------------------------------------------------- controls <-> state */
  const priceLabel = (n: number, mode: Mode) => `${money.format(n)}${mode === 'rent' ? config.rentSuffix : ''}`;

  /** Price options follow the scale of the chosen status; a value from the URL that is not a step is kept. */
  const fillPrice = (select: HTMLSelectElement, mode: Mode, value: number | null) => {
    const steps = [...(mode === 'rent' ? config.stepsRent : config.stepsBuy)];
    if (value !== null && !steps.includes(value)) steps.push(value);
    steps.sort((a, b) => a - b);
    const anyOption = select.options[0];
    select.replaceChildren(anyOption, ...steps.map((s) => new Option(priceLabel(s, mode), String(s))));
    select.value = value === null ? '' : String(value);
  };

  const writeControls = (scope: HTMLElement | null, s: FilterState) => {
    if (!scope) return;
    scope.querySelectorAll<HTMLInputElement>('[data-filter="mode"]').forEach((r) => {
      r.checked = r.value === s.mode;
    });
    const set = (key: string, value: string) => {
      const el = scope.querySelector<HTMLSelectElement>(`[data-filter="${key}"]`);
      if (el) el.value = value;
    };
    set('city', s.city);
    set('type', s.type);
    set('beds', s.beds === null ? '' : String(s.beds));
    const min = scope.querySelector<HTMLSelectElement>('[data-filter="min"]');
    const max = scope.querySelector<HTMLSelectElement>('[data-filter="max"]');
    if (min) fillPrice(min, s.mode, s.min);
    if (max) fillPrice(max, s.mode, s.max);
  };

  const readControls = (scope: HTMLElement, base: FilterState): FilterState => {
    const get = (key: string) => scope.querySelector<HTMLSelectElement>(`[data-filter="${key}"]`)?.value ?? '';
    const num = (key: string) => (get(key) ? Number(get(key)) : null);
    const mode = (scope.querySelector<HTMLInputElement>('[data-filter="mode"]:checked')?.value ?? 'all') as Mode;
    const next: FilterState = { ...base, mode, city: get('city'), type: get('type'), min: num('min'), max: num('max'), beds: num('beds') };
    // The price scales differ: switching status clears the price.
    if (mode !== base.mode && (mode === 'rent' || base.mode === 'rent')) {
      next.min = null;
      next.max = null;
    }
    if (next.min !== null && next.max !== null && next.min > next.max) {
      // Keep the one just changed, drop the other.
      if (next.min !== base.min) next.max = null;
      else next.min = null;
    }
    return next;
  };

  /* ---------------------------------------------------------------- render */
  const chipText = (key: keyof Config['chip'], value: string) => fill(config.chip[key], { value });

  const renderChips = (s: FilterState) => {
    if (!chips || !active) return;
    const items: { key: keyof FilterState; label: string }[] = [];
    if (s.mode !== 'all') items.push({ key: 'mode', label: chipText('status', config.status[s.mode]) });
    if (s.city) items.push({ key: 'city', label: chipText('city', s.city) });
    if (s.type) items.push({ key: 'type', label: chipText('type', s.type) });
    if (s.min !== null) items.push({ key: 'min', label: chipText('min', priceLabel(s.min, s.mode)) });
    if (s.max !== null) items.push({ key: 'max', label: chipText('max', priceLabel(s.max, s.mode)) });
    if (s.beds !== null) items.push({ key: 'beds', label: chipText('beds', String(s.beds)) });
    // No chip for the keyword or Saved: their own controls in the bar show them (each filter shows once, and
    // "Filters (n)" equals the number of chips).

    chips.replaceChildren(
      ...items.map(({ key, label }) => {
        const li = document.createElement('li');
        const chip = document.createElement('span');
        chip.className = 'chip chip--removable';
        chip.append(document.createTextNode(label));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'chip__remove';
        remove.setAttribute('aria-label', fill(config.removeChip, { label }));
        remove.innerHTML = xIcon.replace('<svg', '<svg class="icon" width="16" height="16" aria-hidden="true" focusable="false"');
        remove.addEventListener('click', () => {
          const next = { ...state, [key]: key === 'mode' ? 'all' : key === 'city' || key === 'type' ? '' : null };
          if (key === 'mode') Object.assign(next, { min: null, max: null });
          apply(next as FilterState, 'push');
          // Focus stays in the chip row (or moves to the search field when the row empties).
          requestAnimationFrame(() => {
            const buttons = chips.querySelectorAll<HTMLButtonElement>('.chip__remove');
            (buttons[Math.min(items.findIndex((i) => i.key === key), buttons.length - 1)] ?? q)?.focus();
          });
        });
        chip.append(remove);
        li.append(chip);
        return li;
      }),
    );
    // "Clear all" also clears the keyword and Saved, so it shows whenever anything is active.
    active.hidden = activeCount(s) === 0;
    clearBtn?.toggleAttribute('disabled', activeCount(s) === 0);
  };

  const updateCount = (n: number) => {
    if (count) count.textContent = pluralise(n, config.count);
  };

  const updateOpenLabel = (s: FilterState) => {
    const n = sheetCount(s);
    if (openLabel) openLabel.textContent = n ? fill(config.openWithCount, { count: n }) : config.open;
  };

  const updateSaved = (s: FilterState) => {
    savedBtn?.setAttribute('aria-pressed', String(s.saved));
    // Count only homes on this page, so a stale slug in storage never inflates it.
    if (savedLabel) savedLabel.textContent = fill(config.saved, { count: homes.filter((h) => saved.has(h.slug)).length });
  };

  const updateTexts = (s: FilterState) => {
    if (title) title.textContent = s.mode === 'buy' ? title.dataset.titleBuy ?? titleDefault : s.mode === 'rent' ? title.dataset.titleRent ?? titleDefault : titleDefault;
    const nothingSaved = s.saved && !homes.some((h) => saved.has(h.slug));
    emptyTexts.forEach(({ el, text, alt }) => {
      el.textContent = nothingSaved ? alt : text;
    });
  };

  const renderResults = (s: FilterState) => {
    const found = filterHomes(homes, s, saved);
    const shown = new Set(found.map((h) => h.slug));
    // Put every card back in the grid, in the sorted order, then hide the rest.
    const order = [...found, ...homes.filter((h) => !shown.has(h.slug))];
    order.forEach((h) => {
      const cell = cards.get(h.slug);
      if (!cell) return;
      cell.hidden = !shown.has(h.slug);
      grid.append(cell);
    });
    grid.hidden = found.length === 0;
    if (empty) empty.hidden = found.length > 0;

    if (closeWrap && closeList) {
      const near = found.length ? [] : closeMatches(homes, s, 3, saved);
      near.forEach((h) => {
        const cell = cards.get(h.slug);
        if (!cell) return;
        cell.hidden = false;
        closeList.append(cell);
      });
      closeWrap.hidden = near.length === 0;
    }
    return found.length;
  };

  const render = (s: FilterState) => {
    const n = renderResults(s);
    renderChips(s);
    updateOpenLabel(s);
    updateSaved(s);
    updateTexts(s);
    writeControls(desk, s);
    if (q && document.activeElement !== q) q.value = s.q;
    if (sort) sort.value = s.sort;
    updateCount(n);
  };

  const urlFor = (s: FilterState) => {
    const params = toParams(s).toString();
    return `${location.pathname}${params ? `?${params}` : ''}${location.hash}`;
  };

  /** `push` for a discrete change (Back undoes it), `replace` while typing; `none` when popstate already moved. */
  function apply(next: FilterState, entry: 'push' | 'replace' | 'none') {
    state = next;
    const target = urlFor(state);
    if (entry === 'push' && target !== `${location.pathname}${location.search}${location.hash}`) {
      history.pushState(null, '', target);
    } else if (entry !== 'none') {
      history.replaceState(history.state, '', target);
    }
    const update = () => render(state);
    if (document.startViewTransition && !reduce.matches) {
      document.startViewTransition(update).finished.finally(() => ScrollTrigger.refresh());
    } else {
      update();
      ScrollTrigger.refresh();
    }
  }


  /* ---------------------------------------------------------------- events */
  form?.addEventListener('submit', (event) => event.preventDefault());

  desk?.addEventListener('change', () => apply(readControls(desk, state), 'push'));

  // Typing replaces the history entry (one Back leaves the search, not each keystroke).
  let qTimer = 0;
  const applyKeyword = () => {
    window.clearTimeout(qTimer);
    qTimer = 0;
    const value = q ? q.value.trim().slice(0, 80) : state.q;
    if (value !== state.q) apply({ ...state, q: value }, 'replace');
  };
  q?.addEventListener('input', () => {
    window.clearTimeout(qTimer);
    qTimer = window.setTimeout(applyKeyword, 250);
  });
  q?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyKeyword();
  });

  sort?.addEventListener('change', () => apply({ ...state, sort: sort.value as Sort }, 'push'));

  savedBtn?.addEventListener('click', () => apply({ ...state, saved: !state.saved }, 'push'));

  // The saved list changed (a heart on this page, or another tab): recount, and in the saved view drop the card.
  const onSavedChange = () => {
    saved = new Set(readSaved());
    if (!state.saved) {
      updateSaved(state);
      return;
    }
    const focused = document.activeElement;
    render(state);
    ScrollTrigger.refresh();
    // The unsaved card is now hidden: keep focus on the page, on the Saved toggle.
    if (focused instanceof HTMLElement && focused.closest('[hidden]')) savedBtn?.focus();
  };
  document.addEventListener(SAVED_EVENT, onSavedChange);
  window.addEventListener('storage', (event) => {
    if (event.key === SAVED_KEY || event.key === null) onSavedChange();
  });

  const clearAll = () => apply({ ...DEFAULT_STATE, sort: state.sort }, 'push');
  root.querySelector('[data-filter-clear]')?.addEventListener('click', () => {
    clearAll();
    q?.focus();
  });
  document.querySelector('[data-empty-clear]')?.addEventListener('click', () => {
    clearAll();
    q?.focus();
  });

  /* Sheet: edits a draft; "Show N homes" applies it, Esc / close discards it. The count and the applied state
     both come from withBar(draft, state), so they always agree. */
  let releaseScroll: (() => void) | undefined;
  const updateShow = () => {
    if (showLabel) showLabel.textContent = pluralise(filterHomes(homes, withBar(draft, state), saved).length, config.show);
  };

  openBtn?.addEventListener('click', () => {
    if (!sheet) return;
    // A keyword still waiting for its debounce counts now, not after the sheet has shown its number.
    if (qTimer) applyKeyword();
    draft = { ...state };
    writeControls(sheetBody, draft);
    updateShow();
    sheet.showModal();
    releaseScroll ??= lockScroll();
  });

  sheetBody?.addEventListener('change', () => {
    draft = readControls(sheetBody, draft);
    writeControls(sheetBody, draft);
    updateShow();
  });

  sheet?.querySelector('[data-filter-sheet-close]')?.addEventListener('click', () => sheet.close());
  sheet?.querySelector('[data-filter-sheet-clear]')?.addEventListener('click', () => {
    draft = { ...DEFAULT_STATE };
    writeControls(sheetBody, draft);
    updateShow();
  });
  sheet?.querySelector('[data-filter-sheet-apply]')?.addEventListener('click', () => {
    sheet.close();
    apply(withBar(draft, state), 'push');
  });
  // Light dismiss: a click on the backdrop closes without applying.
  sheet?.addEventListener('click', (event) => {
    if (event.target === sheet) sheet.close();
  });
  // 'close' fires for every way out (buttons, Escape, backdrop), but as a queued task: if the sheet was
  // reopened before it ran, keep the lock.
  sheet?.addEventListener('close', () => {
    if (sheet.open) return;
    releaseScroll?.();
    releaseScroll = undefined;
    openBtn?.focus();
  });

  // The sheet is a phone/tablet control; if the window grows past 1024 while it is open, close it.
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (event) => {
    if (event.matches && sheet?.open) sheet.close();
  });

  // Back / Forward between filter states: read the URL the browser moved to; a draft in an open sheet is dropped.
  window.addEventListener('popstate', () => {
    window.clearTimeout(qTimer);
    qTimer = 0;
    if (sheet?.open) sheet.close();
    const next = parseParams(new URLSearchParams(location.search), config);
    if (q) q.value = next.q;
    apply(next, 'none');
  });

  /* ---------------------------------------------------------------- first paint from the URL */
  const initial = toParams(state).toString();
  if (initial !== location.search.replace(/^\?/, '')) {
    // Normalise aliases (mode=, price=, q=<city>) and drop invalid params.
    history.replaceState(history.state, '', urlFor(state));
  }
  render(state);
}
