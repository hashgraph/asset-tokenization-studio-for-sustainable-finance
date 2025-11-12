// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingsQuery } from "./GetClearingsQuery"
import { ClearingQueryResponse } from "./ClearingQueryResponse"
import { GetClearingsHoldDomainService } from "@domain/bond/clearinghold/service/GetClearingsHoldDomainService"
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"

@Singleton()
@Handler(GetClearingsQuery)
export class GetClearingsQueryHandler implements QueryHandler<GetClearingsQuery, QueryPageResponse<ClearingQueryResponse>> {
  constructor(private readonly getClearingsDomainService: GetClearingsHoldDomainService) {}

  @Validate()
  async execute(query: GetClearingsQuery): Promise<QueryPageResponse<ClearingQueryResponse>> {
    const page = await this.getClearingsDomainService.execute(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (clearing: ClearingHold) => ({
      id: clearing.id,
      bondContractId: clearing.bondContractId,
      holderAccountId: clearing.holderAccountId,
      clearingId: clearing.clearingId,
      partition: clearing.partition,
      amount: clearing.amount,
      expirationDate: clearing.expirationDate,
      status: clearing.status,
      toAddress: clearing.toAddress,
      escrowAddress: clearing.escrowAddress,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operator,
    }))
  }
}
