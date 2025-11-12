// SPDX-License-Identifier: Apache-2.0
import { QueryHandler, Singleton, Inject } from "@hashgraph/green-bonds-shared-core"
import { GetClearingQuery } from "./GetClearingQuery"
import { GetClearingHoldByIdDomainService } from "@domain/bond/clearinghold/service/GetClearingHoldByIdDomainService"
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"

@Singleton()
export class GetClearingQueryHandler implements QueryHandler<GetClearingQuery, ClearingHold> {
  constructor(private readonly getClearingByIdDomainService: GetClearingHoldByIdDomainService) {}

  async execute(query: GetClearingQuery): Promise<ClearingHold> {
    return await this.getClearingByIdDomainService.execute(
      query.bondContractId,
      query.holderAccountId,
      query.clearingId,
    )
  }
}
