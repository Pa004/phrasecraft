function escapeText(s: string): string {
	return s
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n");
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

function toICSDate(d: Date): string {
	return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function uid(): string {
	const buf = new Uint32Array(4);
	crypto.getRandomValues(buf);
	return [...buf].map((x) => x.toString(16).padStart(8, "0")).join("");
}

export interface ReminderInput {
	date: Date;
	summary?: string;
}

/** Recordatorio sin contenido sensible (nunca la contraseña). */
export function buildReminderICS(input: ReminderInput): string {
	const summary = escapeText(input.summary ?? "Repasa tu escena");
	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//phrasecraft//practice//ES",
		"BEGIN:VEVENT",
		`UID:${uid()}@phrasecraft`,
		`DTSTAMP:${toICSDate(new Date())}`,
		`DTSTART:${toICSDate(input.date)}`,
		`SUMMARY:${summary}`,
		"DESCRIPTION:Repasa tu escena mentalmente. Sin contraseñas aquí.",
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
}
