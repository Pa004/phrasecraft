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
