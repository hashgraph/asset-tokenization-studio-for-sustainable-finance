// SPDX-License-Identifier: Apache-2.0
import { Post, Param } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { RetryFailedExecutionCommand } from "@app/oracle/retryfailedexecution/command/RetryFailedExecutionCommand"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"

@RestController("oracle/registries/:registryId/executions")
export class RetryFailedExecutionHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Post(":executionId/retry")
  async retryFailedExecution(
    @Param("registryId") registryId: string,
    @Param("executionId") executionId: string,
  ): Promise<ScheduledTaskResult> {
    const command = new RetryFailedExecutionCommand(registryId, executionId)
    return await this.commandBus.execute(command)
  }
}
