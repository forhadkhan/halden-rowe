/**
 * Shared scroll lock for modal dialogs (mobile menu, lightbox, filter sheet).
 * `html:has(dialog[open]:modal)` already clips native scroll in CSS; this adds the attribute the header
 * reads and tells motion.ts to stop Lenis (DESIGN.md 6, rule 5). Returns a release function; locks nest.
 */
let count = 0;

export const SCROLL_LOCK_EVENT = 'hr:scroll-lock';

export function lockScroll(): () => void {
  count += 1;
  if (count === 1) {
    document.documentElement.setAttribute('data-scroll-locked', '');
    document.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: { locked: true } }));
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (count === 0) {
      document.documentElement.removeAttribute('data-scroll-locked');
      document.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: { locked: false } }));
    }
  };
}
