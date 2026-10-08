// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveBondDocumentTransactionRequest } from "./model/RemoveBondDocumentTransactionRequest"
import { Body, Delete, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { RemoveBondDocumentTransactionPort } from "./RemoveBondDocumentTransactionPort"
import { RemoveBondDocumentTransactionAppService } from "@app/transaction/document/removebonddocumenttransaction/service/RemoveBondDocumentTransactionAppService"
import { RemoveBondDocumentTransactionAppServiceRequest } from "@app/transaction/document/removebonddocumenttransaction/service/model/RemoveBondDocumentTransactionAppServiceRequest"
import { Bytes32ParamPipe } from "@utils/Bytes32ParamPipe"

@ApiTags("ATS")
@RestController("bonds")
export class RemoveBondDocumentTransactionHttpAdapter implements RemoveBondDocumentTransactionPort {
  constructor(private readonly removeBondDocumentTransactionAppService: RemoveBondDocumentTransactionAppService) {}

  @ApiOperation({ summary: "Remove a bond document" })
  @ApiResponse({ status: 200, type: TransactionResponse })
  @Delete(":bondContractId/documents/:documentId")
  async removeBondDocumentTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("documentId", Bytes32ParamPipe) name: string,
    @Body() request: RemoveBondDocumentTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new RemoveBondDocumentTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      name,
    )

    return await this.removeBondDocumentTransactionAppService.execute(appServiceRequest)
  }
}
