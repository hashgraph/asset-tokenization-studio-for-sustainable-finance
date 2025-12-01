module.exports = {
  testTimeout: 30000,
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "coverage",
  coverageReporters: [
    "json-summary", // Required for CI coverage threshold checks
    "lcov", // Required for Codecov uploads
    "text", // Human-readable console output
    "html", // HTML reports for local development
  ],
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!(p-retry|retry|is-network-error)/)"],
};
