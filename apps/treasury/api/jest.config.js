// SPDX-License-Identifier: Apache-2.0

const { getOptimalMaxWorkers } = require("@hashgraph/green-bonds-shared-testing")

module.exports = {
  preset: "../../../jest.base.config.js",
  maxWorkers: getOptimalMaxWorkers(),
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@port/(.*)$": "<rootDir>/src/port.adapter/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
  },
  globalSetup: "<rootDir>/jest.globalSetup.ts",
  globalTeardown: "<rootDir>/jest.globalTeardown.ts",
}
