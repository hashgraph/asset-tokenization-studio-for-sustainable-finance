/**
 * ESLint configuration for ATS API
 * Extends root configuration with NestJS-specific settings
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import rootConfig from "../../../eslint.config.mjs";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...rootConfig,

  // NestJS/Jest-specific overrides
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
      sourceType: "commonjs",
    },
  },

  // Relax strict type-checking rules for NestJS backend
  {
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);