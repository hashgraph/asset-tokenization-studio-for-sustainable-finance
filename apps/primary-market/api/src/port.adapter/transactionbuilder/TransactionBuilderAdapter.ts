// SPDX-License-Identifier: Apache-2.0

import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  ConverterUtils,
  Environment,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildCreateOfferingTransactionRequest } from "./model/BuildCreateOfferingTransactionRequest"
import { BuildGrantRoleTransactionRequest } from "./model/BuildGrantRoleTransactionRequest"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import { BuildSubmitSubscriptionTransactionRequest } from "./model/BuildSubmitSubscriptionTransactionRequest"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly OFFERING_CREATION_GAS = 5_000_000
  private readonly SUBSCRIPTION_SUBMIT_GAS = 700_000
  private readonly GRANT_ROLE_GAS = 700_000
  private readonly DEFAULT_ENVIRONMENT = "testnet" as const

  constructor(private readonly configService: ConfigService) {
    super()
  }

  async createOffering(request: BuildCreateOfferingTransactionRequest): Promise<BuildTransactionResponse> {
    const offering = await this.buildOfferingParams(request)

    return await this.buildTransaction({
      functionName: "createOffering",
      contractId: request.contractId,
      gas: this.OFFERING_CREATION_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [offering],
    })
  }

  async grantRole(request: BuildGrantRoleTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "grantRole",
      contractId: request.contractId,
      gas: this.GRANT_ROLE_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.role, await ConverterUtils.getEvmAddressFromHederaAddress(request.userAccountId)],
    })
  }

  private getEnvironment(): Environment {
    return this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || this.DEFAULT_ENVIRONMENT
  }

  private getPrimaryMarketInterface() {
    // TODO: Replace with actual factory when available
    // return IPrimaryMarket__factory.createInterface()
    // Temporary mock - replace with actual interface
    return {
      encodeFunctionData: () => {
        return "0xmockTransactionData"
      },
    } as any
  }

  private async buildTransaction(params: {
    functionName: string
    contractId: string
    gas: number
    account: string
    format: "hedera" | "ethereum"
    args: any[]
  }): Promise<BuildTransactionResponse> {
    const environment = this.getEnvironment()
    const contractInterface = this.getPrimaryMarketInterface()

    const transactionResponse = await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: params.functionName as any,
      contractId: params.contractId,
      gas: params.gas,
      environment,
      account: params.account,
      format: params.format,
      args: params.args,
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  private async buildOfferingParams(request: BuildCreateOfferingTransactionRequest) {
    return {
      asset: await ConverterUtils.getEvmAddressFromHederaAddress(request.bondContractId),
      treasury: request.treasuryAddress,
      paymentToken: request.paymentTokenAddress,
      lotSize: request.lotSize,
      minQuantity: request.minQuantity,
      maxQuantity: request.maxQuantity,
      targetQuantity: request.targetQuantity,
      targetQuantityRule: request.targetQuantityRule,
      startDate: parseInt(request.startDate).toString(),
      endDate: parseInt(request.endDate).toString(),
      deadlineRule: request.deadlineRule,
    }
  }
}
