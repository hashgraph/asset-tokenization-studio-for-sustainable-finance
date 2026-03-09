import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
// import "@nomicfoundation/hardhat-toolbox"; // Temporarily disabled due to ESM resolution issues
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@primitivefi/hardhat-dodoc";
import "@tasks";
import Configuration from "@configuration";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
          evmVersion: "cancun",
        },
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  },
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
  },
  gasReporter: {
    enabled: Configuration.reportGas,
    showTimeSpent: true,
    outputFile: "gas-report.txt", // Force output to a file
    noColors: true, // Recommended for file output
  },
  mocha: {
    timeout: 60_000, // 60 seconds per test (reduced from 50 min)
    require: ["./test/helpers/register-tsx.cjs", "./test/helpers/globalSetup.cjs"],
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
