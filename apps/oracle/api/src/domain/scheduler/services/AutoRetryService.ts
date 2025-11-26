// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import type { ScheduledTaskResultRepository } from "@domain/oracle/repositories/ScheduledTaskResultRepository"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import type { SchedulerConfigRepository } from "@domain/scheduler/repositories/SchedulerConfigRepository"
import { OracleExecutionService } from "@domain/oracle/services/OracleExecutionService"

/**
 * AutoRetryService
 * Automatically retries failed KPI task executions
 */
@Injectable()
export class AutoRetryService {
  private readonly logger = new Logger(AutoRetryService.name)

  constructor(
    @Inject("ScheduledTaskResultRepository")
    private readonly taskRepository: ScheduledTaskResultRepository,
    @Inject("OracleRegistryRepository")
    private readonly registryRepository: OracleRegistryRepository,
    @Inject("SchedulerConfigRepository")
    private readonly configRepository: SchedulerConfigRepository,
    private readonly executionService: OracleExecutionService,
  ) {}

  /**
   * Process all failed tasks and retry eligible ones
   * Called by SchedulerService on each cron execution
   */
  async processFailedTasks(): Promise<void> {
    const config = await this.configRepository.getOrCreateDefault()

    if (!config.enabled) {
      this.logger.debug("Scheduler disabled, skipping auto-retry")
      return
    }

    const maxRetries = this.getMaxRetriesFromEnv()

    // Find all failed tasks
    const failedTasks = await this.taskRepository.findFailedTasksForRetry()

    if (failedTasks.length === 0) {
      this.logger.debug("No failed tasks to retry")
      return
    }

    this.logger.log(`Found ${failedTasks.length} failed tasks, evaluating for retry`)

    let retriedCount = 0
    let skippedCount = 0

    for (const taskResult of failedTasks) {
      try {
        // Check if task can be retried
        if (!taskResult.canRetry(maxRetries)) {
          this.logger.debug(
            `Task ${taskResult.id} exhausted retries ` + `(${taskResult.retryCount}/${maxRetries}), skipping`,
          )
          skippedCount++
          continue
        }

        // Load registry
        const registry = await this.registryRepository.findById(taskResult.oracleRegistryId)
        if (!registry) {
          this.logger.warn(`Registry ${taskResult.oracleRegistryId} not found for task ${taskResult.id}`)
          skippedCount++
          continue
        }

        // Retry the task
        this.logger.log(
          `Auto-retrying task ${taskResult.id} for project ${taskResult.projectId} ` +
            `(attempt ${taskResult.retryCount + 1}/${maxRetries})`,
        )

        await this.executionService.retryTask(taskResult, registry, maxRetries)
        retriedCount++
      } catch (error) {
        this.logger.error(
          `Failed to auto-retry task ${taskResult.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
        // Continue with next task
      }
    }

    this.logger.log(`Auto-retry processing completed: ${retriedCount} retried, ${skippedCount} skipped`)
  }

  /**
   * Get max retries from environment variable
   * Default: 3
   */
  private getMaxRetriesFromEnv(): number {
    const envValue = process.env.RETRY_MAX_ATTEMPTS
    if (!envValue) {
      return 3
    }

    const parsed = parseInt(envValue, 10)
    if (isNaN(parsed) || parsed < 0) {
      this.logger.warn(`Invalid RETRY_MAX_ATTEMPTS value: ${envValue}, using default: 3`)
      return 3
    }

    return parsed
  }
}
