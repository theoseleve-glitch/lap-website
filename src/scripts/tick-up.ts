import { shouldAnimate } from './gsap-loader';

/**
 * Count up a number on a node from 0 (or from `node.textContent`) to a
 * target value. Uses requestAnimationFrame; honours reduced-motion by
 * setting the final value immediately.
 *
 * Easing: cubic-out — fast at the start, settles at the end. Matches
 * the inertia easing token across the rest of the system.
 */
export interface TickUpOptions {
  /** Animation length in ms. Default 900 (matches --duration-room). */
  duration?: number;
  /** Format the running integer for display. Default `String`. */
  format?: (n: number) => string;
}

export function tickUp(
  node: HTMLElement,
  target: number,
  opts: TickUpOptions = {},
): void {
  const format = opts.format ?? ((n: number) => String(n));
  if (!shouldAnimate()) {
    node.textContent = format(target);
    return;
  }
  const duration = opts.duration ?? 900;
  let start: number | null = null;
  const tick = (t: number) => {
    if (start === null) start = t;
    const elapsed = t - start;
    const progress = Math.min(1, elapsed / duration);
    // cubic-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    node.textContent = format(value);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      node.textContent = format(target);
    }
  };
  requestAnimationFrame(tick);
}

/**
 * Wire one IntersectionObserver to a list of nodes; first time each is
 * 50%+ visible, fire tickUp() with the node's `data-tick-target` value.
 * Used by the Garage room stats.
 */
export function observeAndTick(nodes: HTMLElement[]): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const seen = new WeakSet<HTMLElement>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target as HTMLElement;
        if (seen.has(node)) continue;
        seen.add(node);
        const target = parseInt(node.dataset.tickTarget ?? '0', 10);
        const formatAttr = node.dataset.tickFormat;
        const format =
          formatAttr === 'comma'
            ? (n: number) => '+' + n.toLocaleString()
            : undefined;
        tickUp(node, target, format ? { format } : {});
        io.unobserve(node);
      }
    },
    { threshold: 0.5 },
  );
  for (const node of nodes) io.observe(node);
  return () => io.disconnect();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const attach = () => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tick-target]'),
    );
    if (nodes.length) observeAndTick(nodes);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
}
