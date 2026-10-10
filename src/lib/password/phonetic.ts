export function phoneticKey(ascii: string): string {
  return ascii
    .replace(/ch/g, "ç")
    .replace(/h/g, "")
    .replace(/ll/g, "y")
    .replace(/qu(?=[ei])/g, "k")
    .replace(/gu(?=[ei])/g, "ğ")
    .replace(/g(?=[ei])/g, "j")
    .replace(/ğ/g, "g")
    .replace(/c(?=[ei])/g, "s")
    .replace(/c/g, "k")
    .replace(/z/g, "s")
    .replace(/v/g, "b")
    .replace(/w/g, "u");
}
