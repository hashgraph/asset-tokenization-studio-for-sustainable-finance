// SPDX-License-Identifier: Apache-2.0
import { GetBondCouponResponse } from "./model/GetBondCouponResponse"

export interface GetBondCouponPort {
  getBondCoupon(bondContractId: string, couponId: string): Promise<GetBondCouponResponse>
}
