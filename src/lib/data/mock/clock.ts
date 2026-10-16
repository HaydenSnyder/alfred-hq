/**
 * Fixed reference time for demo records. Using a constant (rather than
 * `Date.now()`) keeps server and client renders identical and makes the demo
 * dataset reproducible. Relative times in the UI are computed against this.
 */
export const DEMO_NOW = new Date("2026-10-16T15:00:00.000Z")

export function minutesAgo(minutes: number): string {
  return new Date(DEMO_NOW.getTime() - minutes * 60_000).toISOString()
}

export function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60)
}

export function daysAgo(days: number): string {
  return minutesAgo(days * 24 * 60)
}

export function hoursFromNow(hours: number): string {
  return minutesAgo(-hours * 60)
}

/** Small deterministic PRNG so generated series are stable across reloads. */
export function seeded(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export const demo = { origin: "demo" as const }
