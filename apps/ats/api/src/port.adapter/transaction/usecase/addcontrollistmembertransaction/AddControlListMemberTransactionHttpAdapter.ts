// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddControlListMemberTransactionRequest } from "./model/AddControlListMemberTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { AddControlListMemberTransactionPort } from "./AddControlListMemberTransactionPort"
import { AddControlListMemberTransactionAppService } from "@app/bond/transaction/addcontrollistmembertransaction/service/AddControlListMemberTransactionAppService"
import { AddControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/addcontrollistmembertransaction/service/model/AddControlListMemberTransactionAppServiceRequest"

@RestController("bonds")
export class AddControlListMemberTransactionHttpAdapter implements AddControlListMemberTransactionPort {
  constructor(
    private readonly addControlListMemberTransactionAppService: AddControlListMemberTransactionAppService,
  ) {}

  @Post(":bondContractId/control-list/:holderId")
  async addControlListMemberTransaction(
    @Param("bondContractId") contractId: string,
    @Param("holderId") holderId: string,
    @Body() request: AddControlListMemberTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new AddControlListMemberTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      holderId,
    )

    return await this.addControlListMemberTransactionAppService.execute(appServiceRequest)
  }
}
