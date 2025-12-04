// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondLockPort } from "./GetBondLockPort"
import { GetBondLockQuery } from "@app/lock/getbondlock/query/GetBondLockQuery"
import { BondLockResponse } from "@port/lock/usecase/getbondlock/model/BondLockResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondLockHttpAdapter implements GetBondLockPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond lock details by holder and lock ID" })
  @ApiResponse({ status: 200, type: BondLockResponse })
  @Get(":bondContractId/holders/:holderAccountId/locks/:lockId")
  async getBondLock(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("lockId") lockId: number,
  ): Promise<BondLockResponse> {
    return await this.queryBus.execute(new GetBondLockQuery(bondContractId, holderAccountId, lockId))
  }
}
