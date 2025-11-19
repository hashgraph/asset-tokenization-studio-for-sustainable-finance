const fs = require("fs");
const path = require("path");
const facetsDir = path.join(__dirname, "contracts/facets");

module.exports = {
  skipFiles: [
    "mocks", // Skip entire folder
  ],
};
