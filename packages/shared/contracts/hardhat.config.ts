import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import Configuration from "@configuration";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
    tests: "./test",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 30_000_000,
      hardfork: "cancun",
      allowUnlimitedContractSize: true,
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
  mocha: {
    timeout: 60_000,
    require: ["./test/helpers/register-tsx.cjs", "./test/helpers/globalSetup.cjs"],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: Configuration.contractSizerRunOnCompile,
  },
};

export default config;
