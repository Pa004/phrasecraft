import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const m = a.match(/^--([^=]+)=(.*)$/);
		return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
	}),
);
const ROOT = resolve(args.root ?? join(here, ".."));
const EMOJIBASE = resolve(
	args.emojibase ??
		process.env.EMOJIBASE_DIR ??
		join(ROOT, "node_modules", "emojibase-data"),
);

const GROUPS = [3, 4, 5, 6, 7];
const EXCLUDED_SUBGROUPS = new Set([52, 58]);
const ANIMAL_SUBGROUPS = new Set([34, 35, 36, 37, 38, 39]);
const STRESSED_A = new Set([
	"agua",
	"aguila",
	"ancla",
	"arpa",
	"hacha",
	"arma",
	"aula",
	"hambre",
]);
const GROUP_TAGS = {
	3: ["naturaleza"],
	4: ["comida"],
	5: ["lugar"],
	6: ["objeto"],
	7: ["objeto"],
};

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
	const la = a.length;
	const lb = b.length;
	if (Math.abs(la - lb) > 1) return 2;
	let prev = Array.from({ length: lb + 1 }, (_, j) => j);
	for (let i = 1; i <= la; i++) {
		const cur = [i];
		let rowMin = i;
		for (let j = 1; j <= lb; j++) {
			const c = a[i - 1] === b[j - 1] ? 0 : 1;
			const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
			cur.push(v);
			if (v < rowMin) rowMin = v;
		}
		if (rowMin > 1) return 2;
		prev = cur;
	}
	return prev[lb];
}

function guessGender(ascii) {
	if (STRESSED_A.has(ascii))
		return { gender: "f", stressedA: true, confident: true };
	if (ascii.endsWith("a")) return { gender: "f", confident: true };
	if (ascii.endsWith("o")) return { gender: "m", confident: true };
	return { gender: "m", confident: false };
}

const loadJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const esPath = join(EMOJIBASE, "es", "data.json");
if (!existsSync(esPath)) {
	console.error(
		`emojibase no encontrado en ${EMOJIBASE} (usa --emojibase=... o EMOJIBASE_DIR)`,
	);
	process.exit(1);
}
const es = loadJson(esPath);
const denylist = new Set(
	loadJson(join(ROOT, "src", "data", "es", "denylist.json")),
);
const overrides = loadJson(join(ROOT, "scripts", "overrides.json"));
const noFluent = loadJson(join(ROOT, "scripts", "no-fluent.json"));

const report = {
	raw: es.length,
	byGroup: 0,
	excludedSubgroup: 0,
	excludedGenderVariant: 0,
	excludedSkins: 0,
	noName: 0,
	badLength: 0,
	asciiCollision: 0,
	levenshtein: 0,
	phonetic: 0,
	denylisted: 0,
	kept: 0,
};

const singleToken = (s) => !/\s/.test(s);
const kept = [];
const seenAscii = new Map();

for (const e of es) {
	if (!GROUPS.includes(e.group)) continue;
	report.byGroup++;
	if (EXCLUDED_SUBGROUPS.has(e.subgroup)) {
		report.excludedSubgroup++;
		continue;
	}
	if ("gender" in e) {
		report.excludedGenderVariant++;
		continue;
	}
	if (e.skins && e.skins.length > 0) {
		report.excludedSkins++;
		continue;
	}
	if (noFluent[e.hexcode]) {
		report.excludedNoFluent = (report.excludedNoFluent ?? 0) + 1;
		continue;
	}
	let name = null;
	if (overrides[e.hexcode]) {
		name = overrides[e.hexcode];
	} else if (singleToken(e.label)) {
		name = e.label;
	} else {
		name = (e.tags ?? []).find((t) => singleToken(t)) ?? null;
	}
	if (!name) {
		report.noName++;
		continue;
	}
	const ascii = toAscii(name);
	if (ascii.length < 4 || ascii.length > 9 || /[^a-z]/.test(ascii)) {
		report.badLength++;
		continue;
	}
	if (seenAscii.has(ascii)) {
		report.asciiCollision++;
		continue;
	}
	seenAscii.set(ascii, e.hexcode);
	kept.push({ entry: e, name, ascii });
}

const byLev = [];
for (const c of kept) {
	if (byLev.some((k) => levBelow2(k.ascii, c.ascii) < 2)) {
		report.levenshtein++;
		continue;
	}
	byLev.push(c);
}

const byPhon = [];
const seenPhon = new Map();
for (const c of byLev) {
	const key = phoneticKey(c.ascii);
	if (seenPhon.has(key)) {
		report.phonetic++;
		continue;
	}
	seenPhon.set(key, c.ascii);
	byPhon.push(c);
}

const words = [];
const reviewQueue = [];
for (const c of byPhon) {
	if (denylist.has(c.ascii)) {
		report.denylisted++;
		continue;
	}
	const g = guessGender(c.ascii);
	const animate = c.entry.group === 3 && ANIMAL_SUBGROUPS.has(c.entry.subgroup);
	const tags = [
		...(GROUP_TAGS[c.entry.group] ?? []),
		...(animate ? ["animal"] : []),
	];
	words.push({
		id: c.ascii,
		es: c.name,
		ascii: c.ascii,
		gender: g.gender,
		...(g.stressedA ? { stressedA: true } : {}),
		animate,
		icon: c.entry.hexcode.toLowerCase(),
		tags,
	});
	if (!g.confident) {
		reviewQueue.push({
			id: c.ascii,
			es: c.name,
			guessedGender: g.gender,
			reason: "gender-heuristic-low-confidence",
		});
	}
}

words.sort((a, b) => (a.id < b.id ? -1 : 1));

const outDir = join(ROOT, "src", "data", "es");
mkdirSync(outDir, { recursive: true });
const version = "es-v0-draft";
writeFileSync(
	join(outDir, "words.json"),
	`${JSON.stringify(words, null, 2)}\n`,
);
writeFileSync(
	join(outDir, "meta.json"),
	`${JSON.stringify({ listVersion: version, count: words.length, generatedAt: new Date().toISOString(), sources: ["emojibase-data/es"] }, null, 2)}\n`,
);
writeFileSync(
	join(ROOT, "scripts", "review-queue.json"),
	`${JSON.stringify(reviewQueue, null, 2)}\n`,
);
report.kept = words.length;
report.reviewQueue = reviewQueue.length;
writeFileSync(
	join(ROOT, "scripts", "build-report.json"),
	`${JSON.stringify(report, null, 2)}\n`,
);

let bits = 0;
for (let i = 0; i < 7 && i < words.length; i++)
	bits += Math.log2(words.length - i);
console.log(
	`words: ${words.length} | review-queue: ${reviewQueue.length} | bits(n,7)=${bits.toFixed(1)}`,
);
console.log(JSON.stringify(report));
