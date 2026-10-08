// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetControlListMembersPort } from "./GetControlListMembersPort"
import { GetControlListMembersQuery } from "@app/controllist/getcontrollistmembers/query/GetControlListMembersQuery"
import { ControlListMembersResponse } from "./model/ControlListMembersResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetControlListMembersHttpAdapter implements GetControlListMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get control list members" })
  @ApiResponse({ status: 200, type: ControlListMembersResponse, isArray: true })
  @Get("/:bondContractId/control-list/members")
  async getControlListMembers(
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ControlListMembersResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetControlListMembersQuery(bondContractId, queryPageOptions))
  }
}
