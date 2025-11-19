// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import { OracleRegistry } from "../model/OracleRegistry"
import { ScheduledTaskResult } from "../model/ScheduledTaskResult"
import { Project } from "../model/Project"
import type { IndexerPort } from "../ports/IndexerPort"
import { KpiMessage } from "../ports/IndexerPort"
import type { BlockchainPort } from "../ports/BlockchainPort"
import { OracleAggregationService } from "./OracleAggregationService"
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
    private readonly aggregationService: OracleAggregationService,
  ) {}

  /**
   * Execute KPI task for a single project
   */
  async executeProjectTask(
    registry: OracleRegistry,
    project: Project,
    scheduledTime: Date,
  ): Promise<ScheduledTaskResult> {
    this.logger.log(`Executing task for project ${project.projectId} in registry ${registry.id}`)

    // Create pending task result
    let taskResult = ScheduledTaskResult.createPending(randomUUID(), registry.id, project.projectId, scheduledTime)

    taskResult = await this.taskRepository.save(taskResult)

    try {
      // Step 1: Fetch KPI values from indexer
      const kpiMessages = await this.fetchKpiValues(project.topicId, scheduledTime)

      if (kpiMessages.length === 0) {
        throw new Error(`No KPI messages found for topic ${project.topicId}`)
      }
      //TODO: Guardian
      // Step 2: Aggregate KPI values
      const aggregatedKpi = this.aggregationService.aggregateDailyKpi(kpiMessages)

      this.logger.debug(`Aggregated KPI for project ${project.projectId}: ${aggregatedKpi}`)
      //TODO: queremos escribir en DLT  a pesar de que  no recuperemos datos de KPI un valor por defecto o cuando se calcula el impact data se settea por defecto
      // Step 3: Write to blockchain
      const writeResult = await this.blockchainPort.writeKpiToContract(
        registry.kpiContractId,
        project.projectId,
        aggregatedKpi,
        scheduledTime,
      )

      if (!writeResult.success) {
        throw new Error("Failed to write KPI to blockchain")
      }

      // Mark as success
      taskResult = taskResult.markAsSuccess(aggregatedKpi, writeResult.transactionHash)

      this.logger.log(`Successfully executed task for project ${project.projectId}. TX: ${writeResult.transactionHash}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const errorType = error instanceof Error ? error.constructor.name : "Error"

      this.logger.error(`Failed to execute task for project ${project.projectId}: ${errorMessage}`)

      taskResult = taskResult.markAsFailed(errorType, errorMessage)
    }

    // Save final result
    return await this.taskRepository.save(taskResult)
  }

  /**
   * Retry a failed task execution
   */
  //TODO: define better
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

    this.logger.log(`Retrying task ${taskResult.id} (attempt ${taskResult.retryCount + 1})`)

    // Increment retry counter
    const retryResult = taskResult.incrementRetry()
    await this.taskRepository.save(retryResult)

    // Execute task
    return await this.executeProjectTask(registry, project, taskResult.scheduledTime)
  }

  /**
   * Fetch KPI values from indexer for a specific date
   */
  //TODO: Guardian
  private async fetchKpiValues(topicId: string, targetDate: Date): Promise<KpiMessage[]> {
    // Fetch messages for the target day
    const dateFrom = new Date(targetDate)
    dateFrom.setUTCHours(0, 0, 0, 0)

    const dateTo = new Date(targetDate)
    dateTo.setUTCHours(23, 59, 59, 999)

    this.logger.debug(
      `Fetching KPI values for topic ${topicId} from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`,
    )

    return await this.indexerPort.getKpiValuesByTopic(topicId, dateFrom, dateTo)
  }
}
