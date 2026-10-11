import wordsUrl from "../data/es/words.json?url";
import type { WordEntry } from "./password/types.js";

let cached: Promise<WordEntry[]> | null = null;

/**
 * Lista completa de palabras como asset aparte (no va en el JS inicial).
 * Se descarga siempre entera e igual para todos, antes de generar:
 * ninguna petición depende de las palabras elegidas.
 */
export function loadWords(): Promise<WordEntry[]> {
	if (!cached) {
		cached = fetch(wordsUrl).then((res) => {
			if (!res.ok) throw new Error("lista no disponible");
			return res.json() as Promise<WordEntry[]>;
		});
	}
	return cached;
}
