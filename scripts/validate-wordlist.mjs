import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const DATA = join(ROOT, "src", "data", "es");

const toAscii = (s) =>
	s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

function phoneticKey(ascii) {
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

function levBelow2(a, b) {
	if (a === b) return 0;
	if (Math.abs(a.length - b.length) > 1) return 2;
	let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		const cur = [i];
		let rowMin = i;
		for (let j = 1; j <= b.length; j++) {
			const v = Math.min(
				prev[j] + 1,
				cur[j - 1] + 1,
				prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
			cur.push(v);
			if (v < rowMin) rowMin = v;
		}
		if (rowMin > 1) return 2;
		prev = cur;
	}
	return prev[b.length];
}

const failures = [];
const wordsPath = join(DATA, "words.json");
if (!existsSync(wordsPath)) {
	console.log(
		"words.json aun no existe (previo a Fase 2) — validate OK provisional.",
	);
	process.exit(0);
}
const words = JSON.parse(readFileSync(wordsPath, "utf8"));
const meta = JSON.parse(readFileSync(join(DATA, "meta.json"), "utf8"));
const denylist = new Set(
	JSON.parse(readFileSync(join(DATA, "denylist.json"), "utf8")),
);

if (meta.count !== words.length)
	failures.push(`count ${meta.count} != words ${words.length}`);

const ascii = words.map((w) => w.ascii);
if (new Set(ascii).size !== ascii.length) failures.push("ascii duplicado");

for (const w of words) {
	if (w.ascii.length < 4 || w.ascii.length > 9)
		failures.push(`longitud: ${w.ascii}`);
	if (toAscii(w.ascii) !== w.ascii || /[^a-z]/.test(w.ascii))
		failures.push(`no-ascii: ${w.ascii}`);
	if (w.gender !== "m" && w.gender !== "f")
		failures.push(`sin gender: ${w.id}`);
	if (denylist.has(w.ascii)) failures.push(`en denylist: ${w.ascii}`);
}

for (let i = 0; i < words.length; i++) {
	for (let j = i + 1; j < words.length; j++) {
		if (levBelow2(words[i].ascii, words[j].ascii) < 2) {
			failures.push(`levenshtein<2: ${words[i].ascii}/${words[j].ascii}`);
		}
	}
}

const seenPhon = new Map();
for (const w of words) {
	const k = phoneticKey(w.ascii);
	if (seenPhon.has(k)) failures.push(`fonetica: ${w.ascii}/${seenPhon.get(k)}`);
	else seenPhon.set(k, w.ascii);
}

const sprite = join(ROOT, "public", "icons", "es.sprite.svg");
if (existsSync(sprite)) {
	const svg = readFileSync(sprite, "utf8");
	for (const w of words) {
		if (!svg.includes(`id="${w.icon}"`))
			failures.push(`sin icono: ${w.id} (${w.icon})`);
	}
} else {
	console.log(
		"sprite aun no existe (Fase 3 pendiente) — chequeo de iconos omitido.",
	);
}

if (failures.length > 0) {
	console.error(
		`words:validate FAIL (${failures.length}):\n- ${failures.slice(0, 20).join("\n- ")}`,
	);
	process.exit(1);
}
console.log(
	`words:validate OK (${words.length} palabras, ${meta.listVersion})`,
);
