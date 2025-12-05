// SPDX-License-Identifier: Apache-2.0
import { PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { BondCouponsResponse } from "@port/coupon/usecase/getbondcoupons/model/BondCouponsResponse"

export interface GetBondCouponsPort {
  getBondCoupons(bondContractId: string, pageOptionsRequest: PageOptionsRequest): Promise<BondCouponsResponse>
}
