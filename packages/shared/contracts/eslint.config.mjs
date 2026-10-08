/**
 * ESLint configuration for Shared Contracts package
 * Extends root configuration
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import rootConfig from "../../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(...rootConfig);
