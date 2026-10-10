export type Stage = 1 | 2 | 3 | 4 | 5 | "done";

export const STAGE_NAMES: Record<Exclude<Stage, "done">, string> = {
	1: "Mira",
	2: "Completa",
	3: "Ordena",
	4: "Recuerda",
	5: "Sin pistas",
};

export function nextStage(s: Exclude<Stage, "done">): Stage {
	return s === 5 ? "done" : ((s + 1) as Stage);
}

/** Dos posiciones distintas para tapar en la etapa 2 (no criptográfico). */
export function pickHidden(n: number, rand: () => number = Math.random): [number, number] {
	if (n < 2) throw new RangeError("se necesitan al menos 2 palabras");
	const a = Math.floor(rand() * n);
	let b = Math.floor(rand() * n);
	while (b === a) b = Math.floor(rand() * n);
	return a < b ? [a, b] : [b, a];
}

/** Mezcla Fisher-Yates para la etapa 3 (no criptográfico). */
export function shuffled<T>(arr: T[], rand: () => number = Math.random): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[out[i], out[j]] = [out[j]!, out[i]!];
	}
	return out;
}
