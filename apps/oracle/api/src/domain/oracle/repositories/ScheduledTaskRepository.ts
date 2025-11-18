// SPDX-License-Identifier: Apache-2.0
import { ScheduledTaskResult } from "../model/ScheduledTaskResult"
import { TaskStatus } from "../model/TaskStatus"

export interface ScheduledTaskRepository {
  /**
   * Save a scheduled task result
   */
  save(taskResult: ScheduledTaskResult): Promise<ScheduledTaskResult>

  /**
   * Find a task result by ID
   */
  findById(id: string): Promise<ScheduledTaskResult | null>

  /**
   * Find all task results for an oracle registry
   */
  findByOracleRegistryId(
    oracleRegistryId: string,
    options?: {
      projectId?: string
      status?: TaskStatus
      page?: number
      limit?: number
    },
  ): Promise<ScheduledTaskResult[]>

  /**
   * Find the latest task result for a project
   */
  findLatestByProject(oracleRegistryId: string, projectId: string): Promise<ScheduledTaskResult | null>

  /**
   * Count task results for an oracle registry
   */
  countByOracleRegistryId(
    oracleRegistryId: string,
    options?: {
      projectId?: string
      status?: TaskStatus
    },
  ): Promise<number>
}
