// SPDX-License-Identifier: Apache-2.0

import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { Treasury } from "@domain/treasury/model/Treasury"

export class AddPaymentTokenDomainServiceResponse {
  readonly paymentToken: PaymentToken
  readonly treasury: Treasury

  constructor(paymentToken: PaymentToken, treasury: Treasury) {
    this.paymentToken = paymentToken
    this.treasury = treasury
  }
}
