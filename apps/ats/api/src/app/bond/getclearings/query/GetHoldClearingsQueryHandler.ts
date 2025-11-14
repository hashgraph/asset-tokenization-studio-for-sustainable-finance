// SPDX-License-Identifier: Apache-2.0
import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetHoldClearingsQuery } from "./GetHoldClearingsQuery"
import { GetClearingsHoldDomainService } from "@domain/bond/clearinghold/service/GetClearingsHoldDomainService"
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"
import { ClearingHoldQueryResponse } from "@app/bond/getclearing/query/ClearingHoldQueryResponse"

@Singleton()
@Handler(GetHoldClearingsQuery)
export class GetHoldClearingsQueryHandler
  implements QueryHandler<GetHoldClearingsQuery, QueryPageResponse<ClearingHoldQueryResponse>>
{
  constructor(private readonly getClearingsDomainService: GetClearingsHoldDomainService) {}

  @Validate()
  async execute(query: GetHoldClearingsQuery): Promise<QueryPageResponse<ClearingHoldQueryResponse>> {
    const page = await this.getClearingsDomainService.execute(
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
      toAddress: clearing.toAddress,
      escrowAddress: clearing.escrowAddress,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operator,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }))
  }
}
