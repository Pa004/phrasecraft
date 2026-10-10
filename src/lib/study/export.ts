export interface StudyCheck {
	afterHours: number;
	ok: boolean;
	attempts: number;
}

export interface StudyRecord {
	salt: string;
	hash: string;
	createdAtISO: string;
	listVersion: string;
	k: number;
	checks: StudyCheck[];
}

export interface StudyExport {
	listVersion: string;
	k: number;
	t0: string;
	checks: StudyCheck[];
}

/** Export sin datos personales y sin ninguna contraseña. */
export function buildStudyExport(record: StudyRecord): string {
	const out: StudyExport = {
		listVersion: record.listVersion,
		k: record.k,
		t0: record.createdAtISO,
		checks: record.checks,
	};
	return JSON.stringify(out, null, 2);
}

const KEY = "phrasecraft:study";

export function saveStudy(record: StudyRecord): void {
	localStorage.setItem(KEY, JSON.stringify(record));
}

export function loadStudy(): StudyRecord | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const r = JSON.parse(raw) as StudyRecord;
		if (typeof r.hash !== "string" || !Array.isArray(r.checks)) return null;
		return r;
	} catch {
		return null;
	}
}

export function clearStudy(): void {
	localStorage.removeItem(KEY);
}
