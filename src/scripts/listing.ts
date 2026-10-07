/**
 * Listing detail page behaviour (DESIGN.md 11.3):
 * - Share: Web Share API where it exists, otherwise copy the URL and announce "Link copied" (or the failure line).
 * - Print: window.print().
 * - Mobile sticky bar: hidden while the enquiry form is on screen; "Inquire" scrolls to the form and focuses
 *   its first field. The bar is hidden (not just covered) while any field is focused, so it never hides input.
 * Save is handled by PropertyCard's script, which wires every [data-save] button on the page.
 */

import { announce, ensureToastRegion } from './lib/toast';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
ensureToastRegion();

document.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((button) => {
  button.addEventListener('click', async () => {
    const url = window.location.href.split('#')[0];
    const data = { title: document.title, text: button.dataset.shareText ?? '', url };
    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        // The visitor closed the share sheet: nothing to report.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      announce(button.dataset.msgCopied ?? '');
    } catch {
      announce(button.dataset.msgCopyFailed ?? '');
    }
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-print]').forEach((button) => {
  button.addEventListener('click', () => window.print());
});

const bar = document.querySelector<HTMLElement>('[data-sticky-bar]');
const inquiry = document.querySelector<HTMLElement>('[data-inquiry]');
if (bar && inquiry) {
  let formVisible = false;
  let fieldFocused = false;
  const update = () => bar.classList.toggle('is-hidden', formVisible || fieldFocused);

  new IntersectionObserver(
    (entries) => {
      formVisible = entries.some((entry) => entry.isIntersecting);
      update();
    },
    { rootMargin: '0px 0px -64px 0px' },
  ).observe(inquiry);

  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement | null;
    fieldFocused = !!target?.matches('input:not([type="checkbox"], [type="radio"], [type="range"]), textarea, select');
    update();
  });
  document.addEventListener('focusout', () => {
    fieldFocused = false;
    window.requestAnimationFrame(update);
  });

  bar.querySelector<HTMLElement>('[data-sticky-cta]')?.addEventListener('click', (event) => {
    event.preventDefault();
    const field = inquiry.querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"]), textarea');
    inquiry.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    field?.focus({ preventScroll: true });
  });
}
