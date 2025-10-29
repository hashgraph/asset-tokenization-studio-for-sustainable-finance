// SPDX-License-Identifier: Apache-2.0

import {
  ConverterUtils,
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import type { DistributionHolderRepository } from "@domain/distribution/repositories/DistributionHolderRepository"
import { GetDistributionHoldersQuery } from "./GetDistributionHoldersQuery"
import { DistributionHolderQueryResponse } from "./DistributionHolderQueryResponse"
import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { CheckDistributionExistsDomainService } from "@domain/distribution/services/CheckDistributionExistsDomainService"

@Singleton()
@Handler(GetDistributionHoldersQuery)
export class GetDistributionHoldersQueryHandler
  implements QueryHandler<GetDistributionHoldersQuery, QueryPageResponse<DistributionHolderQueryResponse>>
{
  constructor(
    @Inject() private readonly distributionHolderRepository: DistributionHolderRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    private readonly checkDistributionExistsDomainService: CheckDistributionExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetDistributionHoldersQuery): Promise<QueryPageResponse<DistributionHolderQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)

    await this.checkDistributionExistsDomainService.execute(query.distributionId)

    const distributionHoldersPage = await this.distributionHolderRepository.findByDistributionId(
      query.distributionId,
      query.pageOptions.toPageOptions(),
      query.status,
    )

    const paymentTokenDecimals = treasury.paymentToken?.decimals || 0

    return QueryPageResponse.fromPage(distributionHoldersPage, (distributionHolder: DistributionHolder) => ({
      accountId: distributionHolder.holderAccountId,
      status: distributionHolder.status,
      amount: ConverterUtils.formatNumber(distributionHolder.amount, paymentTokenDecimals),
    }))
  }
}
