import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const m = a.match(/^--([^=]+)=(.*)$/);
		return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
	}),
);
const ROOT = resolve(args.root ?? join(here, ".."));
const BUDGET_BROTLI = 600 * 1024;

const words = JSON.parse(
	readFileSync(join(ROOT, "src", "data", "es", "words.json"), "utf8"),
);

const spriteCandidates = [
	args.fluent,
	process.env.FLUENT_SPRITE,
	join(ROOT, "node_modules", "@fluentui-emoji", "sprite", "dist", "flat.svg"),
]
	.filter(Boolean)
	.map((p) => resolve(String(p)));
const flatPath = spriteCandidates.find((p) => existsSync(p));
if (!flatPath) {
	console.error(
		"sprite Fluent no encontrado (instala @fluentui-emoji/sprite o usa --fluent=...)",
	);
	process.exit(1);
}

const enPath = args.emojibase
	? join(resolve(String(args.emojibase)), "en", "data.json")
	: join(ROOT, "node_modules", "emojibase-data", "en", "data.json");
const en = JSON.parse(readFileSync(enPath, "utf8"));
const byHex = new Map(en.map((e) => [e.hexcode, e.label]));

const slugify = (label) =>
	label
		.toLowerCase()
		.replace(/_/g, " ")
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/['\u2019:,!.()]/g, "")
		.replace(/\s+/g, "-")
		.trim();

const flat = readFileSync(flatPath, "utf8");
const symbols = new Map();
for (const m of flat.matchAll(/<symbol([^>]*)>(.*?)<\/symbol>/gs)) {
	const id = /id="([^"]+)"/.exec(m[1])?.[1];
	if (id) symbols.set(id, { attrs: m[1], body: m[2] });
}

const missing = [];
const parts = [];
for (const w of words) {
	const label = byHex.get(w.icon.toUpperCase());
	const slug = label ? slugify(label) : undefined;
	const sym = slug ? symbols.get(slug) : undefined;
	if (!sym) {
		missing.push(`${w.ascii} (${w.icon})`);
		continue;
	}
	const attrs = sym.attrs.replace(/id="[^"]+"/, `id="${w.icon}"`);
	parts.push(`<symbol${attrs}>${sym.body}</symbol>`);
}

if (missing.length > 0) {
	console.error(`sin SVG Fluent (${missing.length}): ${missing.join(", ")}`);
	console.error(
		"anadelos a scripts/no-fluent.json y reconstruye la lista (words:build)",
	);
	process.exit(1);
}

const out = `<svg xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
const outDir = join(ROOT, "public", "icons");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "es.sprite.svg"), out);
const raw = Buffer.byteLength(out);
const gzip = gzipSync(out).length;
const brotli = brotliCompressSync(out).length;
console.log(
	`sprite: ${parts.length} simbolos | raw ${raw} | gzip ${gzip} | brotli ${brotli} (presupuesto ${BUDGET_BROTLI})`,
);
if (brotli > BUDGET_BROTLI) {
	console.error("sprite supera el presupuesto de 600 KB brotli");
	process.exit(1);
}
