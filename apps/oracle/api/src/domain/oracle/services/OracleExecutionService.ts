// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import { OracleRegistry } from "../model/OracleRegistry"
import { ScheduledTaskResult } from "../model/ScheduledTaskResult"
import { Project } from "../model/Project"
import type { IndexerPort } from "../ports/IndexerPort"
import type { BlockchainPort } from "../ports/BlockchainPort"
import type { ScheduledTaskResultRepository } from "../repositories/ScheduledTaskResultRepository"
import { randomUUID } from "crypto"

/**
 * OracleExecutionService
 * Domain service responsible for executing scheduled KPI tasks
 */
@Injectable()
export class OracleExecutionService {
  private readonly logger = new Logger(OracleExecutionService.name)

  constructor(
    @Inject("IndexerPort")
    private readonly indexerPort: IndexerPort,
    @Inject("BlockchainPort")
    private readonly blockchainPort: BlockchainPort,
    @Inject("ScheduledTaskResultRepository")
    private readonly taskRepository: ScheduledTaskResultRepository,
  ) {}

  /**
   * Execute KPI task for a single project
   * @param registry - The oracle registry
   * @param project - The project to execute
   * @param toDate - The end date for KPI data range (from registry.nextExecutionDate)
   */
  async executeProjectTask(
    registry: OracleRegistry,
    project: Project,
    toDate: Date,
  ): Promise<ScheduledTaskResult> {
    this.logger.log(`Executing task for project ${project.projectId} in registry ${registry.id}`)

    // Step 1: Calculate fromDate based on last successful execution
    const fromDate = await this.calculateFromDate(registry.id, project.projectId)

    this.logger.debug(
      `Date range for project ${project.projectId}: ` +
        `from=${fromDate?.toISOString() || "null"}, to=${toDate.toISOString()}`,
    )

    // Create pending task result with from/to
    let taskResult = ScheduledTaskResult.createPending(
      randomUUID(),
      registry.id,
      project.projectId,
      fromDate,
      toDate,
    )

    taskResult = await this.taskRepository.save(taskResult)

    try {
      // Step 2: Fetch KPI value from indexer using from/to range
      const kpiMessage = await this.indexerPort.getKpiValueByTopic(project.topicId, fromDate || toDate, toDate)

      // Validate: Don't proceed if no KPI data (will be retried later)
      if (!kpiMessage) {
        throw new Error(
          `No KPI data found for topic ${project.topicId} ` +
            `between ${fromDate?.toISOString() || "start"} and ${toDate.toISOString()}. ` +
            `Task will be retried.`,
        )
      }

      // Step 3: Use KPI value directly (no aggregation needed)
      const kpiValue = kpiMessage.value

      this.logger.debug(`KPI value for project ${project.projectId}: ${kpiValue}`)

      // Note: Smart contract only stores ONE timestamp (toDate), not a range
      const writeResult = await this.blockchainPort.writeKpiToContract(
        registry.kpiContractId,
        project.projectId,
        kpiValue,
        toDate,
      )

      if (!writeResult.success) {
        throw new Error("Failed to write KPI to blockchain")
      }

      // Mark as success
      taskResult = taskResult.markAsSuccess(kpiValue, writeResult.transactionHash)

      this.logger.log(
        `Successfully executed task for project ${project.projectId}. ` +
          `TX: ${writeResult.transactionHash}, ` +
          `KPI: ${kpiValue}, Range: [${fromDate?.toISOString() || "null"}, ${toDate.toISOString()}]`,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const errorType = error instanceof Error ? error.constructor.name : "Error"

      this.logger.error(
        `Failed to execute task for project ${project.projectId}: ${errorMessage} ` +
          `(range: [${fromDate?.toISOString() || "null"}, ${toDate.toISOString()}])`,
      )

      taskResult = taskResult.markAsFailed(errorType, errorMessage)
    }

    // Save final result
    return await this.taskRepository.save(taskResult)
  }

  /**
   * Retry a failed task execution using original from/to date range
   */
  async retryTask(
    taskResult: ScheduledTaskResult,
    registry: OracleRegistry,
    maxRetries: number,
  ): Promise<ScheduledTaskResult> {
    if (!taskResult.canRetry(maxRetries)) {
      throw new Error(`Task ${taskResult.id} cannot be retried (max retries: ${maxRetries})`)
    }

    const project = registry.getProjectById(taskResult.projectId)
    if (!project) {
      throw new Error(`Project ${taskResult.projectId} not found in registry`)
    }

    this.logger.log(
      `Retrying task ${taskResult.id} (attempt ${taskResult.retryCount + 1}/${maxRetries}). ` +
        `Original range: [${taskResult.fromDate?.toISOString() || "null"}, ${taskResult.toDate.toISOString()}]`,
    )

    // Increment retry counter and save
    const retryResult = taskResult.incrementRetry()
    await this.taskRepository.save(retryResult)

    // Execute with ORIGINAL toDate (preserves original date range)
    return await this.executeProjectTask(registry, project, taskResult.toDate)
  }

  /**
   * Calculate fromDate for KPI data fetching
   * fromDate = last successful execution's toDate (null for first execution)
   */
  private async calculateFromDate(registryId: string, projectId: string): Promise<Date | null> {
    // Find the last SUCCESSFUL execution
    const lastSuccess = await this.taskRepository.findLatestSuccessfulByProject(registryId, projectId)

    if (!lastSuccess) {
      // First execution: no fromDate we set current date as fromDate
      return null
    }

    // Continuous coverage: from = last success's toDate
    return lastSuccess.toDate
  }
}
