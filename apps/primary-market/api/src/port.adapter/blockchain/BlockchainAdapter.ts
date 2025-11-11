// SPDX-License-Identifier: Apache-2.0

import { Singleton, Environment, ConverterUtils } from "@hashgraph/green-bonds-shared-core"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import { BlockchainAdapterPort } from "./BlockchainAdapterPort"
import { OfferingStatus } from "@domain/offering/model/OfferingStatus"

@Singleton()
export class BlockchainAdapter implements BlockchainAdapterPort {
  private readonly DEFAULT_ENVIRONMENT: Environment = "testnet"

  constructor(private readonly configService: ConfigService) {}

  async getOfferingStatus(contractId: string, offeringDltId: string): Promise<OfferingStatus> {
    const environment = this.getEnvironment()
    const evmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(contractId)

    const status = await this.getOfferingStatusFromContract(evmAddress, offeringDltId, environment)

    return status
  }

  private getEnvironment(): Environment {
    return this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || this.DEFAULT_ENVIRONMENT
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getOfferingStatusFromContract(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    offeringDltId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment: Environment,
  ): Promise<OfferingStatus> {
    // TODO: Replace with actual factory when available
    // const numericStatus = await IPrimaryMarket__factory.connect(contractAddress, getEthereumProvider(environment)).getOfferingStatus(
    //   offeringDltId,
    // )
    // return numericStatusToOfferingStatus(numericStatus)

    return OfferingStatus.OPEN
  }
}
