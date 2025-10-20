// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from '@hashgraph/green-bonds-shared-core'

export class BuildCreateOfferingTransactionRequest extends BaseBuildTransactionRequest {
  bondContractId: string
  treasuryAddress: string
  paymentTokenAddress: string
  lotSize: number
  minQuantity: number
  maxQuantity: number
  targetQuantity: number
  targetQuantityRule: number
  startDate: string
  endDate: string
  deadlineRule: number
}
