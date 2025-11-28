/**
 * ESLint configuration for Shared Transaction Sender
 * Extends root configuration with NestJS and Jest-specific settings
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import rootConfig from "../../../eslint.config.mjs";
import globals from "globals";
import tseslint from "typescript-eslint";
import jest from "eslint-plugin-jest";

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

  // Jest plugin for test files
  {
    files: ["test/**"],
    plugins: {
      jest,
    },
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "jest/unbound-method": "error",
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
      "max-len": [
        "error",
        {
          code: 120,
          ignorePattern: "^import .*",
        },
      ],
    },
  },
);
