const fs = require("fs");
const path = require("path");
const facetsDir = path.join(__dirname, "contracts/facets");

const timeTravelFiles = fs
  .readdirSync(facetsDir)
  .filter((f) => f.endsWith("TimeTravel.sol"))
  .map((f) => `facets/${f}`);

module.exports = {
  skipFiles: [
    "mocks", // Skip entire folder
    ...timeTravelFiles,
  ],
  // Configure Istanbul reporters to generate coverage-summary.json
  istanbulReporter: ["html", "json", "json-summary", "text", "lcov"],
};
