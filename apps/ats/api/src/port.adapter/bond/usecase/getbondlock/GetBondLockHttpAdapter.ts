// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondLockPort } from "./GetBondLockPort"
import { GetBondLockQuery } from "@app/bond/getbondlock/query/GetBondLockQuery"
import { BondLockResponse } from "@port/bond/usecase/getbondlock/model/BondLockResponse"

@RestController("bonds")
export class GetBondLockHttpAdapter implements GetBondLockPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/holders/:holderAccountId/locks/:lockId")
  async getBondLock(
    @Param("bondContractId") bondContractId: string,
    @Param("holderAccountId") holderAccountId: string,
    @Param("lockId") lockId: number,
  ): Promise<BondLockResponse> {
    return await this.queryBus.execute(new GetBondLockQuery(bondContractId, holderAccountId, lockId))
  }
}
