// SPDX-License-Identifier: Apache-2.0
import dotenv from 'dotenv'

// Load the `.env` file
dotenv.config()

const EMPTY_STRING = ''
export const NETWORKS = [
    'hardhat',
    'local',
    'previewnet',
    'testnet',
    'mainnet',
] as const
export type Network = (typeof NETWORKS)[number]
export const DEPLOY_TYPES = ['proxy', 'direct'] as const
export type DeployType = (typeof DEPLOY_TYPES)[number]

export interface Endpoints {
    jsonRpc: string
    mirror: string
}

export default class Configuration {
    // private _privateKeys: Record<Network, string[]>;
    // private _endpoints: Record<Network, Endpoints>;
    /**
     * Determines whether the contract sizer should run on compile.
     *
     * @returns {boolean} True if the contract sizer should run on compile, false otherwise.
     */
    public static get contractSizerRunOnCompile(): boolean {
        return (
            Configuration._getEnvironmentVariable({
                name: 'CONTRACT_SIZER_RUN_ON_COMPILE',
                defaultValue: 'true',
            }).toLowerCase() === 'true'
        )
    }

    /**
     * Determines whether gas reporting is enabled.
     *
     * @returns {boolean} True if gas reporting is enabled, false otherwise.
     */
    public static get reportGas(): boolean {
        return (
            Configuration._getEnvironmentVariable({
                name: 'REPORT_GAS',
                defaultValue: 'true',
            }).toLowerCase() === 'true'
        )
    }

    public static get privateKeys(): Record<Network, string[]> {
        return NETWORKS.reduce(
            (result, network) => {
                result[network] = Configuration._getEnvironmentVariableList({
                    name: `${network.toUpperCase()}_PRIVATE_KEY_#`,
                })
                return result
            },
            {} as Record<Network, string[]>
        )
    }

    public static get endpoints(): Record<Network, Endpoints> {
        return NETWORKS.reduce(
            (result, network) => {
                result[network] = {
                    jsonRpc: Configuration._getEnvironmentVariable({
                        name: `${network.toUpperCase()}_JSON_RPC_ENDPOINT`,
                        defaultValue:
                            network === 'local'
                                ? 'http://localhost:7546'
                                : `https://${network}.hash.io/api`,
                    }),
                    mirror: Configuration._getEnvironmentVariable({
                        name: `${network.toUpperCase()}_MIRROR_NODE_ENDPOINT`,
                        defaultValue:
                            network === 'local'
                                ? 'http://localhost:5551'
                                : `https://${network}.mirrornode.hedera.com`,
                    }),
                }
                return result
            },
            {} as Record<Network, Endpoints>
        )
    }

    public static get usdcAddress(): Record<Network, string> {
        return NETWORKS.reduce(
            (result, network) => {
                result[network] = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_USDC_ADDRESS`,
                    defaultValue: '',
                })
                return result
            },
            {} as Record<Network, string>
        )
    }

    private static _getEnvironmentVariableList({
        name,
        indexChar = '#',
    }: {
        name: string
        indexChar?: string
    }): string[] {
        const resultList: string[] = []
        let index = 0
        do {
            const env = Configuration._getEnvironmentVariable({
                name: name.replace(indexChar, `${index}`),
                defaultValue: EMPTY_STRING,
            })
            if (env !== EMPTY_STRING) {
                resultList.push(env)
            }
            index++
        } while (resultList.length === index)
        return resultList
    }

    private static _getEnvironmentVariable({
        name,
        defaultValue,
    }: {
        name: string
        defaultValue?: string
    }): string {
        const value = process.env?.[name]
        if (value) {
            return value
        }
        if (defaultValue !== undefined) {
            // console.warn(
            //     `🟠 Environment variable ${name} is not defined, Using default value: ${defaultValue}`
            // )
            return defaultValue
        }
        throw new Error(
            `Environment variable "${name}" is not defined. Please set the "${name}" environment variable.`
        )
    }
}
