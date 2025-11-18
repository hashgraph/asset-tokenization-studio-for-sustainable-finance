// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleExecutionService } from "@domain/oracle/services/OracleExecutionService";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly isEnabled: boolean;
  private readonly cronExpression: string;
  private readonly concurrencyLimit: number;

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly registryRepository: OracleRegistryRepository,
    private readonly executionService: OracleExecutionService,
  ) {
    this.isEnabled = process.env.SCHEDULER_ENABLED === "true";
    this.cronExpression =
      process.env.SCHEDULER_CRON_EXPRESSION || "*/5 * * * *"; // Every 5 minutes by default
    this.concurrencyLimit = parseInt(
      process.env.SCHEDULER_CONCURRENCY_LIMIT || "5",
      10,
    );

    this.logger.log(
      `SchedulerService initialized. Enabled: ${this.isEnabled}, Cron: ${this.cronExpression}`,
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES) // This will be overridden by dynamic cron if needed
  async handleScheduledExecution() {
    if (!this.isEnabled) {
      this.logger.debug("Scheduler is disabled, skipping execution");
      return;
    }

    this.logger.log("Starting scheduled KPI execution");

    try {
      // Find all active registries that should execute now
      const registries =
        await this.registryRepository.findActiveForExecution();

      if (registries.length === 0) {
        this.logger.log("No oracle registries to execute");
        return;
      }

      this.logger.log(
        `Found ${registries.length} oracle registries to execute`,
      );

      // Execute all registries
      for (const registry of registries) {
        try {
          await this.executeRegistry(registry.id);
        } catch (error) {
          this.logger.error(
            `Failed to execute registry ${registry.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          // Continue with next registry
        }
      }

      this.logger.log("Scheduled execution completed");
    } catch (error) {
      this.logger.error(
        `Scheduler error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async executeRegistry(registryId: string): Promise<void> {
    this.logger.log(`Executing oracle registry ${registryId}`);

    const registry = await this.registryRepository.findById(registryId);
    if (!registry) {
      this.logger.warn(`Registry ${registryId} not found`);
      return;
    }

    if (!registry.canExecute()) {
      this.logger.warn(`Registry ${registryId} cannot execute at this time`);
      return;
    }

    const scheduledTime = new Date();
    const projects = registry.projects;

    this.logger.log(
      `Executing ${projects.length} projects for registry ${registryId}`,
    );

    // Execute projects with concurrency control
    const chunks = this.chunkArray(projects, this.concurrencyLimit);

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map((project) =>
          this.executionService.executeProjectTask(
            registry,
            project,
            scheduledTime,
          ),
        ),
      );
    }

    // Update next execution date using the registry's own frequency
    const nextExecutionDate = registry.config.calculateNextExecutionDate(scheduledTime);
    registry.updateNextExecutionDate(nextExecutionDate);
    await this.registryRepository.save(registry);

    this.logger.log(
      `Registry ${registryId} execution completed. Next execution: ${nextExecutionDate.toISOString()} (frequency: ${registry.config.frequencyMinutes} minutes)`,
    );
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
