import { defineConfig } from "vite";

export default defineConfig({
	test: {
		coverage: {
			all: true,
			reporter: ["text", "lcov"],
			include: ["src"],
			exclude: ["src/types", "**/*.test.ts"],
		},
	},
});
