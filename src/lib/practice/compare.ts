import { toAscii } from "../password/normalize.js";

/** Comparación tolerante: tildes, mayúsculas y espacios sobrantes. */
export function checkWord(input: string, ascii: string): boolean {
	return toAscii(input) === ascii;
}

/** Coincidencia exacta de la contraseña completa (etapa 5). */
export function checkPassword(input: string, text: string): boolean {
	return input === text;
}
