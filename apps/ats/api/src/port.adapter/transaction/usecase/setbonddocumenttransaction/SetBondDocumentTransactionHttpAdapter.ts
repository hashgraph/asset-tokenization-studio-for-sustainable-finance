// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetBondDocumentTransactionRequest } from "./model/SetBondDocumentTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { SetBondDocumentTransactionPort } from "./SetBondDocumentTransactionPort"
import { SetBondDocumentTransactionAppService } from "@app/transaction/document/setbonddocumenttransaction/service/SetBondDocumentTransactionAppService"
import { SetBondDocumentTransactionAppServiceRequest } from "@app/transaction/document/setbonddocumenttransaction/service/model/SetBondDocumentTransactionAppServiceRequest"
import { Bytes32ParamPipe } from "@utils/Bytes32ParamPipe"

@ApiTags("ATS")
@RestController("bonds")
export class SetBondDocumentTransactionHttpAdapter implements SetBondDocumentTransactionPort {
  constructor(private readonly setBondDocumentTransactionAppService: SetBondDocumentTransactionAppService) {}

  @ApiOperation({ summary: "Set bond document" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/documents/:documentId")
  async setBondDocumentTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("documentId", Bytes32ParamPipe) name: string,
    @Body() request: SetBondDocumentTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new SetBondDocumentTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      name,
      request.uri,
      request.hash,
    )

    return await this.setBondDocumentTransactionAppService.execute(appServiceRequest)
  }
}
