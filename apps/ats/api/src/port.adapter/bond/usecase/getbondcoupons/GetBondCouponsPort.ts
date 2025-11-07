// SPDX-License-Identifier: Apache-2.0
import { GetBondCouponsResponse } from "./model/GetBondCouponsResponse"

export interface GetBondCouponsPort {
  getBondCoupons(bondContractId: string): Promise<GetBondCouponsResponse>
}
