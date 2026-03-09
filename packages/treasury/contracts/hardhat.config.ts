// SPDX-License-Identifier: Apache-2.0

import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
// import "@nomicfoundation/hardhat-toolbox"; // Temporarily disabled due to ESM resolution issues
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "@primitivefi/hardhat-dodoc";
import "solidity-coverage";
import Configuration from "@configuration";
import "hardhat-dependency-compiler";
import "@tasks";

import "hardhat/types/config";

declare module "hardhat/types/config" {
  interface HardhatNetworkUserConfig {
    usdcAddress?: string;
  }
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test/unit",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 30_000_000,
      hardfork: "cancun",
    },
    local: {
      url: Configuration.endpoints.local.jsonRpc,
      accounts: Configuration.privateKeys.local,
      timeout: 60_000,
    },
    "hedera-local": {
      url: Configuration.endpoints["hedera-local"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-local"],
      chainId: 298,
      timeout: 60_000,
    },
    "hedera-previewnet": {
      url: Configuration.endpoints["hedera-previewnet"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-previewnet"],
      timeout: 120_000,
    },
    "hedera-testnet": {
      url: Configuration.endpoints["hedera-testnet"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-testnet"],
      timeout: 120_000,
    },
    "hedera-mainnet": {
      url: Configuration.endpoints["hedera-mainnet"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-mainnet"],
      timeout: 120_000,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: Configuration.contractSizerRunOnCompile,
    strict: true,
  },
  gasReporter: {
    enabled: Configuration.reportGas,
    showTimeSpent: true,
    outputFile: "gas-report.txt", // Force output to a file
    noColors: true, // Recommended for file output
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 60_000, // 60 seconds per test (reduced from 50 min)
    require: ["./test/helpers/register-tsx.cjs", "./test/helpers/globalSetup.cjs"],
  },
  dependencyCompiler: {
    paths: [
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
    ],
  },
  dodoc: {
    runOnCompile: false,
    outputDir: "./docs",
    freshOutput: true,
    include: ["contracts"],
    exclude: ["mocks"],
  },
};

export default config;
