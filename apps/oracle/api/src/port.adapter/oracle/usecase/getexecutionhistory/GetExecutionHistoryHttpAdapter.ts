// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query as QueryParam } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetExecutionHistoryQuery } from "@app/oracle/getexecutionhistory/query/GetExecutionHistoryQuery"
import { ExecutionHistoryResponse } from "./model/ExecutionHistoryResponse"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"

@RestController("oracle/registries")
export class GetExecutionHistoryHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":registryId/executions")
  async getExecutionHistory(
    @Param("registryId") registryId: string,
    @QueryParam("projectId") projectId?: string,
    @QueryParam("status") status?: TaskStatus,
    @QueryParam() pageOptionsRequest?: PageOptionsRequest,
  ): Promise<PageResponse<ExecutionHistoryResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetExecutionHistoryQuery(registryId, queryPageOptions, projectId, status))
  }
}
