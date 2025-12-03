// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponsPort } from "./GetBondCouponsPort"
import { GetBondCouponsQuery } from "@app/bond/getbondcoupons/query/GetBondCouponsQuery"
import { BondCouponsResponse } from "@port/bond/usecase/getbondcoupons/model/BondCouponsResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondCouponsHttpAdapter implements GetBondCouponsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond coupons" })
  @ApiResponse({ status: 200, type: BondCouponsResponse })
  @Get("/:bondContractId/coupons")
  async getBondCoupons(
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<BondCouponsResponse> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondCouponsQuery(bondContractId, queryPageOptions))
  }
}
