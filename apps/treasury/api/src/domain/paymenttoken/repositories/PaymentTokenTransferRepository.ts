// SPDX-License-Identifier: Apache-2.0

import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface PaymentTokenTransferRepository {
  save(paymentTokenTransfer: PaymentTokenTransfer): Promise<PaymentTokenTransfer>

  findByPaymentTokenId(
    paymentTokenId: string,
    options: PageOptions,
    type?: string,
  ): Promise<Page<PaymentTokenTransfer>>

}
