/**
 * Solhint configuration for ATS Contracts package
 * Extends root configuration with package-specific overrides
 * @see https://protofire.github.io/solhint/docs/rules.html
 */

const rootConfig = require("../../../solhint.config.js");

module.exports = {
  ...rootConfig,
  plugins: ["prettier"],
  rules: {
    ...rootConfig.rules,
    // Add prettier integration for Solidity formatting
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    // Package-specific rules
    "contract-name-camelcase": "error",
    "event-name-camelcase": "error",
  },
};
