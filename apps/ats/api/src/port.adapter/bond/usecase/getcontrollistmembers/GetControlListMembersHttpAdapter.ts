// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetControlListMembersPort } from "./GetControlListMembersPort"
import { GetControlListMembersQuery } from "@app/bond/getcontrollistmembers/query/GetControlListMembersQuery"
import { ControlListMembersResponse } from "./model/ControlListMembersResponse"

@RestController("bonds")
export class GetControlListMembersHttpAdapter implements GetControlListMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/control-list/members")
  async getControlListMembers(
    @Param("bondContractId") bondContractId: string,
    @Query() queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<ControlListMembersResponse>> {
    const queryPageOptions = (queryPageRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetControlListMembersQuery(bondContractId, queryPageOptions))
  }
}
