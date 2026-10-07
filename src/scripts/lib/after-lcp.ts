/**
 * Runs `start` once the page's priority photo (the LCP image, `fetchpriority="high"`) has loaded or failed and the
 * next frame has painted, or after `capMs`, whichever comes first. Heavy scripts loaded through it (GSAP,
 * ScrollTrigger, Lenis) then never compete with that photo for bandwidth or the first paint. Pages without a
 * priority photo wait for the next frame only.
 */
export function afterLcpImage(start: () => unknown, capMs = 1500): void {
  let started = false;
  const run = () => {
    if (started) return;
    started = true;
    start();
  };
  // After the next frame is painted; the timeout covers background tabs, where requestAnimationFrame never fires.
  const afterPaint = () => {
    requestAnimationFrame(() => window.setTimeout(run, 0));
    window.setTimeout(run, 100);
  };

  const img = document.querySelector<HTMLImageElement>('img[fetchpriority="high"]');
  if (!img || img.complete) {
    afterPaint();
    return;
  }
  img.addEventListener('load', afterPaint, { once: true });
  img.addEventListener('error', afterPaint, { once: true });
  window.setTimeout(run, capMs);
}
