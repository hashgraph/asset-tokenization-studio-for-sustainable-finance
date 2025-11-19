// SPDX-License-Identifier: Apache-2.0
import { Patch, Param, Body } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { UpdateFrequencyRequest } from "./model/UpdateFrequencyRequest"
import { UpdateOracleRegistryCommand } from "@app/oracle/updateoracleregistry/command/UpdateOracleRegistryCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@RestController("oracle/registries")
export class UpdateFrequencyHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Patch(":id/frequency")
  async updateFrequency(@Param("id") id: string, @Body() request: UpdateFrequencyRequest): Promise<OracleRegistry> {
    const command = new UpdateOracleRegistryCommand(id, undefined, undefined, request.frequencyMinutes)
    return await this.commandBus.execute(command)
  }
}
