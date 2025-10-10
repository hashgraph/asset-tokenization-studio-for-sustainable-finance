// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from '@hashgraph/green-bonds-shared-core'
import { Get, Query } from '@nestjs/common'
import { PageOptionsRequest } from '@hashgraph/green-bonds-shared-core'
import { GetBondsPort } from './GetBondsPort'
import type { Page, QueryBus } from '@hashgraph/green-bonds-shared-core'
import { GetBondsQuery } from '@app/bond/getbonds/query/GetBondsQuery'
import { BondQueryResponse } from '@app/bond/getbonds/query/BondQueryResponse'
import { Bond } from '@domain/bond/model/Bond'

@RestController('bonds')
export class GetBondsHttpAdapter implements GetBondsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  async getBonds(@Query() pageOptionsRequest: PageOptionsRequest): Promise<BondQueryResponse> {
    const pageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toPageOptions()
    const page: Page<Bond> = await this.queryBus.execute(new GetBondsQuery(pageOptions))

    return BondQueryResponse.fromPage(page, (bond) => bond)
  }
}
