// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondProceedRecipientsPort } from "./GetBondProceedRecipientsPort"
import { GetBondProceedRecipientsQuery } from "@app/bond/getbondproceedrecipients/query/GetBondProceedRecipientsQuery"
import { BondProceedRecipientsResponse } from "@port/bond/usecase/getbondproceedrecipients/model/BondProceedRecipientsResponse"

@RestController("bonds")
export class GetBondProceedRecipientsHttpAdapter implements GetBondProceedRecipientsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/proceeds-recipients")
  async getBondProceedRecipients(
    @Param("bondContractId") bondContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<BondProceedRecipientsResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondProceedRecipientsQuery(bondContractId, queryPageOptions))
  }
}
