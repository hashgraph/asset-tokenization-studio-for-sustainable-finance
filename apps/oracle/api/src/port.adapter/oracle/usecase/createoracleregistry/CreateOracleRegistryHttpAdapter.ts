// SPDX-License-Identifier: Apache-2.0
import { Post, Body } from "@nestjs/common"
import { RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { CreateOracleRegistryRequest } from "./model/CreateOracleRegistryRequest"
import { CreateOracleRegistryCommand } from "@app/oracle/createoracleregistry/command/CreateOracleRegistryCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@RestController("oracle/registries")
export class CreateOracleRegistryHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Post()
  async createOracleRegistry(@Body() request: CreateOracleRegistryRequest): Promise<OracleRegistry> {
    const command = new CreateOracleRegistryCommand(
      request.bondContractId,
      request.kpiContractId,
      request.projects,
      new Date(request.schedulerStartDate),
      request.schedulerEndDate ? new Date(request.schedulerEndDate) : null,
      request.frequencyMinutes,
    )
    return await this.commandBus.execute(command)
  }
}
