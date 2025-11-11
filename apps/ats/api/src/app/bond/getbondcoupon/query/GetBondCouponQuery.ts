// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { BondCouponQueryResponse } from "./BondCouponQueryResponse"

export class GetBondCouponQuery extends Query<BondCouponQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  @IsNotEmpty()
  readonly couponId: string

  constructor(bondContractId: string, couponId: string) {
    super()
    this.bondContractId = bondContractId
    this.couponId = couponId
  }
}
