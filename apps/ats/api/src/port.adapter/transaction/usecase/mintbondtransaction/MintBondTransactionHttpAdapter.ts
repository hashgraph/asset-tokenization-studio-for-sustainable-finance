// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { MintBondTransactionRequest } from "./model/MintBondTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { MintBondTransactionPort } from "./MintBondTransactionPort"
import { MintBondTransactionAppServiceRequest } from "@app/bond/transaction/mintbondtransaction/service/model/MintBondTransactionAppServiceRequest"
import { MintBondTransactionAppService } from "@app/bond/transaction/mintbondtransaction/service/MintBondTransactionAppService"

@RestController("bonds")
export class MintBondTransactionHttpAdapter implements MintBondTransactionPort {
  constructor(private readonly mintBondTransactionAppService: MintBondTransactionAppService) {}

  @Post(":bondContractId/holders/:holderAccountId/mint")
  async mintBondTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: MintBondTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new MintBondTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      request.amount,
      request.data,
    )

    return await this.mintBondTransactionAppService.execute(appServiceRequest)
  }
}
