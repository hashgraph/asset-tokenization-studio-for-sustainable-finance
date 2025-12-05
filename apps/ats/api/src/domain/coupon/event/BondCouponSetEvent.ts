// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondCouponSetEvent extends Event {
  constructor(
    public readonly contractId: string,
    public readonly corporateActionId: string,
    public readonly couponId: string,
    public readonly operator: string,
    public readonly recordDate: Date,
    public readonly executionDate: Date,
    public readonly rate: string,
    public readonly rateDecimals: string,
    public readonly period: string,
  ) {
    super()
  }
}
