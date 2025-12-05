// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class InsufficientLockedBalanceError extends DomainError {
  static bondHolderPartitionError(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    lockedBalance: string,
    unlockAmount: string,
  ): InsufficientLockedBalanceError {
    return new InsufficientLockedBalanceError(
      `Insufficient locked balance for bond ${bondContractId}, holder ${holderAccountId}, partition ${partition}. Locked: ${lockedBalance}, Unlock amount: ${unlockAmount}`,
    )
  }
}
