// SPDX-License-Identifier: Apache-2.0
import { Controller, Get, Param } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { GetOracleRegistryQuery } from "@app/oracle/getoracleregistry/query/GetOracleRegistryQuery";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@ApiTags("Oracle Registry")
@Controller("oracle/registries")
export class GetOracleRegistryHttpAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(":id")
  @ApiOperation({ summary: "Get oracle registry by ID" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, description: "Oracle registry found" })
  async getOracleRegistry(@Param("id") id: string): Promise<OracleRegistry> {
    const query = new GetOracleRegistryQuery(id);
    return await this.queryBus.execute(query);
  }
}
