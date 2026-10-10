import { describe, expect, it } from "vitest";
import { checkPassword, checkWord } from "./compare";
import { nextStage, pickHidden, shuffled } from "./stages";

describe("compare", () => {
	it("acepta tildes, mayúsculas y espacios", () => {
		expect(checkWord("Camión", "camion")).toBe(true);
		expect(checkWord("  LUNA ", "luna")).toBe(true);
		expect(checkWord("aguila", "aguila")).toBe(true);
	});
	it("rechaza otra palabra", () => {
		expect(checkWord("luna", "pulpo")).toBe(false);
	});
	it("contraseña exacta sin tolerancia", () => {
		expect(checkPassword("Camion-Pulpo42!", "Camion-Pulpo42!")).toBe(true);
		expect(checkPassword("camion-pulpo42!", "Camion-Pulpo42!")).toBe(false);
	});
});

describe("stages", () => {
	it("avanza 1..5 y termina", () => {
		expect(nextStage(1)).toBe(2);
		expect(nextStage(5)).toBe("done");
	});
	it("tapa 2 posiciones distintas ordenadas", () => {
		const seq = [0.1, 0.1, 0.5];
		const [a, b] = pickHidden(8, () => seq.shift() ?? 0.9);
		expect(a).toBeLessThan(b);
		expect(() => pickHidden(1)).toThrow(RangeError);
	});
	it("mezcla sin perder elementos", () => {
		const out = shuffled([1, 2, 3, 4, 5], () => 0.9);
		expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
	});
});
