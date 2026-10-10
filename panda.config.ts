import { defineConfig } from "@pandacss/dev";

export default defineConfig({
	preflight: true,
	include: ["./src/**/*.{astro,svelte,ts}"],
	outdir: "src/styles/panda",
	theme: {
		extend: {
			tokens: {
				colors: {
					ink: { value: "#1a1a2e" },
					paper: { value: "#faf7f0" },
					accent: { value: "#e4582e" },
				},
			},
		},
	},
});
