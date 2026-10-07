/**
 * Polite status toast, the same region PropertyCard's save button uses ([data-toast-region]), so a page never
 * has two. Styles live in PropertyCard.astro and, for pages without cards, in styles/pages.css.
 */
let timer = 0;

export function ensureToastRegion(): HTMLElement {
  let region = document.querySelector<HTMLElement>('[data-toast-region]');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.dataset.toastRegion = '';
    document.body.append(region);
  }
  return region;
}

export function announce(message: string): void {
  if (!message) return;
  const region = ensureToastRegion();
  const toast = document.createElement('p');
  toast.className = 'toast';
  toast.textContent = message;
  region.replaceChildren(toast);
  window.clearTimeout(timer);
  timer = window.setTimeout(() => region.replaceChildren(), 4000);
}
