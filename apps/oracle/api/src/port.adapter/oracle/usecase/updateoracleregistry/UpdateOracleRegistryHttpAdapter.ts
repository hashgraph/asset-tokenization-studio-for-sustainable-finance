// SPDX-License-Identifier: Apache-2.0
import { Controller, Patch, Param, Body } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { UpdateOracleRegistryRequest } from "./model/UpdateOracleRegistryRequest"
import { UpdateOracleRegistryCommand } from "@app/oracle/updateoracleregistry/command/UpdateOracleRegistryCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@Controller("oracle/registries")
export class UpdateOracleRegistryHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(":id")
  async updateOracleRegistry(
    @Param("id") id: string,
    @Body() request: UpdateOracleRegistryRequest,
  ): Promise<OracleRegistry> {
    const command = new UpdateOracleRegistryCommand(
      id,
      request.schedulerStartDate ? new Date(request.schedulerStartDate) : undefined,
      request.schedulerEndDate !== undefined
        ? request.schedulerEndDate
          ? new Date(request.schedulerEndDate)
          : null
        : undefined,
    )
    return await this.commandBus.execute(command)
  }
}
