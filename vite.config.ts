import { defineConfig } from "vite"
import checker from "vite-plugin-checker"
import { viteStaticCopy } from "vite-plugin-static-copy"

const MODULE_ID = "token-action-hud-gurps"

export default defineConfig({
	publicDir: false,
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		minify: false,
		lib: {
			name: MODULE_ID,
			entry: "src/main.ts",
			formats: ["es"],
			fileName: MODULE_ID,
		},
		rolldownOptions: {
			output: {
				entryFileNames: `${MODULE_ID}.mjs`,
				assetFileNames: "styles/[name][extname]",
			},
		},
		target: "es2022",
	},
	plugins: [
		checker({ typescript: true }),
		viteStaticCopy({
			targets: [
				{ src: "module.json", dest: "." },
				{ src: "lang", dest: "." },
				{ src: "styles", dest: "." },
			],
		}),
	],
})
