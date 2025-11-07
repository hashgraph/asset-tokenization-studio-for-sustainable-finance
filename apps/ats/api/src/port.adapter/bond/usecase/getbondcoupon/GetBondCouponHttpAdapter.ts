// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponPort } from "./GetBondCouponPort"
import { GetBondCouponResponse } from "./model/GetBondCouponResponse"
import { GetBondCouponQuery } from "@app/bond/getbondcoupon/query/GetBondCouponQuery"
import { GetBondCouponQueryResponse } from "@app/bond/getbondcoupon/query/GetBondCouponQueryResponse"

@RestController("bonds")
export class GetBondCouponHttpAdapter implements GetBondCouponPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/coupons/:couponId")
  async getBondCoupon(
    @Param("bondContractId") bondContractId: string,
    @Param("couponId") couponId: string,
  ): Promise<GetBondCouponResponse> {
    const queryResult = await this.queryBus.execute(new GetBondCouponQuery(bondContractId, couponId))
    return GetBondCouponResponse.fromGetBondCouponQueryResponse(queryResult as GetBondCouponQueryResponse)
  }
}
