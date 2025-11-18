// SPDX-License-Identifier: Apache-2.0
import { QueryHandler, Singleton, Handler, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingRedeemQuery } from "./GetClearingRedeemQuery"
import { GetClearingRedeemByIdDomainService } from "@domain/bond/clearing/service/GetClearingRedeemByIdDomainService"
import { ClearingRedeemQueryResponse } from "./ClearingRedeemQueryResponse"

@Singleton()
@Handler(GetClearingRedeemQuery)
export class GetClearingRedeemQueryHandler
  implements QueryHandler<GetClearingRedeemQuery, ClearingRedeemQueryResponse>
{
  constructor(private readonly getClearingRedeemByIdDomainService: GetClearingRedeemByIdDomainService) {}

  @Validate()
  async execute(query: GetClearingRedeemQuery): Promise<ClearingRedeemQueryResponse> {
    const clearing = await this.getClearingRedeemByIdDomainService.execute(
      query.bondContractId,
      query.holderAccountId,
      query.clearingId,
    )

    return {
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
    }
  }
}
