import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("inicio sin violaciones axe críticas ni serias", async ({ page }) => {
	await page.goto("/");
	const gen = page.getByRole("button", { name: /generar mi escena/i });
	await expect(gen).toBeEnabled();
	await gen.click();
	await expect(page.getByRole("img", { name: /^escena con/i })).toBeVisible();
	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag22aa"])
		.analyze();
	const bad = results.violations.filter(
		(v) => v.impact === "critical" || v.impact === "serious",
	);
	expect(bad, JSON.stringify(bad, null, 2)).toEqual([]);
});

test("/practicar sin violaciones axe críticas ni serias", async ({ page }) => {
	await page.goto("/practicar");
	const gen = page.getByRole("button", { name: /generar para practicar/i });
	await expect(gen).toBeEnabled();
	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag22aa"])
		.analyze();
	const bad = results.violations.filter(
		(v) => v.impact === "critical" || v.impact === "serious",
	);
	expect(bad, JSON.stringify(bad, null, 2)).toEqual([]);
});
