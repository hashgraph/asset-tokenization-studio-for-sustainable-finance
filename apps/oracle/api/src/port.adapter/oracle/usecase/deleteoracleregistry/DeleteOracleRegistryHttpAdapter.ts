// SPDX-License-Identifier: Apache-2.0
import { Delete, Param, HttpCode, HttpStatus } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { DeleteOracleRegistryCommand } from "@app/oracle/deleteoracleregistry/command/DeleteOracleRegistryCommand"

@RestController("oracle/registries")
export class DeleteOracleRegistryHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Delete(":id")
  async deleteOracleRegistry(@Param("id") id: string): Promise<void> {
    const command = new DeleteOracleRegistryCommand(id)
    await this.commandBus.execute(command)
  }
}
