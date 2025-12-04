// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddControlListMemberTransactionRequest } from "./model/AddControlListMemberTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { AddControlListMemberTransactionPort } from "./AddControlListMemberTransactionPort"
import { AddControlListMemberTransactionAppService } from "@app/bond/transaction/addcontrollistmembertransaction/service/AddControlListMemberTransactionAppService"
import { AddControlListMemberTransactionAppServiceRequest } from "@app/bond/transaction/addcontrollistmembertransaction/service/model/AddControlListMemberTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class AddControlListMemberTransactionHttpAdapter implements AddControlListMemberTransactionPort {
  constructor(private readonly addControlListMemberTransactionAppService: AddControlListMemberTransactionAppService) {}

  @ApiOperation({ summary: "Add member to bond control list" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/control-list/:holderAccountId")
  async addControlListMemberTransaction(
    @Param("bondContractId") contractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Body() request: AddControlListMemberTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new AddControlListMemberTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      holderAccountId,
    )

    return await this.addControlListMemberTransactionAppService.execute(appServiceRequest)
  }
}
