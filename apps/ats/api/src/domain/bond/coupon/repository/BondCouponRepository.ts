// SPDX-License-Identifier: Apache-2.0
import { BondCoupon } from "@domain/bond/coupon/model/BondCoupon"

export interface BondCouponRepository {
  save(coupon: BondCoupon): Promise<BondCoupon>
  findByContractIdAndCouponId(contractId: string, couponId: string): Promise<BondCoupon | null>
  findAllByContractId(contractId: string): Promise<BondCoupon[]>
}
