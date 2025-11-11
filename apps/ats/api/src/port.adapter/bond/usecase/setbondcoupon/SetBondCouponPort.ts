// SPDX-License-Identifier: Apache-2.0
import { CouponSetDLTEvent } from "@port/bond/usecase/setbondcoupon/model/CouponSetDLTEvent"

export interface SetBondCouponPort {
  handle(event: CouponSetDLTEvent): Promise<void>
}
