import { describe, expect, it } from "vitest";
import { reviewSchedule } from "./reminders";

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
