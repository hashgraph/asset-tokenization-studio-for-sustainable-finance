// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import {
  PageOptionsRequest,
  RestController,
  Inject,
  PageResponse,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetProceedsRecipientAllocationsQuery } from "@app/proceedsrecipient/getproceedsrecipientallocations/query/GetProceedsRecipientAllocationsQuery"
import { ProceedsRecipientAllocationResponse } from "./model/ProceedsRecipientAllocationResponse"
import { GetProceedsRecipientAllocationsPort } from "./GetProceedsRecipientAllocationsPort"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetProceedsRecipientAllocationsHttpAdapter implements GetProceedsRecipientAllocationsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Returns history of all the transactions submitted for a specific proceeds recipient" })
  @ApiPaginatedResponse(ProceedsRecipientAllocationResponse)
  @Get(":treasuryId/proceeds-recipients/:recipientId/allocations")
  async getProceedsRecipientAllocations(
    @Param("treasuryId") treasuryContractId: string,
    @Param("recipientId") recipientContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ProceedsRecipientAllocationResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetProceedsRecipientAllocationsQuery(treasuryContractId, recipientContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
