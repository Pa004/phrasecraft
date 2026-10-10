import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { WordEntry } from "../password/types.js";
import { buildStory, mulberry32 } from "./templates";
import { INTRANSITIVE, TRANSITIVE } from "./verbs";

const here = dirname(fileURLToPath(import.meta.url));
const denylist: string[] = JSON.parse(
	readFileSync(join(here, "..", "..", "data", "es", "denylist.json"), "utf8"),
);

const w = (
	es: string,
	ascii: string,
	gender: "m" | "f",
	animate: boolean,
	stressedA = false,
): WordEntry => ({
	id: ascii,
	es,
	ascii,
	gender,
	stressedA,
	animate,
	icon: ascii,
	tags: [],
});

const SEVEN: WordEntry[] = [
	w("camión", "camion", "m", false),
	w("pulpo", "pulpo", "m", true),
	w("luna", "luna", "f", false),
	w("helado", "helado", "m", false),
	w("tambor", "tambor", "m", false),
	w("llave", "llave", "f", false),
	w("volcán", "volcan", "m", false),
];

describe("buildStory", () => {
	it("ejemplo con orden de contraseña preservado", () => {
		const text = buildStory(SEVEN, { rand: mulberry32(7) });
		const idx = SEVEN.map((x) => text.indexOf(x.es));
		expect(idx.every((i) => i >= 0)).toBe(true);
		expect([...idx].sort((a, b) => a - b)).toEqual(idx);
		expect(text.endsWith(".")).toBe(true);
		expect(text[0]).toBe(text[0]!.toUpperCase());
	});

	it("200 semillas fijas generan historias estables", () => {
		for (let seed = 0; seed < 200; seed++) {
			expect(buildStory(SEVEN, { rand: mulberry32(seed) })).toMatchSnapshot();
		}
	});

	it("propiedad: contiene las k palabras en orden para k=2..9", () => {
		const words = SEVEN.concat([
			w("agua", "agua", "f", false, true),
			w("águila", "aguila", "f", true, true),
		]);
		for (let k = 2; k <= 9; k++) {
			const text = buildStory(words.slice(0, k), { rand: mulberry32(k * 13) });
			const idx = words.slice(0, k).map((x) => text.indexOf(x.es));
			expect(idx.every((i) => i >= 0)).toBe(true);
			expect([...idx].sort((a, b) => a - b)).toEqual(idx);
		}
	});

	it("ninguna historia contiene palabras de denylist", () => {
		for (let seed = 0; seed < 50; seed++) {
			const text = buildStory(SEVEN, { rand: mulberry32(seed) }).toLowerCase();
			for (const bad of denylist) {
				expect(text.split(/[^a-zñ]+/).includes(bad)).toBe(false);
			}
		}
	});

	it("verbo de sujeto animado solo con sujeto animado", () => {
		const animateBases = new Set(
			[...TRANSITIVE, ...INTRANSITIVE]
				.filter((v) => v.needsAnimateSubject)
				.map((v) => v.base),
		);
		const inanimates = SEVEN.filter((x) => !x.animate).map((x) => x.es);
		for (let seed = 0; seed < 50; seed++) {
			const text = buildStory(SEVEN, { rand: mulberry32(seed * 3 + 1) });
			for (const base of animateBases) {
				const at = text.indexOf(` ${base} `);
				if (at < 0) continue;
				const before = text.slice(0, at);
				const subject = [
					...before.matchAll(/(?:el|la|un|una|del|al) ([a-záéíóúñ]+)/gi),
				].pop()?.[1];
				if (subject && inanimates.includes(subject)) {
					throw new Error(`verbo ${base} con sujeto inanimado ${subject}`);
				}
			}
		}
	});

	it("lanza con menos de 2 palabras", () => {
		expect(() => buildStory(SEVEN.slice(0, 1))).toThrow(RangeError);
	});
});
