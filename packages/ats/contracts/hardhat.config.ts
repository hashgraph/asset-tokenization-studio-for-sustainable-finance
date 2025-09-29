import { HardhatUserConfig } from 'hardhat/config'
import 'tsconfig-paths'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-dependency-compiler'

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.18',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100,
                    },
                    evmVersion: 'london',
                },
            },
        ],
        settings: {
            optimizer: {
                enabled: true,
                runs: 1,
            },
            evmVersion: 'london',
        },
    },
    paths: {
        sources: './contracts',
        cache: './cache',
        artifacts: './artifacts',
    },
    defaultNetwork: 'hardhat',
    typechain: {
        outDir: './typechain-types',
        target: 'ethers-v5',
    },
    networks: {
        hardhat: {
            chainId: 1337,
            blockGasLimit: 30_000_000,
            hardfork: 'london',
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
        outputFile: 'gas-report.txt', // Force output to a file
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
            '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol',
            '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol',
        ],
    },
}

export default config
