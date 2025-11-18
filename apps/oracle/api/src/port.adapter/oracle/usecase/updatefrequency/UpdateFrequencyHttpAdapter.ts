// SPDX-License-Identifier: Apache-2.0
import { Controller, Patch, Param, Body } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { UpdateFrequencyRequest } from "./model/UpdateFrequencyRequest"
import { UpdateFrequencyCommand } from "@app/oracle/updatefrequency/command/UpdateFrequencyCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@Controller("oracle/registries")
export class UpdateFrequencyHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(":id/frequency")
  async updateFrequency(@Param("id") id: string, @Body() request: UpdateFrequencyRequest): Promise<OracleRegistry> {
    const command = new UpdateFrequencyCommand(id, request.frequencyMinutes)
    return await this.commandBus.execute(command)
  }
}
