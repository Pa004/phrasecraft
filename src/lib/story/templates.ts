import type { WordEntry } from "../password/types.js";
import { finishSentence, nounPhrase } from "./grammar.js";
import {
	INTRANSITIVE,
	TRANSITIVE,
	TRIPLE_PREPS,
	type VerbEntry,
} from "./verbs.js";

export type Rand = (maxExclusive: number) => number;

export function mulberry32(seed: number): Rand {
	let a = seed >>> 0;
	return (maxExclusive: number): number => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) % maxExclusive;
	};
}

const defaultRand: Rand = (n) => Math.floor(Math.random() * n);

function pickUsable(
	bank: VerbEntry[],
	subject: WordEntry,
	rand: Rand,
): VerbEntry {
	const usable = bank.filter((v) => !v.needsAnimateSubject || subject.animate);
	const pool =
		usable.length > 0 ? usable : bank.filter((v) => !v.needsAnimateSubject);
	const fallback = pool.length > 0 ? pool : bank;
	return fallback[rand(fallback.length)]!;
}

function transitiveClause(s: WordEntry, o: WordEntry, rand: Rand): string {
	const v = pickUsable(TRANSITIVE, s, rand);
	return `${nounPhrase(s, { definite: true })} ${v.base} ${nounPhrase(o, { definite: false })}`;
}

function intransitiveClause(s: WordEntry, c: WordEntry, rand: Rand): string {
	const v = pickUsable(INTRANSITIVE, s, rand);
	return `${nounPhrase(s, { definite: true })} ${v.base} ${nounPhrase(c, { definite: true, prep: v.prep })}`;
}

function tripleClause(
	s: WordEntry,
	o: WordEntry,
	extra: WordEntry,
	rand: Rand,
): string {
	const v = pickUsable(TRANSITIVE, s, rand);
	const prep = TRIPLE_PREPS[rand(TRIPLE_PREPS.length)]!;
	return `${nounPhrase(s, { definite: true })} ${v.base} ${nounPhrase(o, { definite: false })} ${nounPhrase(extra, { definite: true, prep })}`;
}

export interface StoryOptions {
	rand?: Rand;
}

export function buildStory(
	words: WordEntry[],
	opts: StoryOptions = {},
): string {
	if (words.length < 2)
		throw new RangeError("se necesitan al menos 2 palabras");
	const rand = opts.rand ?? defaultRand;
	if (words.length === 3) {
		return finishSentence(tripleClause(words[0]!, words[1]!, words[2]!, rand));
	}
	const sentences: string[] = [];
	let i = 0;
	sentences.push(transitiveClause(words[i]!, words[i + 1]!, rand));
	i += 2;
	let connector = "mientras";
	while (words.length - i > 3) {
		sentences.push(
			`${connector} ${intransitiveClause(words[i]!, words[i + 1]!, rand)}`,
		);
		connector = "y";
		i += 2;
	}
	const rest = words.length - i;
	if (rest === 3) {
		sentences.push(
			`y ${tripleClause(words[i]!, words[i + 1]!, words[i + 2]!, rand)}`,
		);
	} else if (rest === 2) {
		const prefix = sentences.length > 1 ? "y " : "mientras ";
		const last = sentences.pop()!;
		sentences.push(
			`${last} ${prefix}${intransitiveClause(words[i]!, words[i + 1]!, rand)}`,
		);
	}
	return finishSentence(sentences.join(" "));
}
