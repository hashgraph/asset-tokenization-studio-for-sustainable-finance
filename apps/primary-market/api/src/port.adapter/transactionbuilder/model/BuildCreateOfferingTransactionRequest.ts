// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildCreateOfferingTransactionRequest extends BaseBuildTransactionRequest {
  bondContractId: string
  treasuryAddress: string
  paymentTokenAddress: string
  lotSize: string
  minQuantity: string
  maxQuantity: string
  targetQuantity: string
  targetQuantityRule: number
  startDate: string
  endDate: string
  deadlineRule: number
}
