import { describe, expect, it } from "vitest";
import { toAscii } from "./normalize";

describe("toAscii", () => {
	it("deberia quitar tildes y enie", () => {
		expect(toAscii("camión")).toBe("camion");
		expect(toAscii("niño")).toBe("nino");
	});
	it("deberia minisculizar y recortar", () => {
		expect(toAscii("  Luna ")).toBe("luna");
		expect(toAscii("ÁGUILA")).toBe("aguila");
	});
});
