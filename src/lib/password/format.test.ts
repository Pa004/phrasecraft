import { describe, expect, it } from "vitest";
import { SYMBOLS } from "./entropy";
import {
	capitalizeAscii,
	formatCompatBase,
	formatStandard,
	randomDigits,
	randomSymbol,
} from "./format";
import type { WordEntry } from "./types";

const w = (ascii: string): WordEntry => ({
	id: ascii,
	es: ascii,
	ascii,
	gender: "m",
	animate: false,
	icon: ascii,
	tags: [],
});

describe("format", () => {
	it("deberia unir con guiones en estandar", () => {
		expect(formatStandard([w("camion"), w("pulpo")])).toBe("camion-pulpo");
	});
	it("deberia capitalizar en compat sin anadir bits", () => {
		expect(formatCompatBase([w("camion"), w("luna")])).toBe("Camion-Luna");
	});
	it("deberia generar 2 digitos y 1 simbolo del set", () => {
		expect(randomDigits(2)).toMatch(/^\d{2}$/);
		expect(SYMBOLS).toContain(randomSymbol());
	});
	it("capitaliza vacio sin romper", () => {
		expect(capitalizeAscii("")).toBe("");
	});
});
