// SPDX-License-Identifier: Apache-2.0
import { Post, Param, Body } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { AddProjectRequest } from "./model/AddProjectRequest"
import { AddProjectCommand } from "@app/oracle/addproject/command/AddProjectCommand"
import type { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryResponse } from "../getoracleregistry/model/OracleRegistryResponse"
import type { Project } from "@domain/oracle/model/Project"

@RestController("oracle/registries")
export class AddProjectHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Post(":id/projects")
  async addProject(@Param("id") id: string, @Body() request: AddProjectRequest): Promise<OracleRegistryResponse> {
    const command = new AddProjectCommand(id, request.projectId, request.topicId)
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
