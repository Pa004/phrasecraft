import { describe, expect, it } from "vitest";
import { phoneticKey } from "./phonetic";

describe("phoneticKey", () => {
  it("deberia colisionar homofonos b/v", () => {
    expect(phoneticKey("vaca")).toBe(phoneticKey("baca"));
  });
  it("deberia colisionar seseo c/s/z", () => {
    expect(phoneticKey("casa")).toBe(phoneticKey("caza"));
  });
  it("deberia distinguir palabras distintas", () => {
    expect(phoneticKey("luna")).not.toBe(phoneticKey("pulpo"));
  });
});
