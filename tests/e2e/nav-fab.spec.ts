import { expect, test } from "@playwright/test";

test("la cabecera abre a la izquierda un menú superpuesto con glass y descripciones, y cierra con Esc", async ({
	page,
}) => {
	await page.goto("/");
	await expect(page.locator(".topbar")).toHaveCount(0);
	const head = page.locator(".sitehead");
	await expect(head.getByText("phrasecraft")).toBeVisible();
	const fab = page.getByRole("button", {
		name: "Abrir menú de navegación",
	});
	await expect(fab).toBeVisible();
	const box = await fab.boundingBox();
	const mitad = (page.viewportSize()?.width ?? 1280) / 2;
	expect(box?.x ?? 9999).toBeLessThan(mitad);
	const menu = page.getByRole("navigation", { name: "Navegación" });
	await expect(menu).toBeHidden();
	await fab.click();
	await expect(menu).toBeVisible();
	const menuBox = await menu.boundingBox();
	const headerBox = await page.locator("body > header").boundingBox();
	if (menuBox === null || headerBox === null)
		throw new Error("sin menú o sin header de página");
	expect(menuBox.y + menuBox.height).toBeGreaterThan(headerBox.y);
	const glass = await page.evaluate(() => {
		const el = document.querySelector(".fab-menu");
		if (!el) return "none";
		return getComputedStyle(el).backdropFilter;
	});
	expect(glass).not.toBe("none");
	expect(glass).toContain("blur");
	await expect(menu.getByText("En esta página")).toBeVisible();
	await expect(menu.getByText("Páginas")).toBeVisible();
	await expect(
		menu.getByRole("link", { name: "Generar Crea tu contraseña maestra" }),
	).toHaveAttribute("aria-current", "page");
	for (const nombre of [
		"Practicar 5 etapas guiadas en minutos",
		"Estudio Desechable, recuerdo y exporte",
	]) {
		await expect(menu.getByRole("link", { name: nombre })).toBeVisible();
	}
	await expect(
		menu.getByRole("link", {
			name: "Cómo funciona Genera, practica y recuerda en 3 pasos",
		}),
	).toBeVisible();
	await expect(
		page.getByText("Úsala para tu contraseña maestra"),
	).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(menu).toBeHidden();
	await expect(
		page.getByRole("button", { name: "Abrir menú de navegación" }),
	).toBeFocused();
});

test("el pie queda centrado y pegado al fondo", async ({ page }) => {
	await page.goto("/");
	const pie = page.locator("footer.pie");
	await expect(pie).toBeVisible();
	const descentrado = await page.evaluate(() => {
		const el = document.querySelector("footer.pie");
		if (!el) return null;
		const r = el.getBoundingClientRect();
		const vw = document.documentElement.clientWidth;
		return Math.abs(r.left - (vw - r.width) / 2);
	});
	if (descentrado === null) throw new Error("sin footer.pie en la página");
	expect(descentrado).toBeLessThan(2);
	await pie.scrollIntoViewIfNeeded();
	const hueco = await page.evaluate(() => {
		const el = document.querySelector("footer.pie");
		if (!el) return 999;
		const r = el.getBoundingClientRect();
		return document.documentElement.clientHeight - r.bottom;
	});
	expect(hueco).toBeLessThan(2);
});

test("un enlace de sección del menú salta al ancla y cierra el menú", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Abrir menú de navegación" }).click();
	const menu = page.getByRole("navigation", { name: "Navegación" });
	await menu
		.getByRole("link", {
			name: "Cómo funciona Genera, practica y recuerda en 3 pasos",
		})
		.click();
	await expect(menu).toBeHidden();
	await expect(page).toHaveURL(/#como$/);
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
	await expect(dialog.getByText(/\d+ palabras · \d+ caracteres/)).toBeVisible();
	await expect(
		page.getByRole("button", { name: /practicar esta escena/i }),
	).toBeVisible();
	await page.getByRole("button", { name: "Cerrar", exact: true }).click();
	await expect(page.getByRole("dialog")).toBeHidden();
});
