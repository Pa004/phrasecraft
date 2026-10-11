import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadProgress, reviewSchedule, saveProgress } from "./reminders";

describe("reminders", () => {
	it("10 min, 1 d, 3 d, 7 d", () => {
		const from = new Date("2026-01-01T00:00:00Z");
		const [a, b, c, d] = reviewSchedule(from);
		expect(a!.toISOString()).toBe("2026-01-01T00:10:00.000Z");
		expect(b!.toISOString()).toBe("2026-01-02T00:00:00.000Z");
		expect(c!.toISOString()).toBe("2026-01-04T00:00:00.000Z");
		expect(d!.toISOString()).toBe("2026-01-08T00:00:00.000Z");
	});
});

describe("progress storage (solo metadatos)", () => {
	const store = new Map<string, string>();
	beforeEach(() => {
		store.clear();
		vi.stubGlobal("localStorage", {
			getItem: (k: string) => store.get(k) ?? null,
			setItem: (k: string, v: string) => void store.set(k, String(v)),
			removeItem: (k: string) => void store.delete(k),
		});
	});
	it("guarda y lee", () => {
		saveProgress(5, new Date("2026-01-02T00:00:00Z"));
		expect(loadProgress()).toMatchObject({
			stage: 5,
			nextDueISO: "2026-01-02T00:00:00.000Z",
		});
	});
	it("null si vacío o corrupto", () => {
		expect(loadProgress()).toBeNull();
		store.set("phrasecraft:practice", "no-json{");
		expect(loadProgress()).toBeNull();
		store.set("phrasecraft:practice", JSON.stringify({ stage: "x" }));
		expect(loadProgress()).toBeNull();
	});
});
