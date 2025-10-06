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
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import { IProceedsManagement__factory } from "@hashgraph/green-bonds-platform-treasury-contracts"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 30_000_000

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
      contractEvmAddress: this.getEvmAddressFromHedera(request.contractId),
      format: request.format as "hedera" | "ethereum",
      args: [request.address, request.amount],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }

  addEnvironmentalAsset(request: BuildAddEnvironmentalAssetTransactionRequest): BuildTransactionResponse {
    return this.buildEnvironmentalAssetTransaction(request, "addERC721Token")
  }

  removeEnvironmentalAsset(request: BuildRemoveEnvironmentalAssetTransactionRequest): BuildTransactionResponse {
    return this.buildEnvironmentalAssetTransaction(request, "removeERC721Token")
  }

  /**
   * Builds a transaction for environmental asset operations (add/remove)
   * @param request The transaction request containing assetId, contractId, accountId, and format
   * @param functionName The contract function name to call ("addERC721Token" or "removeERC721Token")
   * @returns BuildTransactionResponse containing the serialized unsigned transaction
   * @private
   */
  private buildEnvironmentalAssetTransaction(
    request: BuildAddEnvironmentalAssetTransactionRequest | BuildRemoveEnvironmentalAssetTransactionRequest,
    functionName: "addERC721Token" | "removeERC721Token",
  ): BuildTransactionResponse {
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
      functionName: functionName as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      contractEvmAddress: this.getEvmAddressFromHedera(request.contractId),
      format: request.format as "hedera" | "ethereum",
      args: [this.getEvmAddressFromHedera(request.assetId)],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }
}
