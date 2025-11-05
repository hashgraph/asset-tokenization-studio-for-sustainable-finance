// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DeleteControlListMemberTransactionRequest } from "./model/DeleteControlListMemberTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { DeleteControlListMemberTransactionPort } from "./DeleteControlListMemberTransactionPort"
import { DeleteControlListMemberTransactionAppService } from "@app/bond/transaction/deletecontrollistmembertransaction/service/DeleteControlListMemberTransactionAppService"
import { DeleteControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/deletecontrollistmembertransaction/service/model/DeleteControlListMemberTransactionAppServiceRequest"

@RestController("bonds")
export class DeleteControlListMemberTransactionHttpAdapter implements DeleteControlListMemberTransactionPort {
  constructor(
    private readonly deleteControlListMemberTransactionAppService: DeleteControlListMemberTransactionAppService,
  ) {}

  @Delete(":bondContractId/control-list/:holderAccountId")
  async deleteControlListMemberTransaction(
    @Param("bondContractId") contractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: DeleteControlListMemberTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new DeleteControlListMemberTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      holderAccountId,
    )

    return await this.deleteControlListMemberTransactionAppService.execute(appServiceRequest)
  }
}
