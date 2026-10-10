import { describe, expect, it } from "vitest";
import { pickDistinctIndices, randomInt } from "./rng";
import type { Filler } from "./rng";

describe("randomInt", () => {
  it("deberia retornar 0 cuando n=1", () => {
    expect(randomInt(1)).toBe(0);
  });
  it("deberia aceptar 2^32 como limite", () => {
    const v = randomInt(2 ** 32);
    expect(v).toBeGreaterThanOrEqual(0);
  });
  it("deberia lanzar con valores invalidos", () => {
    for (const bad of [0, -1, 1.5, NaN, 2 ** 32 + 1]) {
      expect(() => randomInt(bad)).toThrow(RangeError);
    }
  });
  it("deberia rechazar y reintentar valores >= limit", () => {
    // maxExclusive=3 -> limit = floor(2^32/3)*3 = 4294967295
    const seen: number[] = [];
    const fill: Filler = (buf) => {
      const v = seen.length < 2 ? 4294967295 : 1;
      seen.push(v);
      buf[0] = v;
      return buf;
    };
    expect(randomInt(3, fill)).toBe(1);
    expect(seen).toEqual([4294967295, 4294967295, 1]);
  });
  it("deberia ser aproximadamente uniforme (chi-cuadrado laxo)", () => {
    const buckets = 10;
    const n = 200_000;
    const counts = new Array(buckets).fill(0);
    for (let i = 0; i < n; i++) counts[randomInt(buckets)]++;
    const expected = n / buckets;
    const chi2 = counts.reduce((a, o) => a + ((o - expected) ** 2) / expected, 0);
    expect(chi2).toBeLessThan(27.88);
  });
});

describe("pickDistinctIndices", () => {
  it("deberia retornar k indices distintos en rango", () => {
    const out = pickDistinctIndices(1296, 7);
    expect(out).toHaveLength(7);
    expect(new Set(out).size).toBe(7);
    for (const i of out) expect(i).toBeLessThan(1296);
  });
  it("deberia lanzar cuando k > n", () => {
    expect(() => pickDistinctIndices(3, 4)).toThrow(RangeError);
  });
});
