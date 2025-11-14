// SPDX-License-Identifier: Apache-2.0
import { BadRequestException } from "@hashgraph/green-bonds-shared-core"

export class InsufficientClearingBalanceError extends BadRequestException {
  constructor(
    bondContractId: string,
    holderAccountId: string,
    currentBalance: string,
    requiredAmount: string,
  ) {
    super(
      `Insufficient clearing balance for ${bondContractId}/${holderAccountId}. ` +
      `Current: ${currentBalance}, Required: ${requiredAmount}`
    )
  }
}
