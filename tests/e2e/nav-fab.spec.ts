import { expect, test } from "@playwright/test";

test("el FAB abre un menú vertical con los 4 accesos y cierra con Esc", async ({
	page,
}) => {
	await page.goto("/");
	const fab = page.getByRole("button", {
		name: "Abrir menú de navegación",
	});
	await expect(fab).toBeVisible();
	const menu = page.getByRole("navigation", { name: "Accesos rápidos" });
	await expect(menu).toBeHidden();
	await fab.click();
	await expect(menu).toBeVisible();
	await expect(menu.getByText("Generar")).toHaveAttribute(
		"aria-current",
		"page",
	);
	for (const nombre of ["Practicar", "Seguridad", "Estudio"]) {
		await expect(menu.getByRole("link", { name: nombre })).toBeVisible();
	}
	await page.keyboard.press("Escape");
	await expect(menu).toBeHidden();
	await expect(
		page.getByRole("button", { name: "Abrir menú de navegación" }),
	).toBeFocused();
});

test("la escena generada aparece dentro de un modal con story y contraseña", async ({
	page,
}) => {
	await page.goto("/");
	await page
		.getByRole("button", { name: /generar mi escena/i })
		.first()
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeVisible();
	await expect(page.getByRole("img", { name: /^escena con/i })).toBeVisible();
	await expect(dialog.getByText(/^tu contraseña:/i)).toBeVisible();
	await expect(
		page.getByRole("button", { name: /practicar esta escena/i }),
	).toBeVisible();
	await page.getByRole("button", { name: "Cerrar", exact: true }).click();
	await expect(page.getByRole("dialog")).toBeHidden();
});
