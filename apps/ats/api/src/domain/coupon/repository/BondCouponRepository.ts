// SPDX-License-Identifier: Apache-2.0
import { BondCoupon } from "@domain/coupon/model/BondCoupon"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondCouponRepository {
  save(coupon: BondCoupon): Promise<BondCoupon>
  findByContractIdAndId(bondContractId: string, id: string): Promise<BondCoupon | null>
  findAllByContractIdPaginated(bondContractId: string, pageOptions: PageOptions): Promise<Page<BondCoupon>>
}
