// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponQuery } from "@app/bond/getbondcoupon/query/GetBondCouponQuery"
import { BondCouponResponse } from "./model/BondCouponResponse"
import { GetBondCouponPort } from "@port/bond/usecase/getbondcoupon/GetBondCouponPort"

@RestController("bonds")
export class GetBondCouponHttpAdapter implements GetBondCouponPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/coupons/:couponId")
  async getBondCoupon(
    @Param("bondContractId") bondContractId: string,
    @Param("couponId") couponId: string,
  ): Promise<BondCouponResponse> {
    return await this.queryBus.execute(new GetBondCouponQuery(bondContractId, couponId))
  }
}
