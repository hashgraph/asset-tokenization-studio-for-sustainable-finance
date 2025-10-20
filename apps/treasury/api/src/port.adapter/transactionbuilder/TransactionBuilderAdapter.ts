// SPDX-License-Identifier: Apache-2.0

import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  Environment,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BuildAddEnvironmentalAssetTransactionRequest } from "./model/BuildAddEnvironmentalAssetTransactionRequest"
import { BuildRemoveEnvironmentalAssetTransactionRequest } from "./model/BuildRemoveEnvironmentalAssetTransactionRequest"
import { BuildTransferEnvironmentalAssetTransactionRequest } from "./model/BuildTransferEnvironmentalAssetTransactionRequest"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import { IPortfolio__factory, IProceedsManagement__factory } from "@hashgraph/green-bonds-platform-treasury-contracts"
import { BuildExternalTransferPaymentTokenTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferPaymentTokenTransactionRequest"
import { BuildUpdatePaymentTokenTransactionRequest } from "./model/BuildUpdatePaymentTokenTransactionRequest"
import { TransferTransaction } from "@hashgraph/sdk"
import { utils } from "ethers"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 15_000_000

  constructor(private readonly configService: ConfigService) {
    super()
  }

  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse {
    const contractInterface = IProceedsManagement__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    /**
     * Type assertion is necessary here due to complex generic type inference in ethers.js
     * The BaseTransactionBuilder expects specific generic constraints that cannot be
     * automatically inferred from the IProceedsManagement interface.
     * This is a known limitation when working with dynamically generated contract interfaces.
     */
    const transactionResponse = this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "fundProceedsRecipient" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [this.getEvmAddressFromHedera(request.address), request.amount],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  addEnvironmentalAsset(request: BuildAddEnvironmentalAssetTransactionRequest): BuildTransactionResponse {
    return this.buildEnvironmentalAssetTransaction(request, "addEnvironmentalAssetToken")
  }

  removeEnvironmentalAsset(request: BuildRemoveEnvironmentalAssetTransactionRequest): BuildTransactionResponse {
    return this.buildEnvironmentalAssetTransaction(request, "removeEnvironmentalAssetToken")
  }

  transferEnvironmentalAsset(request: BuildTransferEnvironmentalAssetTransactionRequest): BuildTransactionResponse {
    const contractInterface = IProceedsManagement__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    /**
     * Type assertion is necessary here due to complex generic type inference in ethers.js
     * The BaseTransactionBuilder expects specific generic constraints that cannot be
     * automatically inferred from the IProceedsManagement interface.
     * This is a known limitation when working with dynamically generated contract interfaces.
     */
    const transactionResponse = this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "transferEnvironmentalAssetToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [
        this.getEvmAddressFromHedera(request.assetContractId),
        this.getEvmAddressFromHedera(request.to),
        request.tokenId,
      ],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  externalTransferPaymentToken(request: BuildExternalTransferPaymentTokenTransactionRequest): BuildTransactionResponse {
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"
    if (request.format === "ethereum") {
      const contractInterface = new utils.Interface(["function transfer(address to, uint256 value)"])
      return this.buildAndSerializeTransaction({
        contractInterface,
        functionName: "transfer" as any,
        contractId: request.contractId,
        gas: this.GAS,
        environment,
        account: request.accountId,
        format: request.format as "ethereum",
        args: [this.getEvmAddressFromHedera(request.treasuryContractId), this.getEvmAddressFromHedera(request.amount)],
      } as any)
    }
    const transaction = new TransferTransaction()
      .addTokenTransfer(request.contractId, request.accountId, BigInt(`-${request.amount}`))
      .addTokenTransfer(request.contractId, request.treasuryContractId, BigInt(request.amount))

    return this.serializeHederaTransaction(transaction, environment, request.accountId)
  }

  updatePaymentToken(request: BuildUpdatePaymentTokenTransactionRequest): BuildTransactionResponse {
    const iPortfolioInterface = IPortfolio__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    /**
     * Type assertion is necessary here due to complex generic type inference in ethers.js
     * The BaseTransactionBuilder expects specific generic constraints that cannot be
     * automatically inferred from the IPortfolio interface.
     * This is a known limitation when working with dynamically generated contract interfaces.
     */
    const transactionResponse = this.buildAndSerializeTransaction({
      contractInterface: iPortfolioInterface,
      functionName: "updatePaymentToken" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [this.getEvmAddressFromHedera(request.paymentTokenContractId)],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  /**
   * Builds a transaction for environmental asset operations (add/remove)
   * @param request The transaction request containing assetContractId, contractId, accountId, and format
   * @param functionName The contract function name to call ("addEnvironmentalAssetToken"
   * or "removeEnvironmentalAssetToken")
   * @returns BuildTransactionResponse containing the serialized unsigned transaction
   * @private
   */
  private buildEnvironmentalAssetTransaction(
    request: BuildAddEnvironmentalAssetTransactionRequest | BuildRemoveEnvironmentalAssetTransactionRequest,
    functionName: "addEnvironmentalAssetToken" | "removeEnvironmentalAssetToken",
  ): BuildTransactionResponse {
    const iPortfolioInterface = IPortfolio__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_NETWORK) || "testnet"

    /**
     * Type assertion is necessary here due to complex generic type inference in ethers.js
     * The BaseTransactionBuilder expects specific generic constraints that cannot be
     * automatically inferred from the IProceedsManagement interface.
     * This is a known limitation when working with dynamically generated contract interfaces.
     */
    const transactionResponse = this.buildAndSerializeTransaction({
      contractInterface: iPortfolioInterface,
      functionName: functionName as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [this.getEvmAddressFromHedera(request.assetContractId)],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }
}
