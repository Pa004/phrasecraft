import svelte from "@astrojs/svelte";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "static",
	// Nunca CSS en línea: la CSP bloquea <style> y el despliegue quedaría sin estilos.
	build: { inlineStylesheets: "never" },
	integrations: [
		svelte(),
		AstroPWA({
			registerType: "autoUpdate",
			manifest: false,
			workbox: {
				globPatterns: [
					"**/*.{js,css,html,svg,woff2,json}",
					"icons/es.sprite.svg",
				],
			},
		}),
	],
});
