/**
 * Seeded generators for the GenerativeAtmosphere backdrop.
 *
 * Pure + deterministic (no Math.random / Date) so the server-rendered SVG is
 * stable across builds — organic-looking but reproducible.
 */

/** Deterministic 32-bit PRNG. Same seed → same sequence. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A smooth speed-trace-like polyline as an SVG path `d` string. Biased toward a
 * wavy mid-band so it reads like telemetry, not noise. Deterministic per seed.
 */
export function tracePath(
  seed: number,
  width: number,
  height: number,
  points = 14,
): string {
  const rand = mulberry32(seed);
  const step = width / (points - 1);
  const ys: number[] = [];
  let y = height * (0.35 + rand() * 0.3);
  for (let i = 0; i < points; i++) {
    y += (rand() - 0.5) * height * 0.28;
    y = Math.max(height * 0.1, Math.min(height * 0.9, y));
    ys.push(y);
  }
  let d = `M 0 ${ys[0].toFixed(2)}`;
  for (let i = 1; i < points; i++) {
    const x = i * step;
    const cx = ((i - 1) * step + x) / 2;
    d += ` Q ${cx.toFixed(2)} ${ys[i - 1].toFixed(2)} ${x.toFixed(2)} ${ys[i].toFixed(2)}`;
  }
  return d;
}

/** A sweeping racing-line-ish cubic curve for the foreground accent. */
export function racingLinePath(
  seed: number,
  width: number,
  height: number,
): string {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const p1 = height * (0.6 + rand() * 0.1);
  const p2 = height * (0.3 + rand() * 0.2);
  const p3 = height * (0.7 + rand() * 0.15);
  return (
    `M 0 ${p1.toFixed(2)} ` +
    `C ${(width * 0.3).toFixed(2)} ${p2.toFixed(2)}, ` +
    `${(width * 0.6).toFixed(2)} ${p3.toFixed(2)}, ` +
    `${width.toFixed(2)} ${(height * 0.45).toFixed(2)}`
  );
}
