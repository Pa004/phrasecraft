import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
if (!existsSync(DIST)) {
	console.error(
		"dist/ no existe: ejecuta `npm run build` antes de security:check-csp",
	);
	process.exit(1);
}

const headers = readFileSync(join(ROOT, "public", "_headers"), "utf8");
const csp = headers
	.split("\n")
	.find((l) => l.includes("Content-Security-Policy"));
if (!csp) {
	console.error("sin Content-Security-Policy en public/_headers");
	process.exit(1);
}

const sha256 = (s) =>
	`'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;
const missing = [];
const missingStyle = new Set();
const walk = (dir) => {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) {
			walk(p);
			continue;
		}
		if (!p.endsWith(".html")) continue;
		const html = readFileSync(p, "utf8");
		for (const m of html.matchAll(
			/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g,
		)) {
			const body = m[1];
			if (!body.trim()) continue;
			const h = sha256(body);
			if (!csp.includes(h)) missing.push(`${p}: ${h}`);
		}
		if (/<style[\s>]/.test(html)) {
			for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
				if (!m[1].trim()) continue;
				const h = sha256(m[1]);
				if (!csp.includes(h)) missingStyle.add(h);
			}
		}
	}
};
walk(DIST);

if (missingStyle.size > 0) {
	console.error(
		`estilos inline sin pin en CSP: ${[...missingStyle].join(" ")}`,
	);
	process.exit(1);
}
if (missing.length > 0) {
	console.error(
		`scripts inline sin pin en CSP (${missing.length}):\n- ${missing.join("\n- ")}`,
	);
	process.exit(1);
}
console.log(
	"security:check-csp OK (todos los scripts inline pineados por hash)",
);
