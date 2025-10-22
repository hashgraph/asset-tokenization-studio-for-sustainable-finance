// SPDX-License-Identifier: Apache-2.0
import {RestController, TransactionResponse} from "@hashgraph/green-bonds-shared-core"
import {SetBondDocumentTransactionRequest} from "./model/SetBondDocumentTransactionRequest"
import {Body, Param, Post} from "@nestjs/common"
import {SetBondDocumentTransactionPort} from "./SetBondDocumentTransactionPort"
import {
  SetBondDocumentTransactionAppService
} from "@app/bond/transaction/setbonddocumenttransaction/service/SetBondDocumentTransactionAppService";
import {
  SetBondDocumentTransactionAppServiceRequest
} from "@app/bond/transaction/setbonddocumenttransaction/service/model/SetBondDocumentTransactionAppServiceRequest";
import {Bytes32ParamPipe} from "../../../../utils/Bytes32ParamPipe";

@RestController("bonds")
export class SetBondDocumentTransactionHttpAdapter implements SetBondDocumentTransactionPort {
  constructor(private readonly setBondDocumentTransactionAppService: SetBondDocumentTransactionAppService) {}

  @Post(":bondContractId/documents/:documentId")
  setBondDocumentTransaction(
    @Param("bondContractId") contractId: string,
    @Param("documentId", Bytes32ParamPipe) name: string,
    @Body() request: SetBondDocumentTransactionRequest,
  ): TransactionResponse {
    const appServiceRequest = new SetBondDocumentTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      name,
      request.uri,
      request.hash,
    )

    return this.setBondDocumentTransactionAppService.execute(appServiceRequest)
  }
}
