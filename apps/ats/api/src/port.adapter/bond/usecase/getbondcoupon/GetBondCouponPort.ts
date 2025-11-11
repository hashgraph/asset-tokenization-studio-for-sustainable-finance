// SPDX-License-Identifier: Apache-2.0
import { BondCouponResponse } from "@port/bond/usecase/getbondcoupon/model/BondCouponResponse"

export interface GetBondCouponPort {
  getBondCoupon(bondContractId: string, couponId: string): Promise<BondCouponResponse>
}
