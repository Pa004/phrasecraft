import type { WordEntry } from "../password/types.js";

export function definiteArticle(w: WordEntry): string {
	return w.gender === "m" || w.stressedA ? "el" : "la";
}

export function indefiniteArticle(w: WordEntry): string {
	return w.gender === "m" || w.stressedA ? "un" : "una";
}

function joinPrep(prep: string, article: string): string {
	if (prep === "de" && article === "el") return "del";
	if (prep === "a" && article === "el") return "al";
	if (article === "el" && prep.endsWith(" de"))
		return `${prep.slice(0, -3)} del`;
	if (article === "el" && prep.endsWith(" a")) return `${prep.slice(0, -2)} al`;
	return `${prep} ${article}`;
}

export interface NounPhraseOptions {
	definite: boolean;
	prep?: string;
}

export function nounPhrase(w: WordEntry, opts: NounPhraseOptions): string {
	const article = opts.definite ? definiteArticle(w) : indefiniteArticle(w);
	if (opts.prep) return `${joinPrep(opts.prep, article)} ${w.es}`;
	return `${article} ${w.es}`;
}

export function finishSentence(s: string): string {
	const t = s.trim();
	if (t.length === 0) return ".";
	return `${t[0]!.toUpperCase()}${t.slice(1)}.`;
}
