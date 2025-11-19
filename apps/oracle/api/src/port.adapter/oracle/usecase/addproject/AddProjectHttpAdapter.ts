// SPDX-License-Identifier: Apache-2.0
import { Post, Param, Body } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { AddProjectRequest } from "./model/AddProjectRequest"
import { AddProjectCommand } from "@app/oracle/addproject/command/AddProjectCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@RestController("oracle/registries")
export class AddProjectHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Post(":id/projects")
  async addProject(@Param("id") id: string, @Body() request: AddProjectRequest): Promise<OracleRegistry> {
    const command = new AddProjectCommand(id, request.projectId, request.topicId)
    return await this.commandBus.execute(command)
  }
}
