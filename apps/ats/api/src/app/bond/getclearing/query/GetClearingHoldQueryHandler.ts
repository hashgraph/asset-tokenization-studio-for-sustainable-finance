// SPDX-License-Identifier: Apache-2.0
import { QueryHandler, Singleton, Inject, Handler } from "@hashgraph/green-bonds-shared-core"
import { GetClearingHoldQuery } from "./GetClearingHoldQuery"
import { GetClearingHoldByIdDomainService } from "@domain/bond/clearinghold/service/GetClearingHoldByIdDomainService"
import { ClearingHoldQueryResponse } from "@app/bond/getclearings/query/ClearingHoldQueryResponse"

@Singleton()
@Handler(GetClearingHoldQuery)
export class GetClearingHoldQueryHandler implements QueryHandler<GetClearingHoldQuery, ClearingHoldQueryResponse> {
  constructor(private readonly getClearingByIdDomainService: GetClearingHoldByIdDomainService) {}

  async execute(query: GetClearingHoldQuery): Promise<ClearingHoldQueryResponse> {
    const clearing = await this.getClearingByIdDomainService.execute(
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
      toAddress: clearing.toAddress,
      escrowAddress: clearing.escrowAddress,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operator,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }
  }
}
