// SPDX-License-Identifier: Apache-2.0
import { Controller, Patch, Param, Body } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { UpdateFrequencyRequest } from "./model/UpdateFrequencyRequest";
import { UpdateFrequencyCommand } from "@app/oracle/updatefrequency/command/UpdateFrequencyCommand";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@ApiTags("Oracle Registry")
@Controller("oracle/registries")
export class UpdateFrequencyHttpAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(":id/frequency")
  @ApiOperation({ summary: "Update execution frequency" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, description: "Frequency updated" })
  async updateFrequency(
    @Param("id") id: string,
    @Body() request: UpdateFrequencyRequest,
  ): Promise<OracleRegistry> {
    const command = new UpdateFrequencyCommand(id, request.frequencyMinutes);
    return await this.commandBus.execute(command);
  }
}
