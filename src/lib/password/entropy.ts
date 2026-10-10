export function bitsDistinct(n: number, k: number): number {
  let bits = 0;
  for (let i = 0; i < k; i++) bits += Math.log2(n - i);
  return bits;
}

export function minWordCount(n: number, target = 70): number {
  let k = 1;
  while (bitsDistinct(n, k) < target) k++;
  return k;
}

export const SYMBOLS = "!?#$%&*+=@";

export function bitsCompat(n: number, k: number, digits = 2): number {
  return bitsDistinct(n, k) + digits * Math.log2(10) + Math.log2(SYMBOLS.length);
}
