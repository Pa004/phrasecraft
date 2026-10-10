export interface PracticeProgress {
	stage: number;
	nextDueISO: string;
	updatedAtISO: string;
}

const KEY = "phrasecraft:practice";

/** Calendario de repaso espaciado (heurística general, sin promesas). */
export function reviewSchedule(from: Date): Date[] {
	const at = (ms: number): Date => new Date(from.getTime() + ms);
	return [at(10 * 60 * 1000), at(24 * 3600 * 1000), at(3 * 24 * 3600 * 1000), at(7 * 24 * 3600 * 1000)];
}

/** Solo metadatos de progreso: jamás palabras ni contraseñas. */
export function saveProgress(stage: number, nextDue: Date): void {
	const p: PracticeProgress = {
		stage,
		nextDueISO: nextDue.toISOString(),
		updatedAtISO: new Date().toISOString(),
	};
	localStorage.setItem(KEY, JSON.stringify(p));
}

export function loadProgress(): PracticeProgress | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const p = JSON.parse(raw) as PracticeProgress;
		if (typeof p.stage !== "number" || typeof p.nextDueISO !== "string") return null;
		return p;
	} catch {
		return null;
	}
}
