import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { INTRANSITIVE, TRANSITIVE } from "./verbs";

const here = dirname(fileURLToPath(import.meta.url));
const denylist: string[] = JSON.parse(
	readFileSync(join(here, "..", "..", "data", "es", "denylist.json"), "utf8"),
);
const VIOLENT = [
	"mat",
	"golpe",
	"asesin",
	"apuñal",
	"dispar",
	"ahorc",
	"quem",
	"sangr",
	"tortur",
	"estrangul",
	"acuchill",
	"muer",
	"viol",
];

describe("banco de verbos", () => {
	it("minimo 40 transitivos y 20 intransitivos con preposicion", () => {
		expect(TRANSITIVE.length).toBeGreaterThanOrEqual(40);
		expect(INTRANSITIVE.length).toBeGreaterThanOrEqual(20);
		for (const v of INTRANSITIVE) expect(v.prep).toBeTruthy();
		expect(TRANSITIVE.some((v) => !v.needsAnimateSubject)).toBe(true);
		expect(INTRANSITIVE.some((v) => !v.needsAnimateSubject)).toBe(true);
	});
	it("sin violencia ni denylist", () => {
		for (const v of [...TRANSITIVE, ...INTRANSITIVE]) {
			for (const bad of VIOLENT) expect(v.base).not.toContain(bad);
			expect(denylist).not.toContain(
				v.base.normalize("NFD").replace(/\p{M}/gu, ""),
			);
		}
	});
});
