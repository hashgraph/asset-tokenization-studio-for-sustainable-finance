// Hardhat configuration for Green Bonds Platform shared contracts
// This package primarily uses standalone deployment (ethers.js directly)
// This config enables local Hardhat network deployment for development/testing
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: "auto",
      gasPrice: "auto",
      // Hardhat network runs in-process by default
      // Use 'npx hardhat node' to run standalone node
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};
