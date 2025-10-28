// SPDX-License-Identifier: Apache-2.0

import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  ConverterUtils,
  Environment,
  Singleton,
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
  IPause__factory,
  IPortfolio__factory,
  IProceedsManagement__factory,
} from "@hashgraph/green-bonds-platform-treasury-contracts"
import { BuildExternalTransferPaymentTokenTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferPaymentTokenTransactionRequest"
import { BuildUpdatePaymentTokenTransactionRequest } from "./model/BuildUpdatePaymentTokenTransactionRequest"
import { TransferTransaction } from "@hashgraph/sdk"
import { utils } from "ethers"
import { BuildExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferEnvironmentalAssetTransactionRequest"
import { BuildPauseTreasuryTransactionRequest } from "./model/BuildPauseTreasuryTransactionRequest"
import { BuildUnpauseTreasuryTransactionRequest } from "./model/BuildUnpauseTreasuryTransactionRequest"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 15_000_000

  constructor(private readonly configService: ConfigService) {
    super()
  }

  async fundProceedsRecipient(
    request: BuildFundProceedsRecipientTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    const contractInterface = IProceedsManagement__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    return await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "fundProceedsRecipient" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
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
    const contractInterface = IProceedsManagement__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    return await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "transferEnvironmentalAssetToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
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
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"
    if (request.format === "ethereum") {
      const contractInterface = new utils.Interface(["function transfer(address to, uint256 value)"])
      return await this.buildAndSerializeTransaction({
        contractInterface,
        functionName: "transfer" as any,
        contractId: request.contractId,
        gas: this.GAS,
        environment,
        account: request.accountId,
        format: request.format as "ethereum",
        args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.treasuryContractId), request.amount],
      } as any)
    }
    const transaction = new TransferTransaction()
      .addTokenTransfer(request.contractId, request.accountId, BigInt(`-${request.amount}`))
      .addTokenTransfer(request.contractId, request.treasuryContractId, BigInt(request.amount))

    return this.serializeHederaTransaction(transaction, environment, request.accountId)
  }

  async externalTransferEnvironmentalAsset(
    request: BuildExternalTransferEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"
    if (request.format === "ethereum") {
      const contractInterface = new utils.Interface([
        "function transferFrom(address from, address to, uint256 tokenId)",
      ])
      return await this.buildAndSerializeTransaction({
        contractInterface,
        functionName: "transferFrom" as any,
        contractId: request.contractId,
        gas: this.GAS,
        environment,
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

    return this.serializeHederaTransaction(transaction, environment, request.accountId)
  }

  async updatePaymentToken(request: BuildUpdatePaymentTokenTransactionRequest): Promise<BuildTransactionResponse> {
    const iPortfolioInterface = IPortfolio__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    return await this.buildAndSerializeTransaction({
      contractInterface: iPortfolioInterface,
      functionName: "updatePaymentToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.paymentTokenContractId)],
    } as any)
  }

  async transferPaymentToken(request: BuildTransferPaymentTokenTransactionRequest): Promise<BuildTransactionResponse> {
    const contractInterface = IProceedsManagement__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    return await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "transferPaymentToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.to), request.amount],
    } as any)
  }

  private async buildEnvironmentalAssetTransaction(
    request: BuildAddEnvironmentalAssetTransactionRequest | BuildRemoveEnvironmentalAssetTransactionRequest,
    functionName: "addEnvironmentalAssetToken" | "removeEnvironmentalAssetToken",
  ): Promise<BuildTransactionResponse> {
    const iPortfolioInterface = IPortfolio__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    const transactionResponse = await this.buildAndSerializeTransaction({
      contractInterface: iPortfolioInterface,
      functionName: functionName as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [await ConverterUtils.getEvmAddressFromHederaAddress(request.assetContractId)],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  async pauseTreasury(request: BuildPauseTreasuryTransactionRequest): Promise<BuildTransactionResponse> {
    const contractInterface = IPause__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    return await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "pause" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [],
    } as any)
  }

  async unpauseTreasury(request: BuildUnpauseTreasuryTransactionRequest): Promise<BuildTransactionResponse> {
    const contractInterface = IPause__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    return await this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "unpause" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [],
    } as any)
  }
}
