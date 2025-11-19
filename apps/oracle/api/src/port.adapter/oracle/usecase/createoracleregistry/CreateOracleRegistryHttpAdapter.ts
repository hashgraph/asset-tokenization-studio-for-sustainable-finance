// SPDX-License-Identifier: Apache-2.0
import { Post, Body } from "@nestjs/common"
import { RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { CreateOracleRegistryRequest } from "./model/CreateOracleRegistryRequest"
import { CreateOracleRegistryCommand } from "@app/oracle/createoracleregistry/command/CreateOracleRegistryCommand"
import { OracleRegistryResponse } from "../getoracleregistry/model/OracleRegistryResponse"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { Project } from "@domain/oracle/model/Project"

@RestController("oracle/registries")
export class CreateOracleRegistryHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Post()
  async createOracleRegistry(@Body() request: CreateOracleRegistryRequest): Promise<OracleRegistryResponse> {
    const command = new CreateOracleRegistryCommand(
      request.bondContractId,
      request.kpiContractId,
      request.projects,
      new Date(request.schedulerStartDate),
      request.schedulerEndDate ? new Date(request.schedulerEndDate) : null,
      request.frequencyMinutes,
    )
    const registry = (await this.commandBus.execute(command)) as OracleRegistry

    return {
      id: registry.id,
      bondContractId: registry.bondContractId,
      kpiContractId: registry.kpiContractId,
      projects: registry.projects.map((p: Project) => ({
        projectId: p.projectId,
        topicId: p.topicId,
      })),
      config: {
        schedulerStartDate: registry.config.schedulerStartDate,
        schedulerEndDate: registry.config.schedulerEndDate,
        frequencyMinutes: registry.config.frequencyMinutes,
      },
      status: registry.status,
      createdAt: registry.createdAt,
      updatedAt: registry.updatedAt,
    }
  }
}
