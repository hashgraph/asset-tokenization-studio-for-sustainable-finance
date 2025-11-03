// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetBondCapTransactionRequest } from "./model/SetBondCapTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { SetBondCapTransactionPort } from "./SetBondCapTransactionPort"
import { SetBondCapTransactionAppService } from "@app/bond/transaction/setbondcaptransaction/service/SetBondCapTransactionAppService"
import { SetBondCapTransactionAppServiceRequest } from "@app/bond/transaction/setbondcaptransaction/service/model/SetBondCapTransactionAppServiceRequest"

@RestController("bonds")
export class SetBondCapTransactionHttpAdapter implements SetBondCapTransactionPort {
  constructor(private readonly setBondCapTransactionAppService: SetBondCapTransactionAppService) {}

  @Post(":bondContractId/cap")
  async setBondCapTransaction(
    @Param("bondContractId") contractId: string,
    @Body() request: SetBondCapTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new SetBondCapTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      request.newMaxSupply,
    )

    return await this.setBondCapTransactionAppService.execute(appServiceRequest)
  }
}
