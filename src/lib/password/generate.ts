import { bitsCompat, bitsDistinct } from "./entropy.js";
import {
	formatCompatBase,
	formatStandard,
	randomDigits,
	randomSymbol,
} from "./format.js";
import { pickDistinctIndices, randomInt } from "./rng.js";
import type { PasswordMode, PasswordResult, WordEntry } from "./types.js";

export function generate(
	list: WordEntry[],
	k: number,
	mode: PasswordMode = "standard",
	rand = randomInt,
	listVersion = "unknown",
): PasswordResult {
	if (k > list.length) throw new RangeError("k > list.length");
	const words = pickDistinctIndices(list.length, k, rand).map((i) => list[i]!);
	if (mode === "compat") {
		const text = `${formatCompatBase(words)}${randomDigits(2, rand)}${randomSymbol(rand)}`;
		return {
			words,
			text,
			bits: bitsCompat(list.length, k, 2),
			mode,
			listVersion,
		};
	}
	return {
		words,
		text: formatStandard(words),
		bits: bitsDistinct(list.length, k),
		mode,
		listVersion,
	};
}
