// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { GetTreasuriesQuery } from "@app/treasury/gettreasuries/query/GetTreasuriesQuery"
import { TreasuryQueryResponse } from "@app/treasury/gettreasuries/query/TreasuryQueryResponse"
import { Treasury } from "@domain/treasury/model/Treasury"

@Singleton()
@Handler(GetTreasuriesQuery)
export class GetTreasuriesQueryHandler
  implements QueryHandler<GetTreasuriesQuery, QueryPageResponse<TreasuryQueryResponse>>
{
  constructor(@Inject() private readonly treasuryRepository: TreasuryRepository) {}

  @Validate()
  async execute(query: GetTreasuriesQuery): Promise<QueryPageResponse<TreasuryQueryResponse>> {
    const treasuriesPage = await this.treasuryRepository.findAll(query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(treasuriesPage, (treasury: Treasury) => ({
      contractId: treasury.contractId,
      bondContractId: treasury.bondContractId,
      paused: treasury.paused,
      createdAt: treasury.createdAt,
    }))
  }
}
