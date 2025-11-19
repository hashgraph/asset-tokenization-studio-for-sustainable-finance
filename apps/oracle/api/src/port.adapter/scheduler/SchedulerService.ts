// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { SchedulerRegistry } from "@nestjs/schedule"
import { CronJob } from "cron"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import type { SchedulerConfigRepository } from "@domain/scheduler/repositories/SchedulerConfigRepository"
import { OracleExecutionService } from "@domain/oracle/services/OracleExecutionService"
import { SchedulerConfig } from "@domain/scheduler/model/SchedulerConfig"

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name)
  private readonly CRON_JOB_NAME = "oracle-kpi-execution"

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly registryRepository: OracleRegistryRepository,
    @Inject("SchedulerConfigRepository")
    private readonly configRepository: SchedulerConfigRepository,
    private readonly executionService: OracleExecutionService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    const config = await this.configRepository.getOrCreateDefault()
    this.logger.log(
      `SchedulerService initialized. Enabled: ${config.enabled}, Cron: ${config.cronExpression}, Concurrency: ${config.concurrencyLimit}`,
    )

    if (config.enabled) {
      this.startCronJob(config.cronExpression)
    }
  }

  async updateCronExpression(cronExpression: string): Promise<SchedulerConfig> {
    const config = await this.configRepository.getOrCreateDefault()
    config.updateCronExpression(cronExpression)
    const savedConfig = await this.configRepository.save(config)

    // Restart cron with new expression
    if (config.enabled) {
      this.restartCronJob(cronExpression)
    }

    this.logger.log(`Cron expression updated to: ${cronExpression}`)
    return savedConfig
  }

  async updateConcurrencyLimit(concurrencyLimit: number): Promise<SchedulerConfig> {
    const config = await this.configRepository.getOrCreateDefault()
    config.updateConcurrencyLimit(concurrencyLimit)
    const savedConfig = await this.configRepository.save(config)

    this.logger.log(`Concurrency limit updated to: ${concurrencyLimit}`)
    return savedConfig
  }

  async setEnabled(enabled: boolean): Promise<SchedulerConfig> {
    const config = await this.configRepository.getOrCreateDefault()
    config.setEnabled(enabled)
    const savedConfig = await this.configRepository.save(config)

    if (enabled) {
      this.startCronJob(config.cronExpression)
    } else {
      this.stopCronJob()
    }

    this.logger.log(`Scheduler ${enabled ? "enabled" : "disabled"}`)
    return savedConfig
  }

  async getConfig(): Promise<SchedulerConfig> {
    return this.configRepository.getOrCreateDefault()
  }

  private startCronJob(cronExpression: string): void {
    const job = new CronJob(cronExpression, () => this.handleScheduledExecution())
    this.schedulerRegistry.addCronJob(this.CRON_JOB_NAME, job)
    job.start()
    this.logger.log(`Cron job started with expression: ${cronExpression}`)
  }

  private stopCronJob(): void {
    try {
      const job = this.schedulerRegistry.getCronJob(this.CRON_JOB_NAME)
      job.stop()
      this.schedulerRegistry.deleteCronJob(this.CRON_JOB_NAME)
      this.logger.log("Cron job stopped")
    } catch {
      // Job doesn't exist, ignore
    }
  }

  private restartCronJob(cronExpression: string): void {
    this.stopCronJob()
    this.startCronJob(cronExpression)
  }

  async handleScheduledExecution() {
    const config = await this.configRepository.getOrCreateDefault()

    if (!config.enabled) {
      this.logger.debug("Scheduler is disabled, skipping execution")
      return
    }

    this.logger.log("Starting scheduled KPI execution")

    try {
      // Find all active registries that should execute now
      const registries = await this.registryRepository.findActiveForExecution()

      if (registries.length === 0) {
        this.logger.log("No oracle registries to execute")
        return
      }

      this.logger.log(`Found ${registries.length} oracle registries to execute`)

      // Execute all registries
      for (const registry of registries) {
        try {
          await this.executeRegistry(registry.id, config.concurrencyLimit)
        } catch (error) {
          this.logger.error(
            `Failed to execute registry ${registry.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          )
          // Continue with next registry
        }
      }

      this.logger.log("Scheduled execution completed")
    } catch (error) {
      this.logger.error(`Scheduler error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private async executeRegistry(registryId: string, concurrencyLimit: number): Promise<void> {
    this.logger.log(`Executing oracle registry ${registryId}`)

    const registry = await this.registryRepository.findById(registryId)
    if (!registry) {
      this.logger.warn(`Registry ${registryId} not found`)
      return
    }

    if (!registry.canExecute()) {
      this.logger.warn(`Registry ${registryId} cannot execute at this time`)
      return
    }

    const scheduledTime = new Date()
    const projects = registry.projects

    this.logger.log(`Executing ${projects.length} projects for registry ${registryId}`)

    // Execute projects with concurrency control
    const chunks = this.chunkArray(projects, concurrencyLimit)

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map((project) => this.executionService.executeProjectTask(registry, project, scheduledTime)),
      )
    }

    // Update next execution date using the registry's own frequency despite the execution fails
    const nextExecutionDate = registry.config.calculateNextExecutionDate(scheduledTime)
    registry.updateNextExecutionDate(nextExecutionDate)
    await this.registryRepository.save(registry)

    this.logger.log(
      `Registry ${registryId} execution completed. Next execution: ${nextExecutionDate.toISOString()} (frequency: ${registry.config.frequencyMinutes} minutes)`,
    )
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}
