// SPDX-License-Identifier: Apache-2.0
import { Patch, Param, Body } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { UpdateOracleRegistryRequest } from "./model/UpdateOracleRegistryRequest"
import { UpdateOracleRegistryCommand } from "@app/oracle/updateoracleregistry/command/UpdateOracleRegistryCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryResponse } from "../getoracleregistry/model/OracleRegistryResponse"
import { Project } from "@domain/oracle/model/Project"

@RestController("oracle/registries")
export class UpdateOracleRegistryHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Patch(":id")
  async updateOracleRegistry(
    @Param("id") id: string,
    @Body() request: UpdateOracleRegistryRequest,
  ): Promise<OracleRegistryResponse> {
    const command = new UpdateOracleRegistryCommand(
      id,
      request.schedulerStartDate ? new Date(request.schedulerStartDate) : undefined,
      request.schedulerEndDate !== undefined
        ? request.schedulerEndDate
          ? new Date(request.schedulerEndDate)
          : null
        : undefined,
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
