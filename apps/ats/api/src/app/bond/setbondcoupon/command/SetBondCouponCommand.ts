// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SetBondCouponCommand extends Command<void> {
  readonly contractId: string
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly recordDate: string
  readonly executionDate: string
  readonly rate: string

  constructor(
    contractId: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: string,
    executionDate: string,
    rate: string,
  ) {
    super()
    this.contractId = contractId
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.rate = rate
  }
}
