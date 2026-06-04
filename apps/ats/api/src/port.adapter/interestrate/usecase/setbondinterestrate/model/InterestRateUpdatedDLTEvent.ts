// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface InterestRateStruct {
  readonly maxRate: string
  readonly baseRate: string
  readonly minRate: string
  readonly startPeriod: string
  readonly startRate: string
  readonly missedPenalty: string
  readonly reportPeriod: string
  readonly rateDecimals: string
}

export class InterestRateUpdatedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly newInterestRate: InterestRateStruct

  constructor(bondContractId: string, transactionHash: string, operator: string, newInterestRate: InterestRateStruct) {
    super(bondContractId, transactionHash)
    this.operator = operator
    this.newInterestRate = newInterestRate
  }
}
