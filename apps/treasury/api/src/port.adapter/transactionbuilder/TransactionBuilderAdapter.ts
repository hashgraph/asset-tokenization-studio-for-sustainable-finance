// SPDX-License-Identifier: Apache-2.0

import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  ConverterUtils,
  Environment,
  Singleton,
  getEthereumProvider,
  PageResponse,
} from "@hashgraph/green-bonds-shared-core"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BuildAddEnvironmentalAssetTransactionRequest } from "./model/BuildAddEnvironmentalAssetTransactionRequest"
import { BuildRemoveEnvironmentalAssetTransactionRequest } from "./model/BuildRemoveEnvironmentalAssetTransactionRequest"
import { BuildTransferEnvironmentalAssetTransactionRequest } from "./model/BuildTransferEnvironmentalAssetTransactionRequest"
import { BuildTransferPaymentTokenTransactionRequest } from "./model/BuildTransferPaymentTokenTransactionRequest"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import {
  IPortfolio__factory,
  IProceedsManagement__factory,
  IBondRead__factory,
  ILifeCycleCashFlow__factory,
  ISecurity__factory,
} from "@hashgraph/green-bonds-platform-treasury-contracts"
import { BuildExternalTransferPaymentTokenTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferPaymentTokenTransactionRequest"
import { BuildUpdatePaymentTokenTransactionRequest } from "./model/BuildUpdatePaymentTokenTransactionRequest"
import { TransferTransaction } from "@hiero-ledger/sdk"
import { utils } from "ethers"
import { BuildExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferEnvironmentalAssetTransactionRequest"
import { BuildExecuteDistributionTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteDistributionTransactionRequest"
import { BuildExecuteDistributionByAddressesTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteDistributionByAddressesTransactionRequest"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { BuildDissociateTokenTransactionRequest } from "./model/BuildDissociateTokenTransactionRequest"
import { BuildExecuteRedemptionTransactionRequest } from "./model/BuildExecuteRedemptionTransactionRequest"
import { BuildExecuteBondRedemptionByAddressesTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteBondRedemptionByAddressesTransactionRequest"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  constructor(private readonly configService: ConfigService) {
    super()
  }

  async fundProceedsRecipient(
    request: BuildFundProceedsRecipientTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IProceedsManagement__factory.createInterface(),
      functionName: "fundProceedsRecipient" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.address), request.amount],
    } as any)
  }

  async addEnvironmentalAsset(
    request: BuildAddEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildEnvironmentalAssetTransaction(request, "addEnvironmentalAssetToken")
  }

  async removeEnvironmentalAsset(
    request: BuildRemoveEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildEnvironmentalAssetTransaction(request, "removeEnvironmentalAssetToken")
  }

  async transferEnvironmentalAsset(
    request: BuildTransferEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IProceedsManagement__factory.createInterface(),
      functionName: "transferEnvironmentalAssetToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [
        await ConverterUtils.getEvmAddressFromHederaAddress(request.assetContractId),
        await ConverterUtils.getEvmAddressFromHederaAddress(request.to),
        request.tokenId,
      ],
    } as any)
  }

  async externalTransferPaymentToken(
    request: BuildExternalTransferPaymentTokenTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    if (request.format === "ethereum") {
      const contractInterface = new utils.Interface(["function transfer(address to, uint256 value)"])
      return await this.buildAndSerializeTransaction({
        contractInterface,
        functionName: "transfer" as any,
        contractId: request.contractId,
        gas: this.GAS,
        environment: this.getEnvironment(),
        account: request.accountId,
        format: request.format as "ethereum",
        args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.treasuryContractId), request.amount],
      } as any)
    }
    const transaction = new TransferTransaction()
      .addTokenTransfer(request.contractId, request.accountId, BigInt(`-${request.amount}`))
      .addTokenTransfer(request.contractId, request.treasuryContractId, BigInt(request.amount))

    return this.serializeHederaTransaction(transaction, this.getEnvironment(), request.accountId)
  }

  async externalTransferEnvironmentalAsset(
    request: BuildExternalTransferEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    if (request.format === "ethereum") {
      const contractInterface = new utils.Interface([
        "function transferFrom(address from, address to, uint256 tokenId)",
      ])
      return await this.buildAndSerializeTransaction({
        contractInterface,
        functionName: "transferFrom" as any,
        contractId: request.contractId,
        gas: this.GAS,
        environment: this.getEnvironment(),
        account: request.accountId,
        format: request.format as "ethereum",
        args: [
          await ConverterUtils.getEvmAddressFromHederaAddress(request.accountId),
          await ConverterUtils.getEvmAddressFromHederaAddress(request.treasuryContractId),
          request.tokenId,
        ],
      } as any)
    }
    const transaction = new TransferTransaction().addNftTransfer(
      request.contractId,
      request.tokenId,
      request.accountId,
      request.treasuryContractId,
    )

    return this.serializeHederaTransaction(transaction, this.getEnvironment(), request.accountId)
  }

  async updatePaymentToken(request: BuildUpdatePaymentTokenTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IPortfolio__factory.createInterface(),
      functionName: "updatePaymentToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.paymentTokenContractId)],
    } as any)
  }

  async transferPaymentToken(request: BuildTransferPaymentTokenTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IProceedsManagement__factory.createInterface(),
      functionName: "transferPaymentToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.to), request.amount],
    } as any)
  }

  private async buildEnvironmentalAssetTransaction(
    request: BuildAddEnvironmentalAssetTransactionRequest | BuildRemoveEnvironmentalAssetTransactionRequest,
    functionName: "addEnvironmentalAssetToken" | "removeEnvironmentalAssetToken",
  ): Promise<BuildTransactionResponse> {
    const transactionResponse = await this.buildAndSerializeTransaction({
      contractInterface: IPortfolio__factory.createInterface(),
      functionName: functionName as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.assetContractId)],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  async executeDistribution(request: BuildExecuteDistributionTransactionRequest): Promise<PageResponse<string>> {
    const environment = this.getEnvironment()

    const maxBatchSize = request.maxBatchSize || this.configService.get<number>(ConfigKeys.MAX_BATCH_SIZE) || 15
    const bondAddress = await ConverterUtils.getEvmAddressFromHederaAddress(request.bondContractId)
    const totalCouponHolders = await this.getTotalCouponHolders(bondAddress, request.distributionId, environment)
    const numberOfBatches = Math.ceil(totalCouponHolders / maxBatchSize)
    const transactions: string[] = []

    let batchPageIndex = request.pageOptions.getFirstBatchPageIndex()
    const lastBatchPageIndex = request.pageOptions.getLastBatchPageIndex(numberOfBatches)
    for (batchPageIndex; batchPageIndex <= lastBatchPageIndex; batchPageIndex++) {
      transactions.push(
        (
          await this.buildAndSerializeTransaction({
            contractInterface: ILifeCycleCashFlow__factory.createInterface(),
            functionName: "executeDistribution" as any,
            contractId: request.contractId,
            gas: this.GAS,
            environment,
            account: request.accountId,
            format: request.format as "hedera" | "ethereum",
            args: [bondAddress, request.distributionId, batchPageIndex, maxBatchSize],
          } as any)
        ).unsignedTx,
      )
    }

    return {
      items: transactions,
      total: numberOfBatches,
      page: request.pageOptions.page,
      limit: request.pageOptions.limit,
      totalPages: Math.ceil(numberOfBatches / request.pageOptions.limit),
    }
  }

  async executeRedemption(request: BuildExecuteRedemptionTransactionRequest): Promise<PageResponse<string>> {
    const environment = this.getEnvironment()

    const maxBatchSize = request.maxBatchSize || this.configService.get<number>(ConfigKeys.MAX_BATCH_SIZE) || 15
    const bondAddress = await ConverterUtils.getEvmAddressFromHederaAddress(request.bondContractId)
    const totalBondHolders = await this.getTotalBondHolders(bondAddress, environment)
    const numberOfBatches = Math.ceil(totalBondHolders / maxBatchSize)
    const transactions: string[] = []

    let batchPageIndex = request.pageOptions.getFirstBatchPageIndex()
    const lastBatchPageIndex = request.pageOptions.getLastBatchPageIndex(numberOfBatches)
    for (batchPageIndex; batchPageIndex <= lastBatchPageIndex; batchPageIndex++) {
      transactions.push(
        (
          await this.buildAndSerializeTransaction({
            contractInterface: ILifeCycleCashFlow__factory.createInterface(),
            functionName: "executeBondRedemption" as any,
            contractId: request.contractId,
            gas: this.GAS,
            environment,
            account: request.accountId,
            format: request.format as "hedera" | "ethereum",
            args: [bondAddress, batchPageIndex, maxBatchSize],
          } as any)
        ).unsignedTx,
      )
    }

    return {
      items: transactions,
      total: numberOfBatches,
      page: request.pageOptions.page,
      limit: request.pageOptions.limit,
      totalPages: Math.ceil(numberOfBatches / request.pageOptions.limit),
    }
  }

  async executeDistributionByAddresses(
    request: BuildExecuteDistributionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse> {
    const maxBatchSize = request.maxBatchSize || this.configService.get<number>(ConfigKeys.MAX_BATCH_SIZE) || 15
    const bondAddress = await ConverterUtils.getEvmAddressFromHederaAddress(request.bondContractId)
    const batches = Array.from({ length: Math.ceil(request.holdersAccountIds.length / maxBatchSize) }, (_, i) =>
      request.holdersAccountIds.slice(i * maxBatchSize, i * maxBatchSize + maxBatchSize),
    )
    const transactions = await Promise.all(
      batches.map(async (batch) => {
        return (
          await this.buildAndSerializeTransaction({
            contractInterface: ILifeCycleCashFlow__factory.createInterface(),
            functionName: "executeDistributionByAddresses" as any,
            contractId: request.contractId,
            gas: this.GAS,
            environment: this.getEnvironment(),
            account: request.accountId,
            format: request.format as "hedera" | "ethereum",
            args: [
              bondAddress,
              request.distributionId,
              await Promise.all(batch.map((accountId) => ConverterUtils.getEvmAddressFromHederaAddress(accountId))),
            ],
          } as any)
        ).unsignedTx
      }),
    )
    return {
      items: transactions,
    }
  }

  async executeBondRedemptionByAddresses(
    request: BuildExecuteBondRedemptionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse> {
    const maxBatchSize = request.maxBatchSize || this.configService.get<number>(ConfigKeys.MAX_BATCH_SIZE) || 15
    const bondAddress = await ConverterUtils.getEvmAddressFromHederaAddress(request.bondContractId)
    const batches = Array.from({ length: Math.ceil((request.holdersAccountIds || []).length / maxBatchSize) }, (_, i) =>
      (request.holdersAccountIds || []).slice(i * maxBatchSize, i * maxBatchSize + maxBatchSize),
    )
    const transactions = await Promise.all(
      batches.map(async (batch) => {
        return (
          await this.buildAndSerializeTransaction({
            contractInterface: ILifeCycleCashFlow__factory.createInterface(),
            functionName: "executeBondRedemptionByAddresses" as any,
            contractId: request.contractId,
            gas: this.GAS,
            environment: this.getEnvironment(),
            account: request.accountId,
            format: request.format as "hedera" | "ethereum",
            args: [
              bondAddress,
              await Promise.all(batch.map((accountId) => ConverterUtils.getEvmAddressFromHederaAddress(accountId))),
            ],
          } as any)
        ).unsignedTx
      }),
    )
    return {
      items: transactions,
    }
  }

  async dissociateToken(request: BuildDissociateTokenTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IPortfolio__factory.createInterface(),
      functionName: "dissociateToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.tokenContractId)],
    } as any)
  }

  private async getTotalCouponHolders(
    bondAddress: string,
    distributionId: number,
    environment: Environment,
  ): Promise<number> {
    return (
      await IBondRead__factory.connect(bondAddress, getEthereumProvider(environment)).getTotalCouponHolders(
        distributionId,
      )
    ).toNumber()
  }

  private async getTotalBondHolders(bondAddress: string, environment: Environment): Promise<number> {
    return (
      await ISecurity__factory.connect(bondAddress, getEthereumProvider(environment)).getTotalSecurityHolders()
    ).toNumber()
  }
}
