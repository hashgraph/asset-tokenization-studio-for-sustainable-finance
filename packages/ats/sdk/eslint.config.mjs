/**
 * ESLint configuration for ATS SDK package
 * Extends root configuration with Jest-specific overrides
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import rootConfig from "../../../eslint.config.mjs";
import globals from "globals";

export default [
  ...rootConfig,

  // Jest test files - add test globals and relax rules
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "__tests__/**/*.ts", "**/__tests__/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest, // describe, it, test, expect, jest, beforeAll, etc.
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off", // Tests don't need explicit return types
    },
  },
];