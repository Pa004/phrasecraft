import { describe, expect, it } from "vitest";
import { bitsDistinct, minWordCount } from "./entropy";

describe("entropy", () => {
  it("deberia calcular bits de referencia", () => {
    expect(bitsDistinct(1296, 7)).toBeCloseTo(72.4, 0);
    expect(bitsDistinct(1024, 7)).toBeLessThan(70);
  });
  it("deberia subir k cuando n=1024", () => {
    expect(minWordCount(1024, 70)).toBe(8);
    expect(minWordCount(1296, 70)).toBe(7);
  });
});
