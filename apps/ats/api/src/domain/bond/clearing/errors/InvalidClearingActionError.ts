// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

/**
 * Error thrown when an invalid or unsupported clearing action is requested.
 */
export class InvalidClearingActionError extends DomainError {
  constructor(action: string, supportedActions: string[] = ["APPROVE", "RECLAIM"]) {
    const supportedActionsStr = supportedActions.join(", ")
    super(
      `Invalid clearing action: '${action}'. ` +
        `Supported actions are: ${supportedActionsStr}.`,
    )
  }

  static forAction(action: string): InvalidClearingActionError {
    return new InvalidClearingActionError(action)
  }
}
