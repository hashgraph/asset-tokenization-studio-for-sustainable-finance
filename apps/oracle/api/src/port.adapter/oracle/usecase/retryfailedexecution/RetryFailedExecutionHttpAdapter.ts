// SPDX-License-Identifier: Apache-2.0
import { Controller, Post, Param } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { RetryFailedExecutionCommand } from "@app/oracle/retryfailedexecution/command/RetryFailedExecutionCommand"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"

@Controller("oracle/registries/:registryId/executions")
export class RetryFailedExecutionHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(":executionId/retry")
  async retryFailedExecution(
    @Param("registryId") registryId: string,
    @Param("executionId") executionId: string,
  ): Promise<ScheduledTaskResult> {
    const command = new RetryFailedExecutionCommand(registryId, executionId)
    return await this.commandBus.execute(command)
  }
}
