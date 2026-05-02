// @ts-check

import ts from "@typescript-eslint/eslint-plugin"
import prettier from "eslint-plugin-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
	{
		ignores: ["dist/**/*", "scripts/**/*", "*.mjs"],
	},
	{ plugins: { prettier, "@typescript-eslint": ts } },
	{
		files: ["**/*.ts"],
		languageOptions: {
			globals: {
				...globals.browser,
			},
			ecmaVersion: 2022,
			sourceType: "module",
			parser: tseslint.parser,
			parserOptions: { project: "./tsconfig.json" },
		},
		rules: {
			...ts.configs["recommended"].rules,
			eqeqeq: "error",
			"prettier/prettier": "error",
			"no-console": "off",
			"no-var": "error",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
		},
	}
)
