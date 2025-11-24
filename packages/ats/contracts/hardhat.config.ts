import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "@primitivefi/hardhat-dodoc";
import "hardhat-dependency-compiler";
import "@tasks";

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
    target: "ethers-v5",
  },
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 30_000_000,
      hardfork: "cancun",
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
  },
  gasReporter: {
    enabled: false,
    showTimeSpent: true,
    outputFile: "gas-report.txt", // Force output to a file
    noColors: true, // Recommended for file output
  },
  mocha: {
    timeout: 3_000_000,
  },
  dodoc: {
    runOnCompile: false,
  },
  dependencyCompiler: {
    paths: [
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
    ],
  },
};

export default config;
