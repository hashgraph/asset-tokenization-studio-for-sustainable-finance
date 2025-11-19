// SPDX-License-Identifier: Apache-2.0
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common"
import { RetryFailedExecutionCommand } from "./RetryFailedExecutionCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import type { ScheduledTaskRepository } from "@domain/oracle/repositories/ScheduledTaskRepository"
import { OracleExecutionService } from "@domain/oracle/services/OracleExecutionService"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { CommandHandler, Handler, Inject } from "@hashgraph/green-bonds-shared-core"

@Handler(RetryFailedExecutionCommand)
export class RetryFailedExecutionCommandHandler
  implements CommandHandler<RetryFailedExecutionCommand, ScheduledTaskResult>
{
  private readonly logger = new Logger(RetryFailedExecutionCommandHandler.name)
  private readonly maxRetries: number

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly registryRepository: OracleRegistryRepository,
    @Inject("ScheduledTaskRepository")
    private readonly taskRepository: ScheduledTaskRepository,
    private readonly executionService: OracleExecutionService,
  ) {
    this.maxRetries = parseInt(process.env.RETRY_MAX_ATTEMPTS || "3", 10)
  }

  async execute(command: RetryFailedExecutionCommand): Promise<ScheduledTaskResult> {
    this.logger.log(`Retrying execution ${command.executionId}`)

    // Find registry
    const oracleRegistry = await this.registryRepository.findById(command.registryId)
    if (!oracleRegistry) {
      throw new NotFoundException(`Oracle registry ${command.registryId} not found`)
    }

    // Find task result
    const taskResult = await this.taskRepository.findById(command.executionId)
    if (!taskResult) {
      throw new NotFoundException(`Execution ${command.executionId} not found`)
    }

    // Verify task belongs to registry
    if (taskResult.oracleRegistryId !== command.registryId) {
      throw new BadRequestException(
        `Execution ${command.executionId} does not belong to registry ${command.registryId}`,
      )
    }

    // Retry task
    return await this.executionService.retryTask(taskResult, oracleRegistry, this.maxRetries)
  }
}
