// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponsPort } from "./GetBondCouponsPort"
import { GetBondCouponsResponse } from "./model/GetBondCouponsResponse"
import { GetBondCouponsQuery } from "@app/bond/getbondcoupons/query/GetBondCouponsQuery"
import { GetBondCouponsQueryResponse } from "@app/bond/getbondcoupons/query/GetBondCouponsQueryResponse"

@RestController("bonds")
export class GetBondCouponsHttpAdapter implements GetBondCouponsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/coupons")
  async getBondCoupons(@Param("bondContractId") bondContractId: string): Promise<GetBondCouponsResponse> {
    const queryResult = await this.queryBus.execute(new GetBondCouponsQuery(bondContractId))
    return GetBondCouponsResponse.fromGetBondCouponsQueryResponse(queryResult as GetBondCouponsQueryResponse)
  }
}
