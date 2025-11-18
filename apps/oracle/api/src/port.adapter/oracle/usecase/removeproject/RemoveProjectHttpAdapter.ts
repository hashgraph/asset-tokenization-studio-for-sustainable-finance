// SPDX-License-Identifier: Apache-2.0
import { Controller, Delete, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { RemoveProjectCommand } from "@app/oracle/removeproject/command/RemoveProjectCommand";

@ApiTags("Oracle Registry")
@Controller("oracle/registries")
export class RemoveProjectHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(":id/projects/:projectId")
  @ApiOperation({ summary: "Remove project from oracle registry" })
  @ApiParam({ name: "id", type: "string" })
  @ApiParam({ name: "projectId", type: "string" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProject(
    @Param("id") id: string,
    @Param("projectId") projectId: string,
  ): Promise<void> {
    const command = new RemoveProjectCommand(id, projectId);
    await this.commandBus.execute(command);
  }
}
