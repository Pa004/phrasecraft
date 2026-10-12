import { tilt } from "../lib/ui/tilt.js";

/**
 * Inclinación del tablero completo como el mock (±4° con rAF).
 * Solo puntero fino y sin `prefers-reduced-motion` (ver tilt.ts).
 */
for (const board of document.querySelectorAll<HTMLElement>(".board")) {
	tilt(board, { max: 4 });
}
