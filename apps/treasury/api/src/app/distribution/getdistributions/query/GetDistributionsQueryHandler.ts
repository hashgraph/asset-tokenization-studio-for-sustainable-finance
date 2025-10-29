// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { GetDistributionsQuery } from "./GetDistributionsQuery"
import { DistributionQueryResponse } from "./DistributionQueryResponse"
import { Distribution } from "@domain/distribution/model/Distribution"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetDistributionsQuery)
export class GetDistributionsQueryHandler
  implements QueryHandler<GetDistributionsQuery, QueryPageResponse<DistributionQueryResponse>>
{
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetDistributionsQuery): Promise<QueryPageResponse<DistributionQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)

    const distributionsPage = await this.distributionRepository.findByTreasuryId(
      treasury.id,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(distributionsPage, (distribution: Distribution) => ({
      id: distribution.id,
      createdAt: distribution.createdAt,
    }))
  }
}
