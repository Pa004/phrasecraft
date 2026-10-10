import { describe, expect, it } from "vitest";
import type { WordEntry } from "../password/types.js";
import {
	definiteArticle,
	finishSentence,
	indefiniteArticle,
	nounPhrase,
} from "./grammar";

const w = (es: string, gender: "m" | "f", stressedA = false): WordEntry => ({
	id: es,
	es,
	ascii: es,
	gender,
	stressedA,
	animate: false,
	icon: es,
	tags: [],
});

describe("articulos", () => {
	it("el agua / el águila por a tónica aunque sean femeninas", () => {
		expect(definiteArticle(w("agua", "f", true))).toBe("el");
		expect(definiteArticle(w("águila", "f", true))).toBe("el");
		expect(indefiniteArticle(w("hacha", "f", true))).toBe("un");
		expect(indefiniteArticle(w("arma", "f", true))).toBe("un");
	});
	it("la / una para femeninas normales, el / un para masculinos", () => {
		expect(definiteArticle(w("mesa", "f"))).toBe("la");
		expect(indefiniteArticle(w("mesa", "f"))).toBe("una");
		expect(definiteArticle(w("lápiz", "m"))).toBe("el");
		expect(indefiniteArticle(w("lápiz", "m"))).toBe("un");
	});
});

describe("contracciones", () => {
	it("de el -> del, a el -> al", () => {
		expect(
			nounPhrase(w("agua", "f", true), { definite: true, prep: "de" }),
		).toBe("del agua");
		expect(
			nounPhrase(w("águila", "f", true), { definite: true, prep: "a" }),
		).toBe("al águila");
	});
	it("contrae dentro de locuciones que terminan en de/a", () => {
		expect(
			nounPhrase(w("volcán", "m"), { definite: true, prep: "junto a" }),
		).toBe("junto al volcán");
		expect(
			nounPhrase(w("mesa", "f"), { definite: true, prep: "debajo de" }),
		).toBe("debajo de la mesa");
	});
	it("no contrae con la/una", () => {
		expect(nounPhrase(w("mesa", "f"), { definite: true, prep: "de" })).toBe(
			"de la mesa",
		);
	});
});

describe("finishSentence", () => {
	it("mayúscula inicial y punto final", () => {
		expect(finishSentence("el pulpo abraza")).toBe("El pulpo abraza.");
	});
});
