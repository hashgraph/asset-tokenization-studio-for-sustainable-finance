// SPDX-License-Identifier: Apache-2.0
import { BondCoupon } from "@domain/bond/coupon/model/BondCoupon"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondCouponRepository {
  save(coupon: BondCoupon): Promise<BondCoupon>
  findByContractIdAndCouponId(contractId: string, couponId: string): Promise<BondCoupon | null>
  findAllByContractIdPaginated(contractId: string, pageOptions: PageOptions): Promise<Page<BondCoupon>>
}
