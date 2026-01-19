import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist", "node_modules"] },
	{
		extends: [
			js.configs.recommended,
			...tseslint.configs.strictTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
			parserOptions: {
				project: ["./tsconfig.app.json", "./tsconfig.node.json"],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			// React Hooks
			...reactHooks.configs.recommended.rules,

			// React Refresh
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],

			// TypeScript 엄격한 규칙
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/explicit-function-return-type": [
				"warn",
				{ allowExpressions: true },
			],
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/prefer-nullish-coalescing": "error",
			"@typescript-eslint/prefer-optional-chain": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/strict-boolean-expressions": "warn",

			// 일반 규칙
			"no-console": ["warn", { allow: ["warn", "error"] }],
			eqeqeq: ["error", "always"],
			"prefer-const": "error",
			"no-var": "error",
		},
	},
	prettier,
);
