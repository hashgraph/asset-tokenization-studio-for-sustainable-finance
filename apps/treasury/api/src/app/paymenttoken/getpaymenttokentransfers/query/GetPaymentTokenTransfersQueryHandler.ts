// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { PaymentTokenTransferRepository } from "@domain/paymenttoken/repositories/PaymentTokenTransferRepository"
import { CheckPaymentTokenExistsDomainService } from "@domain/paymenttoken/services/CheckPaymentTokenExistsDomainService"
import { GetPaymentTokenTransfersQuery } from "./GetPaymentTokenTransfersQuery"
import { PaymentTokenTransferQueryResponse } from "./PaymentTokenTransferQueryResponse"
import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"

@Singleton()
@Handler(GetPaymentTokenTransfersQuery)
export class GetPaymentTokenTransfersQueryHandler
  implements QueryHandler<GetPaymentTokenTransfersQuery, QueryPageResponse<PaymentTokenTransferQueryResponse>>
{
  constructor(
    @Inject()
    private readonly paymentTokenTransferRepository: PaymentTokenTransferRepository,
    private readonly checkPaymentTokenExistsDomainService: CheckPaymentTokenExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetPaymentTokenTransfersQuery): Promise<QueryPageResponse<PaymentTokenTransferQueryResponse>> {
    const paymentToken = await this.checkPaymentTokenExistsDomainService.executeByTreasuryContractId(
      query.paymentTokenId,
      query.treasuryContractId,
    )

    const page = await this.paymentTokenTransferRepository.findByPaymentTokenId(
      paymentToken.id,
      query.pageOptions.toPageOptions(),
      query.type,
    )

    return QueryPageResponse.fromPage(page, (transfer: PaymentTokenTransfer) => ({
      accountId: transfer.accountId,
      amount: transfer.amount,
      type: transfer.type,
      transferDate: transfer.createdAt,
    }))
  }
}
