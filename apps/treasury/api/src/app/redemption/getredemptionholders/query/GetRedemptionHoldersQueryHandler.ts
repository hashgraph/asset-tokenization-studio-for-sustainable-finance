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
import type { RedemptionHolderRepository } from "@domain/redemption/repositories/RedemptionHolderRepository"
import { GetRedemptionHoldersQuery } from "./GetRedemptionHoldersQuery"
import { RedemptionHolderQueryResponse } from "./RedemptionHolderQueryResponse"
import { RedemptionHolder } from "@domain/redemption/model/RedemptionHolder"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"

@Singleton()
@Handler(GetRedemptionHoldersQuery)
export class GetRedemptionHoldersQueryHandler
  implements QueryHandler<GetRedemptionHoldersQuery, QueryPageResponse<RedemptionHolderQueryResponse>>
{
  constructor(
    @Inject() private readonly redemptionHolderRepository: RedemptionHolderRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
  ) {}

  @Validate()
  async execute(query: GetRedemptionHoldersQuery): Promise<QueryPageResponse<RedemptionHolderQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)

    const redemptionHoldersPage = await this.redemptionHolderRepository.findByTreasuryId(
      treasury.id,
      query.pageOptions.toPageOptions(),
      query.status,
    )

    const uniquePaymentTokenIds = [...new Set(redemptionHoldersPage.items.map((holder) => holder.paymentTokenId))]

    const paymentTokens = await this.paymentTokenRepository.findByIds(uniquePaymentTokenIds)
    const paymentTokensMap = new Map(paymentTokens.map((token) => [token.id, token]))

    const formattedHolders = redemptionHoldersPage.items.map((redemptionHolder: RedemptionHolder) => {
      const paymentToken = paymentTokensMap.get(redemptionHolder.paymentTokenId)
      const formattedAmount = redemptionHolder.amount
        ? ConverterUtils.formatNumber(redemptionHolder.amount, paymentToken?.decimals || 0)
        : null

      return {
        accountId: redemptionHolder.holderAccountId,
        status: redemptionHolder.status,
        amount: formattedAmount,
      }
    })

    return {
      items: formattedHolders,
      total: redemptionHoldersPage.total,
      page: redemptionHoldersPage.page,
      limit: redemptionHoldersPage.limit,
      totalPages: redemptionHoldersPage.totalPages,
    }
  }
}
