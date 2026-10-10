export type Filler = (a: Uint32Array) => Uint32Array;

const defaultFill: Filler = (a) => crypto.getRandomValues(a);

/** Uniform integer in [0, maxExclusive) without modulo bias (rejection sampling). */
export function randomInt(maxExclusive: number, fill: Filler = defaultFill): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 2 ** 32) {
    throw new RangeError("maxExclusive out of range");
  }
  const limit = Math.floor(2 ** 32 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    fill(buf);
    x = buf[0]!;
  } while (x >= limit);
  return x % maxExclusive;
}

/** k distinct indices of [0, n), uniform over ordered tuples. */
export function pickDistinctIndices(n: number, k: number, rand = randomInt): number[] {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError("n out of range");
  if (!Number.isInteger(k) || k < 0) throw new RangeError("k out of range");
  if (k > n) throw new RangeError("k > n");
  const seen = new Set<number>();
  const out: number[] = [];
  while (out.length < k) {
    const i = rand(n);
    if (!seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  }
  return out;
}
