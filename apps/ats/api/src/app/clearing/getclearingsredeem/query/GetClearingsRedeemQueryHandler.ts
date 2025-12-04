// SPDX-License-Identifier: Apache-2.0
import { Handler, QueryHandler, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingsRedeemQuery } from "./GetClearingsRedeemQuery"
import { GetClearingsRedeemDomainService } from "@domain/clearing/service/GetClearingsRedeemDomainService"
import { ClearingRedeem } from "@domain/clearing/model/ClearingRedeem"
import { ClearingRedeemQueryResponse } from "./ClearingRedeemQueryResponse"

@Singleton()
@Handler(GetClearingsRedeemQuery)
export class GetClearingsRedeemQueryHandler
  implements QueryHandler<GetClearingsRedeemQuery, QueryPageResponse<ClearingRedeemQueryResponse>>
{
  constructor(private readonly getClearingsRedeemDomainService: GetClearingsRedeemDomainService) {}

  @Validate()
  async execute(query: GetClearingsRedeemQuery): Promise<QueryPageResponse<ClearingRedeemQueryResponse>> {
    const page = await this.getClearingsRedeemDomainService.execute(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (clearing: ClearingRedeem) => ({
      id: clearing.id,
      bondContractId: clearing.bondContractId,
      holderAccountId: clearing.holderAccountId,
      partition: clearing.partition,
      amount: clearing.amount,
      expirationDate: clearing.expirationDate,
      status: clearing.status,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operatorAccountId,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }))
  }
}
