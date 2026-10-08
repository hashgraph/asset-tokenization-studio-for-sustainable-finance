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
import { GetProceedsRecipientsQuery } from "@app/proceedsrecipient/getproceedsrecipients/query/GetProceedsRecipientsQuery"
import { ProceedsRecipientResponse } from "./model/ProceedsRecipientResponse"
import { GetProceedsRecipientsPort } from "./GetProceedsRecipientsPort"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetProceedsRecipientsHttpAdapter implements GetProceedsRecipientsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: "Returns the list of all proceeds recipients that have been funded throughout the treasury life cycle",
  })
  @ApiPaginatedResponse(ProceedsRecipientResponse)
  @Get(":treasuryId/proceeds-recipients")
  async getProceedsRecipients(
    @Param("treasuryId") treasuryContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ProceedsRecipientResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetProceedsRecipientsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
