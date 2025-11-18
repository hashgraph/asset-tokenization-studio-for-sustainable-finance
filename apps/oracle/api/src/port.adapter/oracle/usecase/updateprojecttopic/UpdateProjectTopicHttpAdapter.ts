// SPDX-License-Identifier: Apache-2.0
import { Controller, Patch, Param, Body } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { UpdateProjectTopicRequest } from "./model/UpdateProjectTopicRequest"
import { UpdateProjectTopicCommand } from "@app/oracle/updateprojecttopic/command/UpdateProjectTopicCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@Controller("oracle/registries")
export class UpdateProjectTopicHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(":id/projects/:projectId/topic")
  async updateProjectTopic(
    @Param("id") id: string,
    @Param("projectId") projectId: string,
    @Body() request: UpdateProjectTopicRequest,
  ): Promise<OracleRegistry> {
    const command = new UpdateProjectTopicCommand(id, projectId, request.topicId)
    return await this.commandBus.execute(command)
  }
}
