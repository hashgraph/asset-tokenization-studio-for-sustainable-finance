// SPDX-License-Identifier: Apache-2.0
import { Handler, QueryHandler, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingsHoldQuery } from "./GetClearingsHoldQuery"
import { GetClearingsHoldDomainService } from "@domain/clearing/service/GetClearingsHoldDomainService"
import { ClearingHold } from "@domain/clearing/model/ClearingHold"
import { ClearingHoldQueryResponse } from "@app/clearing/getclearingshold/query/ClearingHoldQueryResponse"

@Singleton()
@Handler(GetClearingsHoldQuery)
export class GetClearingsHoldQueryHandler
  implements QueryHandler<GetClearingsHoldQuery, QueryPageResponse<ClearingHoldQueryResponse>>
{
  constructor(private readonly getClearingsHoldDomainService: GetClearingsHoldDomainService) {}

  @Validate()
  async execute(query: GetClearingsHoldQuery): Promise<QueryPageResponse<ClearingHoldQueryResponse>> {
    const page = await this.getClearingsHoldDomainService.execute(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (clearing: ClearingHold) => ({
      id: clearing.id,
      bondContractId: clearing.bondContractId,
      holderAccountId: clearing.holderAccountId,
      partition: clearing.partition,
      amount: clearing.amount,
      expirationDate: clearing.expirationDate,
      status: clearing.status,
      toAddress: clearing.toAccountId,
      escrowAddress: clearing.escrowAccountId,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operatorAccountId,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }))
  }
}
