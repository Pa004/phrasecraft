import { expect, test } from "@playwright/test";

test("la escena responde al puntero con tilt 3D", async ({ page }) => {
	await page.goto("/");
	const gen = page.getByRole("button", { name: /generar mi escena/i });
	await expect(gen).toBeEnabled();
	await gen.click();
	const tilt = page.getByTestId("scene-tilt");
	await expect(tilt).toBeVisible();
	const box = (await tilt.boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8, {
		steps: 5,
	});
	const style = await tilt.getAttribute("style");
	expect(style).toContain("rotate");
});

test("sin tilt con movimiento reducido", async ({ browser }) => {
	const ctx = await browser.newContext({ reducedMotion: "reduce" });
	const page = await ctx.newPage();
	await page.goto("/");
	const gen = page.getByRole("button", { name: /generar mi escena/i });
	await expect(gen).toBeEnabled();
	await gen.click();
	const tilt = page.getByTestId("scene-tilt");
	await expect(tilt).toBeVisible();
	const box = (await tilt.boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8, {
		steps: 5,
	});
	expect(await tilt.getAttribute("style")).toBeNull();
	await ctx.close();
});
