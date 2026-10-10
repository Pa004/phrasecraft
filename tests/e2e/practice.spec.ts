import { expect, test } from "@playwright/test";

const ascii = (s: string): string =>
	s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

test("flujo completo de práctica solo con teclado y ratón", async ({
	page,
}) => {
	await page.goto("/practicar");
	const gen = page.getByRole("button", { name: /generar para practicar/i });
	await expect(gen).toBeEnabled();
	await gen.click();
	await page.getByRole("button", { name: /^practicar$/i }).click();

	// Etapa 1: Mira — leer las palabras en orden antes de avanzar
	await expect(page.getByText(/etapa 1 de 5/i)).toBeVisible();
	const label =
		(await page
			.getByRole("img", { name: /^escena con/i })
			.getAttribute("aria-label")) ?? "";
	const sceneWords = label
		.split(":")[1]
		?.split(",")
		.map((s) => s.trim())
		.filter(Boolean) as string[];
	expect(sceneWords.length).toBeGreaterThanOrEqual(4);
	await page.getByRole("button", { name: /^listo$/i }).click();

	// Etapa 2: Completa (2 huecos numerados)
	await expect(page.getByText(/etapa 2 de 5/i)).toBeVisible();
	const inputs2 = page.locator('input[name="pc-w-a"], input[name="pc-w-b"]');
	await expect(inputs2).toHaveCount(2);
	for (let i = 0; i < 2; i++) {
		const name = (await inputs2.nth(i).locator("..").textContent()) ?? "";
		const pos = Number(name.match(/palabra (\d+)/i)?.[1]) - 1;
		await inputs2.nth(i).fill(sceneWords[pos]!);
	}
	await page.getByRole("button", { name: /^comprobar$/i }).click();

	// Etapa 3: Ordena
	await expect(page.getByText(/etapa 3 de 5/i)).toBeVisible();
	for (let i = 0; i < sceneWords.length; i++) {
		for (let guard = 0; guard < sceneWords.length; guard++) {
			const items = page.getByTestId("order-item");
			const at = await items.nth(i).getAttribute("data-word");
			if (at === sceneWords[i]) break;
			await items
				.filter({
					has: page.getByRole("button", {
						name: new RegExp(`^subir ${sceneWords[i]}$`, "i"),
					}),
				})
				.getByRole("button", { name: /^subir/i })
				.click();
		}
	}
	await page.getByRole("button", { name: /comprobar orden/i }).click();

	// Etapa 4: Recuerda
	await expect(page.getByText(/etapa 4 de 5/i)).toBeVisible();
	for (let i = 0; i < sceneWords.length; i++) {
		await page.locator(`input[name="pc-r-${i}"]`).fill(sceneWords[i]!);
	}
	await page.getByRole("button", { name: /^comprobar$/i }).click();

	// Etapa 5: Sin pistas (modo estándar: ascii con guiones)
	await expect(page.getByText(/etapa 5 de 5/i)).toBeVisible();
	await page
		.locator('input[name="pc-final"]')
		.fill(sceneWords.map(ascii).join("-"));
	await page.getByRole("button", { name: /^comprobar$/i }).click();

	// Fin: calendario + .ics
	await expect(page.getByText(/completado/i)).toBeVisible();
	await expect(
		page.getByRole("button", { name: /descargar recordatorio/i }),
	).toBeVisible();
});
