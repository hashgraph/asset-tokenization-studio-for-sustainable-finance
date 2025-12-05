// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponQuery } from "@app/coupon/getbondcoupon/query/GetBondCouponQuery"
import { BondCouponResponse } from "./model/BondCouponResponse"
import { GetBondCouponPort } from "@port/coupon/usecase/getbondcoupon/GetBondCouponPort"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondCouponHttpAdapter implements GetBondCouponPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond coupon details by coupon ID" })
  @ApiResponse({ status: 200, type: BondCouponResponse })
  @Get("/:bondContractId/coupons/:couponId")
  async getBondCoupon(
    @Param("bondContractId") bondContractId: string,
    @Param("couponId") couponId: string,
  ): Promise<BondCouponResponse> {
    return await this.queryBus.execute(new GetBondCouponQuery(bondContractId, couponId))
  }
}
