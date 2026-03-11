// SPDX-License-Identifier: Apache-2.0
import { config as configDotenv } from "dotenv";
import { NETWORKS, getNetworkConfig, getPrivateKeys } from "@hashgraph/asset-tokenization-contracts/scripts";

configDotenv();

export { NETWORKS };
export type Network = (typeof NETWORKS)[number];

export interface Endpoints {
  jsonRpc: string;
  mirror: string;
}

export default class Configuration {
  public static get contractSizerRunOnCompile(): boolean {
    return (process.env.CONTRACT_SIZER_RUN_ON_COMPILE ?? "true").toLowerCase() === "true";
  }

  public static get reportGas(): boolean {
    return (process.env.REPORT_GAS ?? "true").toLowerCase() === "true";
  }

  public static get privateKeys(): Record<Network, string[]> {
    return NETWORKS.reduce(
      (result, network) => {
        result[network] = getPrivateKeys(network);
        return result;
      },
      {} as Record<Network, string[]>,
    );
  }

  public static get endpoints(): Record<Network, Endpoints> {
    return NETWORKS.reduce(
      (result, network) => {
        const config = getNetworkConfig(network);
        result[network] = {
          jsonRpc: config.jsonRpcUrl,
          mirror: config.mirrorNodeUrl ?? "",
        };
        return result;
      },
      {} as Record<Network, Endpoints>,
    );
  }
}
