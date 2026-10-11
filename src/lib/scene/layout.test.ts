import { describe, expect, it } from "vitest";
import { LAYOUTS, layoutPositions } from "./layout";

describe("layoutPositions", () => {
	it("k posiciones dentro de bounds y distintas por plantilla", () => {
		for (const name of LAYOUTS) {
			for (const k of [1, 2, 7, 8, 9]) {
				const spots = layoutPositions(k, name);
				expect(spots).toHaveLength(k);
				for (const s of spots) {
					expect(s.x).toBeGreaterThanOrEqual(0);
					expect(s.x).toBeLessThanOrEqual(1);
					expect(s.y).toBeGreaterThanOrEqual(0);
					expect(s.y).toBeLessThanOrEqual(1);
					expect(s.z).toBeGreaterThanOrEqual(0);
					expect(s.z).toBeLessThanOrEqual(1);
				}
			}
		}
	});
	it("profundidad: abajo en pantalla es más cercano", () => {
		const spots = layoutPositions(5, "camino");
		const byY = [...spots].sort((a, b) => a.y - b.y);
		const byZ = [...spots].sort((a, b) => a.z - b.z);
		expect(byY.map((s) => s.x)).toEqual(byZ.map((s) => s.x));
		expect(layoutPositions(1, "arco")[0]!.z).toBe(0.5);
	});
	it("lanza con k < 1", () => {
		expect(() => layoutPositions(0, "arco")).toThrow(RangeError);
	});
});
