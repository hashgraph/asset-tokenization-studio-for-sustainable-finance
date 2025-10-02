// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { BaseTransactionBuilder, BuildTransactionResponse, Environment } from "@hashgraph/green-bonds-shared-core"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"
import { IProceedsManagement__factory } from "@hashgraph/green-bonds-platform-treasury-contracts"

@Injectable()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 30_000_000

  constructor(private readonly configService: ConfigService) {
    super()
  }

  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse {
    const contractInterface = IProceedsManagement__factory.createInterface()
    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_ENVIRONMENT) || "testnet"

    /**
     * Type assertion is necessary here due to complex generic type inference in ethers.js
     * The BaseTransactionBuilder expects specific generic constraints that cannot be
     * automatically inferred from the IProceedsManagement interface.
     * This is a known limitation when working with dynamically generated contract interfaces.
     */
    const transactionResponse = this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "fundProceedsBeneficiary" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId,
      contractEvmAddress: request.contractAddress,
      format: request.format as "hedera" | "ethereum",
      args: [request.address, request.amount],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }
}
