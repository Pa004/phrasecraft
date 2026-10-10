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
				}
			}
		}
	});
	it("lanza con k < 1", () => {
		expect(() => layoutPositions(0, "arco")).toThrow(RangeError);
	});
});
