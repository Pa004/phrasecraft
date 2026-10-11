import { expect, test } from "@playwright/test";

test("estudio con desechable: consentimiento, recuerdo y exporte", async ({
	page,
}) => {
	await page.goto("/estudio");
	const gen = page.getByRole("button", { name: /generar desechable/i });
	await expect(gen).toBeDisabled();
	await page.getByRole("checkbox").check();
	await expect(gen).toBeEnabled();
	await gen.click();

	const disposable = (await page.getByTestId("disposable").textContent()) ?? "";
	expect(disposable.split("-").length).toBeGreaterThanOrEqual(4);

	await page.getByRole("button", { name: /probar recuerdo/i }).click();
	await page.locator('input[name="st-recall"]').fill(disposable.trim());
	await page.getByRole("button", { name: /comprobar recuerdo/i }).click();
	await expect(page.getByText(/correcto en/i)).toBeVisible();

	const exported = (await page.getByTestId("study-export").textContent()) ?? "";
	const json = JSON.parse(exported) as {
		listVersion: string;
		checks: { ok: boolean }[];
	};
	expect(json.checks[0]?.ok).toBe(true);
	expect(exported).not.toContain(disposable.trim());
	await expect(
		page.getByRole("button", { name: /copiar resultado/i }),
	).toBeVisible();
});

test("/seguridad expone modelo de amenazas y verificación", async ({
	page,
}) => {
	await page.goto("/seguridad");
	await expect(
		page.getByRole("heading", { name: /qué se defiende/i }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /qué no se promete/i }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /verifícalo tú/i }),
	).toBeVisible();
});
