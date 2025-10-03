// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuryPositionsQuery } from "@app/treasury/gettreasurypositions/query/GetTreasuryPositionsQuery"
import { GetTreasuryPositionsQueryResponse } from "@app/treasury/gettreasurypositions/query/GetTreasuryPositionsQueryResponse"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetTreasuryPositionsQuery)
export class GetTreasuryPositionsQueryHandler
  implements QueryHandler<GetTreasuryPositionsQuery, GetTreasuryPositionsQueryResponse>
{
  constructor(private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService) {}

  @Validate()
  async execute(query: GetTreasuryPositionsQuery): Promise<GetTreasuryPositionsQueryResponse> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.bondContractAddress)
    return {
      balance: treasury.balance,
    }
  }
}
