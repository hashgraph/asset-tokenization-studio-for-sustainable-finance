// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetOracleRegistryQuery } from "@app/oracle/getoracleregistry/query/GetOracleRegistryQuery"
import { OracleRegistryResponse } from "./model/OracleRegistryResponse"

@RestController("oracle/registries")
export class GetOracleRegistryHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":id")
  async getOracleRegistry(@Param("id") id: string): Promise<OracleRegistryResponse> {
    return await this.queryBus.execute(new GetOracleRegistryQuery(id))
  }
}
