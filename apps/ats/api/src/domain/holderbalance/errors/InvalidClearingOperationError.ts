// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class InvalidClearingOperationError extends DomainError {
  static unknownOperation(operation: string): InvalidClearingOperationError {
    return new InvalidClearingOperationError(
      `Invalid clearing operation: ${operation}. Valid operations are: CLEARING_LOCK, CLEARING_UNLOCK, CLEARING_EXECUTE.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
