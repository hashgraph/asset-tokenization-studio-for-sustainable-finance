// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate, ConverterUtils } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { ProceedsRecipientAllocationRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientAllocationRepository"
import { GetProceedsRecipientAllocationsQuery } from "./GetProceedsRecipientAllocationsQuery"
import { ProceedsRecipientAllocationQueryResponse } from "./ProceedsRecipientAllocationQueryResponse"
import { ProceedsRecipientAllocation } from "@domain/proceedsrecipient/model/ProceedsRecipientAllocation"
import { CheckProceedsRecipientExistsDomainService } from "@domain/proceedsrecipient/services/CheckProceedsRecipientExistsDomainService"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { CheckPaymentTokenExistsDomainService } from "@domain/paymenttoken/services/CheckPaymentTokenExistsDomainService"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"

@Singleton()
@Handler(GetProceedsRecipientAllocationsQuery)
export class GetProceedsRecipientAllocationsQueryHandler
  implements
    QueryHandler<GetProceedsRecipientAllocationsQuery, QueryPageResponse<ProceedsRecipientAllocationQueryResponse>>
{
  constructor(
    @Inject("ProceedsRecipientAllocationRepository")
    private readonly allocationRepository: ProceedsRecipientAllocationRepository,
    private readonly checkProceedsRecipientExistsDomainService: CheckProceedsRecipientExistsDomainService,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    private readonly checkPaymentTokenExistsDomainService: CheckPaymentTokenExistsDomainService,
    @Inject("PaymentTokenRepository")
    private readonly paymentTokenRepository: PaymentTokenRepository,
  ) {}

  @Validate()
  async execute(
    query: GetProceedsRecipientAllocationsQuery,
  ): Promise<QueryPageResponse<ProceedsRecipientAllocationQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)
    const proceedsRecipient = await this.checkProceedsRecipientExistsDomainService.execute(
      query.recipientContractId,
      treasury.contractId,
    )

    const allocationsPage = await this.allocationRepository.findByProceedsRecipientId(
      proceedsRecipient.id,
      query.pageOptions.toPageOptions(),
    )

    const uniquePaymentTokenIds = [...new Set(allocationsPage.items.map((allocation) => allocation.paymentTokenId))]

    const paymentTokens = await this.paymentTokenRepository.findByIds(uniquePaymentTokenIds)
    const paymentTokensMap = new Map(paymentTokens.map((token) => [token.id, token]))

    const formattedAllocations = allocationsPage.items.map((allocation: ProceedsRecipientAllocation) => {
      const paymentToken = paymentTokensMap.get(allocation.paymentTokenId)
      const formattedAmount = ConverterUtils.formatNumber(allocation.amount, paymentToken?.decimals || 0)

      return {
        paymentTokenId: allocation.paymentTokenId,
        amount: formattedAmount,
        createdAt: allocation.createdAt,
      }
    })

    return {
      items: formattedAllocations,
      total: allocationsPage.total,
      page: allocationsPage.page,
      limit: allocationsPage.limit,
      totalPages: allocationsPage.totalPages,
    }
  }
}
