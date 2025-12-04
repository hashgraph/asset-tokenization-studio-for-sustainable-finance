/**
 * Root ESLint configuration for Green Bonds Platform monorepo
 * Exports plain array - packages wrap with tseslint.config()
 * Uses `recommended` baseline (not recommendedTypeChecked) for broad compatibility
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('typescript-eslint').Config} */
const rootConfig = [
  // Base configuration - ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/out/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/typechain-types/**",
      "**/artifacts/**",
      "**/cache/**",
      "**/Smart Contracts Audit Report.pdf",
      "**/*.sol-coverage",
      "**/gas-report.txt",
      "**/.env*",
      "**/*.pdf",
      "**/docs/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/fixtures/**",
      "**/__mocks__/**",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "**/commitlint.config.ts",
      "**/jest.config.js",
      "**/hardhat.config.ts",
      "**/*.js",
      "**/*d.ts",
      "**/tmp/**",
      "**/example/**",
      "**/src_old/**",
      "**/.temp/**",
      "**/package.json",
      // TODO: REMOVE mass-payout ignore lines
      //  Temporally ignore mass-payout related files
      "**/mass-payout/**",
      "apps/mass-payout/**",
      "packages/mass-payout/**",
    ],
  },

  // Base recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  // Language options and globals
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        projectService: true, // Modern TypeScript-ESLint v8 - zero config for monorepos
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },

  // Additional plugins
  {
    plugins: {
      "unused-imports": unusedImports,
    },
  },

  // Custom rule overrides
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Test files - relax rules for Chai/Mocha assertions
  {
    files: ["**/test/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off", // Chai assertions use property expressions
    },
  },
];

export default rootConfig;
