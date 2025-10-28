// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenNotConfiguredError extends DomainError {
  static forTreasury(treasuryContractId: string): PaymentTokenNotConfiguredError {
    return new PaymentTokenNotConfiguredError(
      `Treasury ${treasuryContractId} does not have a payment token configured.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
