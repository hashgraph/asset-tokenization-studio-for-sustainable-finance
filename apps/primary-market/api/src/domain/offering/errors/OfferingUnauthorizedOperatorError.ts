// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class OfferingUnauthorizedOperatorError extends DomainError {
  static operatorMismatchError(
    offeringId: string,
    expectedOperator: string,
    providedOperator: string,
  ): OfferingUnauthorizedOperatorError {
    return new OfferingUnauthorizedOperatorError(
      `Unauthorized operator for offering ${offeringId}. Expected: ${expectedOperator}, Provided: ${providedOperator}`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
