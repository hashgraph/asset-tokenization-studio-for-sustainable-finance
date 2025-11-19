// SPDX-License-Identifier: Apache-2.0
import { Delete, Param } from "@nestjs/common"
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { RemoveProjectCommand } from "@app/oracle/removeproject/command/RemoveProjectCommand"

@RestController("oracle/registries")
export class RemoveProjectHttpAdapter {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Delete(":id/projects/:projectId")
  async removeProject(@Param("id") id: string, @Param("projectId") projectId: string): Promise<void> {
    const command = new RemoveProjectCommand(id, projectId)
    await this.commandBus.execute(command)
  }
}
