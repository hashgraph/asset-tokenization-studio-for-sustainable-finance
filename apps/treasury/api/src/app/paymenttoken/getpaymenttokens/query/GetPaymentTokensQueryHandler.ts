// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { GetPaymentTokensQuery } from "./GetPaymentTokensQuery"
import { PaymentTokenQueryResponse } from "./PaymentTokenQueryResponse"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetPaymentTokensQuery)
export class GetPaymentTokensQueryHandler
  implements QueryHandler<GetPaymentTokensQuery, QueryPageResponse<PaymentTokenQueryResponse>>
{
  constructor(
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetPaymentTokensQuery): Promise<QueryPageResponse<PaymentTokenQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)
    const page = await this.paymentTokenRepository.findAllByTreasuryId(treasury.id, query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(page, (paymentToken: PaymentToken) => ({
      contractId: paymentToken.contractId,
      additionDate: paymentToken.createdAt,
      removalDate: paymentToken.removalDate,
    }))
  }
}
