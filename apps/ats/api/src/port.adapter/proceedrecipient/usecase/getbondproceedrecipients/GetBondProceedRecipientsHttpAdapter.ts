// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondProceedRecipientsPort } from "./GetBondProceedRecipientsPort"
import { GetBondProceedRecipientsQuery } from "@app/proceedrecipient/getbondproceedrecipients/query/GetBondProceedRecipientsQuery"
import { BondProceedRecipientsResponse } from "@port/proceedrecipient/usecase/getbondproceedrecipients/model/BondProceedRecipientsResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondProceedRecipientsHttpAdapter implements GetBondProceedRecipientsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond proceed recipients" })
  @ApiResponse({ status: 200, type: BondProceedRecipientsResponse, isArray: true })
  @Get("/:bondContractId/proceeds-recipients")
  async getBondProceedRecipients(
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondProceedRecipientsResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondProceedRecipientsQuery(bondContractId, queryPageOptions))
  }
}
