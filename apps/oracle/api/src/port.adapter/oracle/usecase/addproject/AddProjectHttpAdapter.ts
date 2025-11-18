// SPDX-License-Identifier: Apache-2.0
import { Controller, Post, Param, Body } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { AddProjectRequest } from "./model/AddProjectRequest";
import { AddProjectCommand } from "@app/oracle/addproject/command/AddProjectCommand";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@ApiTags("Oracle Registry")
@Controller("oracle/registries")
export class AddProjectHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(":id/projects")
  @ApiOperation({ summary: "Add project to oracle registry" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, description: "Project added" })
  async addProject(
    @Param("id") id: string,
    @Body() request: AddProjectRequest,
  ): Promise<OracleRegistry> {
    const command = new AddProjectCommand(id, request.projectId, request.topicId);
    return await this.commandBus.execute(command);
  }
}
