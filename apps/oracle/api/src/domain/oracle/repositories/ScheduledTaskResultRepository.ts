// SPDX-License-Identifier: Apache-2.0
import { PageOptions, Page } from "@hashgraph/green-bonds-shared-core"
import { ScheduledTaskResult } from "../model/ScheduledTaskResult"
import { TaskStatus } from "../model/TaskStatus"

export interface ScheduledTaskResultRepository {
  /**
   * Save a scheduled task result
   */
  save(taskResult: ScheduledTaskResult): Promise<ScheduledTaskResult>

  /**
   * Find a task result by ID
   */
  findById(id: string): Promise<ScheduledTaskResult | null>

  /**
   * Find task results by registry ID with pagination
   */
  findByRegistryId(
    registryId: string,
    pageOptions: PageOptions,
    projectId?: string,
    status?: TaskStatus,
  ): Promise<Page<ScheduledTaskResult>>

  /**
   * Find the latest task result for a project
   */
  findLatestByProject(registryId: string, projectId: string): Promise<ScheduledTaskResult | null>
}
