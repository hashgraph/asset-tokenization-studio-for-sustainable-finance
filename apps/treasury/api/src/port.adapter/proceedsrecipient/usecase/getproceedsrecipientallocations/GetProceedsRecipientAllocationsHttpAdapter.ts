// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetProceedsRecipientAllocationsQuery } from "@app/proceedsrecipient/getproceedsrecipientallocations/query/GetProceedsRecipientAllocationsQuery"
import { ProceedsRecipientAllocationResponse } from "./model/ProceedsRecipientAllocationResponse"
import { GetProceedsRecipientAllocationsPort } from "./GetProceedsRecipientAllocationsPort"

@RestController("treasuries")
export class GetProceedsRecipientAllocationsHttpAdapter implements GetProceedsRecipientAllocationsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/proceeds-recipients/:recipientContractId/allocations")
  async getProceedsRecipientAllocations(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("recipientContractId") recipientContractId: string,
    @Query() queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<ProceedsRecipientAllocationResponse>> {
    const queryPageOptions = (queryPageRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetProceedsRecipientAllocationsQuery(treasuryContractId, recipientContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
