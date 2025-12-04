// SPDX-License-Identifier: Apache-2.0
import { QueryHandler, Singleton, Handler, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingHoldQuery } from "./GetClearingHoldQuery"
import { GetClearingHoldByIdDomainService } from "@domain/clearing/service/GetClearingHoldByIdDomainService"
import { ClearingHoldQueryResponse } from "@app/clearing/getclearinghold/query/ClearingHoldQueryResponse"

@Singleton()
@Handler(GetClearingHoldQuery)
export class GetClearingHoldQueryHandler implements QueryHandler<GetClearingHoldQuery, ClearingHoldQueryResponse> {
  constructor(private readonly getClearingHoldByIdDomainService: GetClearingHoldByIdDomainService) {}

  @Validate()
  async execute(query: GetClearingHoldQuery): Promise<ClearingHoldQueryResponse> {
    const clearing = await this.getClearingHoldByIdDomainService.execute(
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
      toAddress: clearing.toAccountId,
      escrowAddress: clearing.escrowAccountId,
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operatorAccountId,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }
  }
}
