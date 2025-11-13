// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetOfferingPort } from "./GetOfferingPort"
import { GetOfferingQuery } from "@app/offering/getoffering/query/GetOfferingQuery"
import { OfferingResponse } from "./model/OfferingResponse"

@RestController("primary-markets")
export class GetOfferingHttpAdapter implements GetOfferingPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":marketContractId/offerings/:offeringId")
  async execute(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: number,
  ): Promise<OfferingResponse> {
    const query = new GetOfferingQuery(marketContractId, offeringId)
    return await this.queryBus.execute(query)
  }
}
