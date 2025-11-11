// SPDX-License-Identifier: Apache-2.0
import { QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { BondCouponsResponse } from "@port/bond/usecase/getbondcoupons/model/BondCouponsResponse"

export interface GetBondCouponsPort {
  getBondCoupons(bondContractId: string, queryPageRequest: QueryPageRequest): Promise<BondCouponsResponse>
}
