import { describe, expect, it } from "vitest";
import { bitsCompat, bitsDistinct } from "./entropy";
import { generate } from "./generate";
import type { WordEntry } from "./types";

const list: WordEntry[] = [
	"camion",
	"pulpo",
	"luna",
	"helado",
	"tambor",
	"llave",
	"volcan",
	"mesa",
].map((ascii) => ({
	id: ascii,
	es: ascii,
	ascii,
	gender: "m" as const,
	animate: false,
	icon: ascii,
	tags: [],
}));

const sequential = () => {
	let s = 0;
	return (n: number) => s++ % n;
};

describe("generate", () => {
	it("deberia generar texto estandar con bits exactos", () => {
		const r = generate(list, 3, "standard", sequential(), "es-v1");
		expect(r.text).toBe("camion-pulpo-luna");
		expect(r.bits).toBe(bitsDistinct(list.length, 3));
		expect(r.mode).toBe("standard");
		expect(r.listVersion).toBe("es-v1");
	});
	it("deberia generar compat con digitos y simbolo y bits recalculados", () => {
		const r = generate(list, 3, "compat", sequential(), "es-v1");
		expect(r.text).toMatch(/^Camion-Pulpo-Luna\d{2}[!?#$%&*+=@]$/);
		expect(r.bits).toBe(bitsCompat(list.length, 3, 2));
	});
	it("deberia lanzar cuando k supera la lista", () => {
		expect(() => generate(list, 99)).toThrow(RangeError);
	});
	it("deberia evitar duplicados", () => {
		const r = generate(list, 8);
		expect(new Set(r.words.map((x) => x.ascii)).size).toBe(8);
	});
});
