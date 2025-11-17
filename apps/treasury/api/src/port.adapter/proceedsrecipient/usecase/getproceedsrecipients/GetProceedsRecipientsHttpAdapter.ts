// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { PageOptionsRequest, RestController, Inject, PageResponse } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetProceedsRecipientsQuery } from "@app/proceedsrecipient/getproceedsrecipients/query/GetProceedsRecipientsQuery"
import { ProceedsRecipientResponse } from "./model/ProceedsRecipientResponse"
import { GetProceedsRecipientsPort } from "./GetProceedsRecipientsPort"

@RestController("treasuries")
export class GetProceedsRecipientsHttpAdapter implements GetProceedsRecipientsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/proceeds-recipients")
  async getProceedsRecipients(
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<ProceedsRecipientResponse>> {
    const queryPageOptions = (queryPageRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetProceedsRecipientsQuery(treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
