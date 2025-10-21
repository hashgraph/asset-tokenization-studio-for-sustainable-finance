// SPDX-License-Identifier: Apache-2.0

import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"

export class AddPaymentTokenTransferDomainServiceResponse {
  transfer: PaymentTokenTransfer

  constructor(transfer: PaymentTokenTransfer) {
    this.transfer = transfer
  }
}
