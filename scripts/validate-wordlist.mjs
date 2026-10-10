const fs = await import("node:fs");
const path = new URL("../src/data/es/words.json", import.meta.url);
if (!fs.existsSync(path)) {
  console.log("words.json aun no existe (Fase 2 pendiente) — validate OK provisional.");
  process.exit(0);
}
const words = JSON.parse(fs.readFileSync(path, "utf8"));
const ascii = words.map((w) => w.ascii);
if (new Set(ascii).size !== ascii.length) {
  console.error("ascii duplicado");
  process.exit(1);
}
console.log(`words:validate OK (${words.length} palabras)`);
