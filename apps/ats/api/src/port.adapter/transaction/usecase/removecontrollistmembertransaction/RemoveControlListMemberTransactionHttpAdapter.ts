// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveControlListMemberTransactionRequest } from "./model/RemoveControlListMemberTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { RemoveControlListMemberTransactionPort } from "./RemoveControlListMemberTransactionPort"
import { RemoveControlListMemberTransactionAppService } from "@app/bond/transaction/removecontrollistmembertransaction/service/RemoveControlListMemberTransactionAppService"
import { RemoveControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/removecontrollistmembertransaction/service/model/RemoveControlListMemberTransactionAppServiceRequest"

@RestController("bonds")
export class RemoveControlListMemberTransactionHttpAdapter implements RemoveControlListMemberTransactionPort {
  constructor(
    private readonly deleteControlListMemberTransactionAppService: RemoveControlListMemberTransactionAppService,
  ) {}

  @Delete(":bondContractId/control-list/:holderAccountId")
  async deleteControlListMemberTransaction(
    @Param("bondContractId") contractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: RemoveControlListMemberTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new RemoveControlListMemberTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      holderAccountId,
    )

    return await this.deleteControlListMemberTransactionAppService.execute(appServiceRequest)
  }
}
