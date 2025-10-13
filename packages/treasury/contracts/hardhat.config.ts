// SPDX-License-Identifier: Apache-2.0

import { HardhatUserConfig } from 'hardhat/config'
import 'tsconfig-paths/register'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-chai-matchers'
import '@typechain/hardhat'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import Configuration from '@configuration'

import 'hardhat/types/config'

declare module 'hardhat/types/config' {
  interface HardhatNetworkUserConfig {
    usdcAddress?: string;
  }
}

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
            },
            evmVersion: 'london',
        },
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
    defaultNetwork: 'testnet',
    networks: {
        hardhat: {
            accounts: {
              count: 2,
              accountsBalance: "1000000000000000000000000", // 1,000,000 ETH per account
            },
            chainId: 1337,
            blockGasLimit: 2000000000000,
            hardfork: 'london',
            forking: {
              url: Configuration.endpoints.testnet.jsonRpc
            },
        },
        local: {
            url: Configuration.endpoints.local.jsonRpc,
            accounts: Configuration.privateKeys.local,
            timeout: 60_000,
        },
        previewnet: {
            url: Configuration.endpoints.previewnet.jsonRpc,
            accounts: Configuration.privateKeys.previewnet,
            timeout: 120_000,
        },
        testnet: {
            url: Configuration.endpoints.testnet.jsonRpc,
            accounts: Configuration.privateKeys.testnet,
            usdcAddress: Configuration.usdcAddress.testnet,
            timeout: 120_000,
        },
        mainnet: {
            url: Configuration.endpoints.mainnet.jsonRpc,
            accounts: Configuration.privateKeys.mainnet,
            timeout: 120_000,
        },
    },
    coverage: {
      skipFiles: [
        "test/",
        "interfaces/",
        "facets/"
      ],
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
        outputFile: 'gas-report.txt', // Force output to a file
        noColors: true, // Recommended for file output
    },
    typechain: {
        outDir: './typechain-types',
        target: 'ethers-v5',
    },
    mocha: {
        timeout: 3_000_000,
    },
}

export default config
