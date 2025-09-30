/**
 * Root ESLint configuration for Green Bonds Platform monorepo
 * Generic TypeScript configuration - packages can import and extend this
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

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

  // Default configuration for all JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        projectService: true, // Modern TypeScript-ESLint v8 - zero config for monorepos
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier,
      "unused-imports": unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
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
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
];

export default rootConfig;
