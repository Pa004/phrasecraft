import { expect, test } from "@playwright/test";

test("generar no produce peticiones de red", async ({ page }) => {
	await page.goto("/");
	const btn = page.getByRole("button", { name: /generar mi escena/i });
	await expect(btn).toBeEnabled();
	const requests: string[] = [];
	page.on("request", (r) => requests.push(r.url()));
	await btn.click();
	await expect(page.getByRole("img", { name: /escena con/i })).toBeVisible();
	expect(requests).toEqual([]);
});

test("no escribe almacenamiento fuera de /estudio", async ({ page }) => {
	await page.goto("/");
	const btn = page.getByRole("button", { name: /generar mi escena/i });
	await expect(btn).toBeEnabled();
	await btn.click();
	await expect(page.getByRole("img", { name: /escena con/i })).toBeVisible();
	const stored = await page.evaluate(() => ({
		local: { ...localStorage },
		session: { ...sessionStorage },
	}));
	expect(stored).toEqual({ local: {}, session: {} });
});
