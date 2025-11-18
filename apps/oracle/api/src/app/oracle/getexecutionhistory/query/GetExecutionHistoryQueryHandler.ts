// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { ScheduledTaskResultRepository } from "@domain/oracle/repositories/ScheduledTaskResultRepository"
import { GetExecutionHistoryQuery } from "./GetExecutionHistoryQuery"
import { ExecutionHistoryQueryResponse } from "./ExecutionHistoryQueryResponse"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"

@Singleton()
@Handler(GetExecutionHistoryQuery)
export class GetExecutionHistoryQueryHandler
  implements QueryHandler<GetExecutionHistoryQuery, QueryPageResponse<ExecutionHistoryQueryResponse>>
{
  constructor(@Inject("ScheduledTaskResultRepository") private readonly repository: ScheduledTaskResultRepository) {}

  @Validate()
  async execute(query: GetExecutionHistoryQuery): Promise<QueryPageResponse<ExecutionHistoryQueryResponse>> {
    const page = await this.repository.findByRegistryId(
      query.registryId,
      query.pageOptions.toPageOptions(),
      query.projectId,
      query.status,
    )
    return QueryPageResponse.fromPage(page, (task: ScheduledTaskResult) => ({
      id: task.id,
      oracleRegistryId: task.oracleRegistryId,
      projectId: task.projectId,
      status: task.status,
      scheduledTime: task.scheduledTime,
      executionTime: task.executionTime,
      completedAt: task.completedAt,
      errorType: task.errorType,
      errorMessage: task.errorMessage,
      kpiValue: task.kpiValue,
      transactionHash: task.transactionHash,
      retryCount: task.retryCount,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }))
  }
}
