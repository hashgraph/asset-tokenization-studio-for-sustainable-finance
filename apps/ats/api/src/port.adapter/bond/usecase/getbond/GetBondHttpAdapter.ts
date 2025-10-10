// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from '@hashgraph/green-bonds-shared-core'
import { Get, Param } from '@nestjs/common'
import type { QueryBus } from '@hashgraph/green-bonds-shared-core'
import { GetBondPort } from './GetBondPort'
import { GetBondResponse } from './model/GetBondResponse'
import { GetBondQuery } from '@app/bond/getbond/query/GetBondQuery'
import { GetBondQueryResponse } from '@app/bond/getbond/query/GetBondQueryResponse'

@RestController('bonds')
export class GetBondHttpAdapter implements GetBondPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get('/:bondContractId')
  async getBond(@Param('bondContractId') bondContractId: string): Promise<GetBondResponse> {
    const queryResult = await this.queryBus.execute(new GetBondQuery(bondContractId))
    return GetBondResponse.fromGetBondQueryResponse(queryResult as GetBondQueryResponse)
  }
}
