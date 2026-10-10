import { describe, expect, it } from "vitest";
import { type StudyRecord, buildStudyExport } from "./export";
import { randomSaltHex, sha256Hex } from "./hash";

describe("study hash", () => {
	it("determinista con misma sal, distinto con otra", async () => {
		const a = await sha256Hex("sal1", "camion-pulpo");
		const b = await sha256Hex("sal1", "camion-pulpo");
		const c = await sha256Hex("sal2", "camion-pulpo");
		expect(a).toBe(b);
		expect(a).not.toBe(c);
		expect(a).toMatch(/^[0-9a-f]{64}$/);
	});
	it("sal aleatoria de 32 hex", () => {
		expect(randomSaltHex()).toMatch(/^[0-9a-f]{32}$/);
		expect(randomSaltHex()).not.toBe(randomSaltHex());
	});
});

describe("study export", () => {
	it("solo metadatos agregados, sin contraseñas", () => {
		const record: StudyRecord = {
			salt: "s",
			hash: "h",
			createdAtISO: "2026-01-01T00:00:00.000Z",
			listVersion: "es-v0-draft",
			k: 8,
			checks: [{ afterHours: 24, ok: true, attempts: 1 }],
		};
		const out = JSON.parse(buildStudyExport(record)) as Record<string, unknown>;
		expect(out).toEqual({
			listVersion: "es-v0-draft",
			k: 8,
			t0: "2026-01-01T00:00:00.000Z",
			checks: [{ afterHours: 24, ok: true, attempts: 1 }],
		});
		expect(JSON.stringify(out)).not.toContain("camion");
	});
});
