module.exports = {
  skipFiles: [
    "mocks", // Skip entire folder
  ],
  // Configure Istanbul reporters to generate coverage-summary.json
  istanbulReporter: ["html", "json", "json-summary", "text", "lcov"],
};
