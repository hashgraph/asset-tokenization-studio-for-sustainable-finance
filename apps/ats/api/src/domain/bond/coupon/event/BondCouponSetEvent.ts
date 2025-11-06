// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondCouponSetEvent extends Event {
  constructor(
    public readonly contractId: string,
    public readonly corporateActionId: string,
    public readonly couponId: string,
    public readonly operator: string,
    public readonly recordDate: string,
    public readonly executionDate: string,
    public readonly rate: string,
  ) {
    super()
  }
}
