/**
 * Journal post reading progress (DESIGN.md 11.7): a 2px line at the top of the viewport, scaleX = how far the
 * article body has been read. Position feedback, not decoration, so it also runs under reduced motion (the CSS
 * drops the smoothing there). Also wires the post's "Copy link" button.
 */
import { announce, ensureToastRegion } from './lib/toast';

const bar = document.querySelector<HTMLElement>('[data-reading-progress] span');
const body = document.querySelector<HTMLElement>('[data-post-body]');

if (bar && body) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = body.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const read = -rect.top + window.innerHeight * 0.2;
    const progress = total > 0 ? Math.min(1, Math.max(0, read / total)) : 1;
    bar.style.transform = `scaleX(${progress})`;
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

ensureToastRegion();

document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyLink || window.location.href);
      announce(button.dataset.msgCopied ?? '');
    } catch {
      announce(button.dataset.msgCopyFailed ?? '');
    }
  });
});
