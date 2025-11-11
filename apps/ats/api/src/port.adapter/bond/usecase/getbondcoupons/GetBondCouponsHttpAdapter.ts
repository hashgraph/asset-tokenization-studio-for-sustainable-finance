// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponsPort } from "./GetBondCouponsPort"
import { GetBondCouponsQuery } from "@app/bond/getbondcoupons/query/GetBondCouponsQuery"
import { BondCouponsResponse } from "@port/bond/usecase/getbondcoupons/model/BondCouponsResponse"

@RestController("bonds")
export class GetBondCouponsHttpAdapter implements GetBondCouponsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/coupons")
  async getBondCoupons(
    @Param("bondContractId") bondContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<BondCouponsResponse> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondCouponsQuery(bondContractId, queryPageOptions))
  }
}
