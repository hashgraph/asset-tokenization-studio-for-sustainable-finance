// SPDX-License-Identifier: Apache-2.0

/**
 * ESLint configuration for Shared Core
 * Extends root configuration with library-specific settings
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import rootConfig from "../../../eslint.config.mjs";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...rootConfig,

  // Library-specific overrides
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
      sourceType: "commonjs",
    },
  },

  // Relax strict type-checking rules (warn on floating promises)
  {
    rules: {
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);
