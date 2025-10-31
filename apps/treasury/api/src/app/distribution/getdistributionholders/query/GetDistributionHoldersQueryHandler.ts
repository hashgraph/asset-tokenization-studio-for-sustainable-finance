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
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"

@Singleton()
@Handler(GetDistributionHoldersQuery)
export class GetDistributionHoldersQueryHandler
  implements QueryHandler<GetDistributionHoldersQuery, QueryPageResponse<DistributionHolderQueryResponse>>
{
  constructor(
    @Inject() private readonly distributionHolderRepository: DistributionHolderRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    private readonly checkDistributionExistsDomainService: CheckDistributionExistsDomainService,
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
  ) {}

  @Validate()
  async execute(query: GetDistributionHoldersQuery): Promise<QueryPageResponse<DistributionHolderQueryResponse>> {
    await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)

    await this.checkDistributionExistsDomainService.execute(query.distributionId)

    const distributionHoldersPage = await this.distributionHolderRepository.findByDistributionId(
      query.distributionId,
      query.pageOptions.toPageOptions(),
      query.status,
    )

    const uniquePaymentTokenIds = [...new Set(distributionHoldersPage.items.map((holder) => holder.paymentTokenId))]

    const paymentTokens = await this.paymentTokenRepository.findByIds(uniquePaymentTokenIds)
    const paymentTokensMap = new Map(paymentTokens.map((token) => [token.id, token]))

    const formattedHolders = distributionHoldersPage.items.map((distributionHolder: DistributionHolder) => {
      const paymentToken = paymentTokensMap.get(distributionHolder.paymentTokenId)
      const formattedAmount = distributionHolder.amount
        ? ConverterUtils.formatNumber(distributionHolder.amount, paymentToken?.decimals || 0)
        : undefined

      return {
        accountId: distributionHolder.holderAccountId,
        status: distributionHolder.status,
        amount: formattedAmount,
      }
    })

    return {
      items: formattedHolders,
      total: distributionHoldersPage.total,
      page: distributionHoldersPage.page,
      limit: distributionHoldersPage.limit,
      totalPages: distributionHoldersPage.totalPages,
    }
  }
}
