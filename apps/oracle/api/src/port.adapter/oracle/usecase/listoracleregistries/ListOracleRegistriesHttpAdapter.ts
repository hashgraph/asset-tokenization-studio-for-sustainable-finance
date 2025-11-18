// SPDX-License-Identifier: Apache-2.0
import { Controller, Get, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ListOracleRegistriesQuery } from "@app/oracle/listoracleregistries/query/ListOracleRegistriesQuery";
import { ListOracleRegistriesResponse } from "@app/oracle/listoracleregistries/query/ListOracleRegistriesQueryHandler";

@ApiTags("Oracle Registry")
@Controller("oracle/registries")
export class ListOracleRegistriesHttpAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "List all oracle registries" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "List of oracle registries" })
  async listOracleRegistries(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ): Promise<ListOracleRegistriesResponse> {
    const query = new ListOracleRegistriesQuery(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return await this.queryBus.execute(query);
  }
}
