// SPDX-License-Identifier: Apache-2.0

import { Singleton, Environment, ConverterUtils, getEthereumProvider } from "@hashgraph/green-bonds-shared-core"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import { BlockchainAdapterPort } from "./BlockchainAdapterPort"
import { numericStatusToOfferingStatus, OfferingStatus } from "@domain/offering/model/OfferingStatus"
import { IPrimaryMarket__factory } from "@hashgraph/green-bonds-platform-primarymarket-contracts"

@Singleton()
export class BlockchainAdapter implements BlockchainAdapterPort {
  private readonly DEFAULT_ENVIRONMENT: Environment = "testnet"

  constructor(private readonly configService: ConfigService) {}

  async getOfferingStatus(contractId: string, offeringId: number): Promise<OfferingStatus> {
    const environment = this.getEnvironment()
    const evmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(contractId)

    const status = await this.getOfferingStatusFromContract(evmAddress, offeringId, environment)

    return status
  }

  private getEnvironment(): Environment {
    return this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || this.DEFAULT_ENVIRONMENT
  }

  private async getOfferingStatusFromContract(
    contractAddress: string,
    offeringId: number,
    environment: Environment,
  ): Promise<OfferingStatus> {
    const numericStatus = await IPrimaryMarket__factory.connect(
      contractAddress,
      getEthereumProvider(environment),
    ).getOfferingStatus(offeringId)
    return numericStatusToOfferingStatus(Number(numericStatus))
  }
}
