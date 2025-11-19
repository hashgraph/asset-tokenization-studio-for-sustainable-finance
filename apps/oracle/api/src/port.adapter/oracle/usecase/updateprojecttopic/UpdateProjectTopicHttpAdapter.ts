// SPDX-License-Identifier: Apache-2.0
import { Patch, Param, Body } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { UpdateProjectTopicRequest } from "./model/UpdateProjectTopicRequest"
import { UpdateProjectTopicCommand } from "@app/oracle/updateprojecttopic/command/UpdateProjectTopicCommand"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@RestController("oracle/registries")
export class UpdateProjectTopicHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

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
