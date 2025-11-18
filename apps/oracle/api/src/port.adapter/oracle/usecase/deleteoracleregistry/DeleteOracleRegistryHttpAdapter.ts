// SPDX-License-Identifier: Apache-2.0
import { Controller, Delete, Param, HttpCode, HttpStatus } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeleteOracleRegistryCommand } from "@app/oracle/deleteoracleregistry/command/DeleteOracleRegistryCommand"

@Controller("oracle/registries")
export class DeleteOracleRegistryHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOracleRegistry(@Param("id") id: string): Promise<void> {
    const command = new DeleteOracleRegistryCommand(id)
    await this.commandBus.execute(command)
  }
}
