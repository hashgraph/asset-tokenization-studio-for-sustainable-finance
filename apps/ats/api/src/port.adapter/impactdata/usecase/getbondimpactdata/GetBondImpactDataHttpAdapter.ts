// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondImpactDataPort } from "@port/impactdata/usecase/getbondimpactdata/GetBondImpactDataPort"
import { GetBondImpactDataQuery } from "@app/impactdata/getbondimpactdata/query/GetBondImpactDataQuery"
import { BondImpactDataResponse } from "@port/impactdata/usecase/getbondimpactdata/model/BondImpactDataResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondImpactDataHttpAdapter implements GetBondImpactDataPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get impact data configuration for a KPI-linked bond" })
  @ApiResponse({ status: 200, type: BondImpactDataResponse })
  @Get("/:bondContractId/kpi/impact-data")
  async getBondImpactData(@Param("bondContractId") bondContractId: string): Promise<BondImpactDataResponse> {
    return await this.queryBus.execute(new GetBondImpactDataQuery(bondContractId))
  }
}
