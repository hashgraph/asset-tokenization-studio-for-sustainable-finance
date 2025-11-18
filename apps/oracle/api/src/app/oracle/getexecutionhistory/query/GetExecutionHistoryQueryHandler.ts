// SPDX-License-Identifier: Apache-2.0
import { Inject } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { GetExecutionHistoryQuery } from "./GetExecutionHistoryQuery";
import type { ScheduledTaskRepository } from "@domain/oracle/repositories/ScheduledTaskRepository";
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult";

export interface ExecutionHistoryResponse {
  data: ScheduledTaskResult[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(GetExecutionHistoryQuery)
export class GetExecutionHistoryQueryHandler
  implements IQueryHandler<GetExecutionHistoryQuery, ExecutionHistoryResponse>
{
  constructor(
    @Inject("ScheduledTaskRepository")
    private readonly repository: ScheduledTaskRepository,
  ) {}

  async execute(
    query: GetExecutionHistoryQuery,
  ): Promise<ExecutionHistoryResponse> {
    const [data, total] = await Promise.all([
      this.repository.findByOracleRegistryId(query.registryId, {
        projectId: query.projectId,
        status: query.status,
        page: query.page,
        limit: query.limit,
      }),
      this.repository.countByOracleRegistryId(query.registryId, {
        projectId: query.projectId,
        status: query.status,
      }),
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
