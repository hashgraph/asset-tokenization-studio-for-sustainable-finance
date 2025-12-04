module.exports = {
  skipFiles: ["KpiTimeTravel.sol", "facets/FactorySuiteFacetTimeTravel.sol", "mocks/", "interfaces/", "constants/"],
  // Configure Istanbul reporters to generate coverage-summary.json
  istanbulReporter: ["html", "json", "json-summary", "text", "lcov"],
};
