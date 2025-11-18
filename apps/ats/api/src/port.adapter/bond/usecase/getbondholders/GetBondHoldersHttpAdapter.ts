// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondHoldersPort } from "./GetBondHoldersPort"
import { GetBondHoldersQuery } from "@app/bond/getbondholders/query/GetBondHoldersQuery"
import { BondHoldersResponse } from "./model/BondHoldersResponse"

@RestController("bonds")
export class GetBondHoldersHttpAdapter implements GetBondHoldersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders")
  async getBondHolders(
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondHoldersResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondHoldersQuery(bondContractId, queryPageOptions))
  }
}
