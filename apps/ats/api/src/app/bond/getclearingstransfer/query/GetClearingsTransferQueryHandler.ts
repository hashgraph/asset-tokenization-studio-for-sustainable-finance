// SPDX-License-Identifier: Apache-2.0
import { Handler, QueryHandler, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingsTransferQuery } from "./GetClearingsTransferQuery"
import { GetClearingsTransferDomainService } from "@domain/bond/clearing/service/GetClearingsTransferDomainService"
import { ClearingTransfer } from "@domain/bond/clearing/model/ClearingTransfer"
import { ClearingTransferQueryResponse } from "./ClearingTransferQueryResponse"

@Singleton()
@Handler(GetClearingsTransferQuery)
export class GetClearingsTransferQueryHandler
  implements QueryHandler<GetClearingsTransferQuery, QueryPageResponse<ClearingTransferQueryResponse>>
{
  constructor(private readonly getClearingsTransferDomainService: GetClearingsTransferDomainService) {}

  @Validate()
  async execute(query: GetClearingsTransferQuery): Promise<QueryPageResponse<ClearingTransferQueryResponse>> {
    const page = await this.getClearingsTransferDomainService.execute(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (clearing: ClearingTransfer) => ({
      id: clearing.id,
      bondContractId: clearing.bondContractId,
      holderAccountId: clearing.holderAccountId,
      partition: clearing.partition,
      amount: clearing.amount,
      expirationDate: clearing.expirationDate,
      status: clearing.status,
      toAddress: clearing.toAccountId,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operatorAccountId,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }))
  }
}
