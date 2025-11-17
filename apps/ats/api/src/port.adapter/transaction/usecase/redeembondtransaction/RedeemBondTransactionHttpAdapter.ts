// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RedeemBondTransactionRequest } from "./model/RedeemBondTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { RedeemBondTransactionPort } from "./RedeemBondTransactionPort"
import { RedeemBondTransactionAppServiceRequest } from "@app/bond/transaction/redeembondtransaction/service/model/RedeemBondTransactionAppServiceRequest"
import { RedeemBondTransactionAppService } from "@app/bond/transaction/redeembondtransaction/service/RedeemBondTransactionAppService"

@RestController("bonds")
export class RedeemBondTransactionHttpAdapter implements RedeemBondTransactionPort {
  constructor(private readonly redeemBondTransactionAppService: RedeemBondTransactionAppService) {}

  @Post(":bondContractId/holders/:holderAccountId/redeems")
  async redeemBondTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: RedeemBondTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new RedeemBondTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      holderAccountId,
      request.partition,
      request.amount,
      request.data,
    )

    return await this.redeemBondTransactionAppService.execute(appServiceRequest)
  }
}
