// SPDX-License-Identifier: Apache-2.0
import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { GetExecutionHistoryQuery } from "@app/oracle/getexecutionhistory/query/GetExecutionHistoryQuery";
import { ExecutionHistoryResponse } from "@app/oracle/getexecutionhistory/query/GetExecutionHistoryQueryHandler";
import { TaskStatus } from "@domain/oracle/model/TaskStatus";

@ApiTags("Execution History")
@Controller("oracle/registries/:registryId/executions")
export class GetExecutionHistoryHttpAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Get execution history for an oracle registry" })
  @ApiParam({ name: "registryId", type: "string" })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: TaskStatus })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Execution history retrieved" })
  async getExecutionHistory(
    @Param("registryId") registryId: string,
    @Query("projectId") projectId?: string,
    @Query("status") status?: TaskStatus,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ): Promise<ExecutionHistoryResponse> {
    const query = new GetExecutionHistoryQuery(
      registryId,
      projectId,
      status,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return await this.queryBus.execute(query);
  }
}
