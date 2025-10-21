// SPDX-License-Identifier: Apache-2.0

import { Treasury } from "@domain/treasury/model/Treasury"

export class UpdatePaymentTokenDomainServiceResponse {
  readonly treasury: Treasury

  constructor(treasury: Treasury) {
    this.treasury = treasury
  }
}
