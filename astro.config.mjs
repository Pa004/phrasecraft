import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import AstroPWA from "@vite-pwa/astro";

export default defineConfig({
  output: "static",
  integrations: [
    svelte(),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}", "icons/es.sprite.svg"],
      },
    }),
  ],
});
