import { describe, expect, it } from "vitest";
import { buildReminderICS } from "./ics";

describe("ics", () => {
	it("formato válido con escapes RFC 5545", () => {
		const ics = buildReminderICS({ date: new Date("2026-01-02T09:00:00Z"), summary: "Repasa, tu escena; ya" });
		expect(ics).toContain("BEGIN:VEVENT");
		expect(ics).toContain("DTSTART:20260102T090000Z");
		expect(ics).toContain("SUMMARY:Repasa\\, tu escena\\; ya");
		expect(ics).toMatch(/UID:[0-9a-f]+@phrasecraft/);
		expect(ics).not.toContain("camion");
		expect(ics.split("\r\n").length).toBeGreaterThan(8);
	});
});
