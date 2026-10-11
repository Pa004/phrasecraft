import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
		coverage: {
			include: ["src/lib/**"],
			exclude: ["**/types.ts"],
		},
	},
});
