import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("guardia Math.random", () => {
	it("ningun .ts de password (salvo tests) usa Math.random", () => {
		const dir = fileURLToPath(new URL(".", import.meta.url));
		const files = readdirSync(dir).filter(
			(f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
		);
		const offenders = files.filter((f) =>
			/Math\.random/.test(readFileSync(join(dir, f), "utf8")),
		);
		expect(offenders).toEqual([]);
	});
});
