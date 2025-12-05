// SPDX-License-Identifier: Apache-2.0
import { QueryHandler, Singleton, Handler, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetClearingTransferQuery } from "./GetClearingTransferQuery"
import { GetClearingTransferByIdDomainService } from "@domain/clearing/service/GetClearingTransferByIdDomainService"
import { ClearingTransferQueryResponse } from "./ClearingTransferQueryResponse"

@Singleton()
@Handler(GetClearingTransferQuery)
export class GetClearingTransferQueryHandler
  implements QueryHandler<GetClearingTransferQuery, ClearingTransferQueryResponse>
{
  constructor(private readonly getClearingTransferByIdDomainService: GetClearingTransferByIdDomainService) {}

  @Validate()
  async execute(query: GetClearingTransferQuery): Promise<ClearingTransferQueryResponse> {
    const clearing = await this.getClearingTransferByIdDomainService.execute(
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
      data: clearing.data,
      operatorData: clearing.operatorData,
      operator: clearing.operatorAccountId,
      createdAt: clearing.createdAt,
      updatedAt: clearing.updatedAt,
    }
  }
}
