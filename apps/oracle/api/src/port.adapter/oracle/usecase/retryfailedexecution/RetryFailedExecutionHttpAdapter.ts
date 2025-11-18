// SPDX-License-Identifier: Apache-2.0
import { Controller, Post, Param } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { RetryFailedExecutionCommand } from "@app/oracle/retryfailedexecution/command/RetryFailedExecutionCommand";
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult";

@ApiTags("Execution History")
@Controller("oracle/registries/:registryId/executions")
export class RetryFailedExecutionHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(":executionId/retry")
  @ApiOperation({ summary: "Retry a failed execution" })
  @ApiParam({ name: "registryId", type: "string" })
  @ApiParam({ name: "executionId", type: "string" })
  @ApiResponse({ status: 200, description: "Execution retried" })
  async retryFailedExecution(
    @Param("registryId") registryId: string,
    @Param("executionId") executionId: string,
  ): Promise<ScheduledTaskResult> {
    const command = new RetryFailedExecutionCommand(registryId, executionId);
    return await this.commandBus.execute(command);
  }
}
