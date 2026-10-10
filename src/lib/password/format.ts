import { SYMBOLS } from "./entropy.js";
import { randomInt } from "./rng.js";
import type { WordEntry } from "./types.js";

export function capitalizeAscii(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

export function formatStandard(words: WordEntry[]): string {
  return words.map((w) => w.ascii).join("-");
}

export function formatCompatBase(words: WordEntry[]): string {
  return words.map((w) => capitalizeAscii(w.ascii)).join("-");
}

export function randomDigits(count: number, rand = randomInt): string {
  let s = "";
  for (let i = 0; i < count; i++) s += String(rand(10));
  return s;
}

export function randomSymbol(rand = randomInt): string {
  return SYMBOLS[rand(SYMBOLS.length)]!;
}
