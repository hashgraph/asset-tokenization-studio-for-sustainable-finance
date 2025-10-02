// SPDX-License-Identifier: Apache-2.0

import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  Singleton,
  Environment,
} from "@hashgraph/green-bonds-shared-core"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BaseContract } from "ethers"
import { Interface } from "ethers/lib/utils"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/ConfigKeys"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 30_000_000

  constructor(private readonly configService: ConfigService) {
    super()
  }

  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse {
    const proceedsManagementABI = ["function fundProceedsBeneficiary(address _beneficiary, uint256 _amount) external"]
    const contractInterface = new Interface(proceedsManagementABI)
    const contractInstance = new BaseContract(request.contractAddress, contractInterface) as any

    const environment = this.configService.get<Environment>(ConfigKeys.HEDERA_ENVIRONMENT) || "testnet"

    const transactionResponse = this.buildAndSerializeTransaction({
      contractInstance,
      functionName: "fundProceedsBeneficiary",
      contractId: request.contractId,
      gas: this.GAS,
      environment,
      account: request.accountId, 
      contractEvmAddress: request.contractAddress, 
      format: request.format as "hedera" | "ethereum",
      args: [request.address, request.amount],
    })

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }
}
