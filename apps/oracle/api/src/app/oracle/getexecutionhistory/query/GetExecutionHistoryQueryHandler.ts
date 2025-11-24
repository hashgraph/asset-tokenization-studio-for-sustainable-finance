// SPDX-License-Identifier: Apache-2.0
import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import type { ScheduledTaskResultRepository } from "@domain/oracle/repositories/ScheduledTaskResultRepository"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { GetExecutionHistoryQuery } from "./GetExecutionHistoryQuery"
import { ExecutionHistoryQueryResponse } from "./ExecutionHistoryQueryResponse"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(GetExecutionHistoryQuery)
export class GetExecutionHistoryQueryHandler
  implements QueryHandler<GetExecutionHistoryQuery, QueryPageResponse<ExecutionHistoryQueryResponse>>
{
  constructor(
    @Inject("ScheduledTaskResultRepository") private readonly taskRepository: ScheduledTaskResultRepository,
    @Inject("OracleRegistryRepository") private readonly registryRepository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(query: GetExecutionHistoryQuery): Promise<QueryPageResponse<ExecutionHistoryQueryResponse>> {
    // Verify registry exists
    const registry = await this.registryRepository.findById(query.registryId)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(query.registryId)
    }

    const page = await this.taskRepository.findByRegistryId(
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
      fromDate: task.fromDate,
      toDate: task.toDate,
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
