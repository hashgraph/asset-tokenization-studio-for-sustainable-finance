// SPDX-License-Identifier: Apache-2.0

import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  ConverterUtils,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildCreateOfferingTransactionRequest } from "./model/BuildCreateOfferingTransactionRequest"
import { BuildSubmitSubscriptionTransactionRequest } from "./model/BuildSubmitSubscriptionTransactionRequest"
import { BuildExecuteOfferingTransactionRequest } from "./model/BuildExecuteOfferingTransactionRequest"
import { BuildCancelOfferingTransactionRequest } from "./model/BuildCancelOfferingTransactionRequest"
import { BuildCancelSubscriptionTransactionRequest } from "./model/BuildCancelSubscriptionTransactionRequest"
import { BuildDeployPrimaryMarketTransactionRequest } from "./model/BuildDeployPrimaryMarketTransactionRequest"
import { BuildExecuteOfferingBySubscriptionIdTransactionRequest } from "./model/BuildExecuteOfferingBySubscriptionIdTransactionRequest"
import { BuildCancelOfferingBySubscriptionIdTransactionRequest } from "./model/BuildCancelOfferingBySubscriptionIdTransactionRequest"
import {
  IPrimaryMarket__factory,
  IFactoryPrimaryMarket__factory,
} from "@hashgraph/green-bonds-platform-primarymarket-contracts"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly OFFERING_CREATION_GAS = 2_500_000
  private readonly SUBSCRIPTION_SUBMIT_GAS = 700_000
  private readonly SUBSCRIPTION_CANCEL_GAS = 700_000
  private readonly EXECUTE_OFFERING_GAS = 700_000
  private readonly CANCEL_OFFERING_GAS = 700_000
  private readonly DEPLOY_PRIMARY_MARKET_GAS = 700_000

  private readonly DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
  private readonly DEFAULT_PRIMARY_MARKET_CONFIG_ID =
    "0x0000000000000000000000000000000000000000000000000000000000002711"

  constructor() {
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

  async submitSubscription(request: BuildSubmitSubscriptionTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "submitSubscription",
      contractId: request.contractId,
      gas: this.SUBSCRIPTION_SUBMIT_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.offeringId, request.lotUnits],
    })
  }

  async cancelSubscription(request: BuildCancelSubscriptionTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "cancelSubscription",
      contractId: request.contractId,
      gas: this.SUBSCRIPTION_CANCEL_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.offeringId, request.subscriptionId],
    })
  }

  async executeOffering(request: BuildExecuteOfferingTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "executeOffering",
      contractId: request.contractId,
      gas: this.EXECUTE_OFFERING_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.offeringId, request.start, request.end],
    })
  }

  async cancelOffering(request: BuildCancelOfferingTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "cancelOffering",
      contractId: request.contractId,
      gas: this.CANCEL_OFFERING_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.offeringId, request.start, request.end],
    })
  }

  async executeOfferingBySubscriptionIds(
    request: BuildExecuteOfferingBySubscriptionIdTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "executeOfferingBySubscriptionId",
      contractId: request.contractId,
      gas: this.EXECUTE_OFFERING_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.offeringId, request.subscriptionIds],
    })
  }

  async cancelOfferingBySubscriptionIds(
    request: BuildCancelOfferingBySubscriptionIdTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildTransaction({
      functionName: "cancelOfferingBySubscriptionId",
      contractId: request.contractId,
      gas: this.CANCEL_OFFERING_GAS,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [request.offeringId, request.subscriptionIds],
    })
  }

  async deployPrimaryMarket(request: BuildDeployPrimaryMarketTransactionRequest): Promise<BuildTransactionResponse> {
    const resolverAddress = await ConverterUtils.getEvmAddressFromHederaAddress(request.resolverContractId)
    const ownerAddress = await ConverterUtils.getEvmAddressFromHederaAddress(request.accountId!)

    const resolverProxyConfiguration = {
      key: this.DEFAULT_PRIMARY_MARKET_CONFIG_ID,
      version: request.configVersion.toString(),
    }

    const rbacs = [
      {
        role: this.DEFAULT_ADMIN_ROLE,
        members: [ownerAddress],
      },
    ]

    const contractInterface = IFactoryPrimaryMarket__factory.createInterface()

    const environment = this.getEnvironment()

    const transactionResponse = await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "deployPrimaryMarket",
      contractId: request.contractId,
      gas: this.DEPLOY_PRIMARY_MARKET_GAS,
      environment,
      account: request.accountId!,
      format: request.format as "hedera" | "ethereum",
      args: [resolverAddress, resolverProxyConfiguration, rbacs],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  private getPrimaryMarketInterface() {
    return IPrimaryMarket__factory.createInterface()
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
      targetQuantityRule: request.targetQuantityRule,
      deadlineRule: request.deadlineRule,
      priceDecimals: request.priceDecimals,
      treasury: await ConverterUtils.getEvmAddressFromHederaAddress(request.treasuryContractId),
      paymentToken: await ConverterUtils.getEvmAddressFromHederaAddress(request.paymentTokenContractId),
      lotSize: request.lotSize,
      minLots: request.minLots,
      maxLots: request.maxLots,
      targetLots: request.targetLots,
      startDate: request.startDate,
      endDate: request.endDate,
      price: request.price,
    }
  }
}
