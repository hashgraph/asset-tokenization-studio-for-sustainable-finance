// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"

export class RetryFailedExecutionCommand extends Command<ScheduledTaskResult> {
  @IsNotEmpty()
  @IsString()
  registryId: string

  @IsNotEmpty()
  @IsString()
  executionId: string

  constructor(registryId: string, executionId: string) {
    super()
    this.registryId = registryId
    this.executionId = executionId
  }
}
