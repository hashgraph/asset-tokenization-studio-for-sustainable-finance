// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondKpiDataItemPort } from "@port/kpidata/usecase/getbondkpidataitem/GetBondKpiDataItemPort"
import { GetBondKpiDataItemQuery } from "@app/kpidata/getbondkpidataitem/query/GetBondKpiDataItemQuery"
import { BondKpiDataItemResponse } from "@port/kpidata/usecase/getbondkpidataitem/model/BondKpiDataItemResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondKpiDataItemHttpAdapter implements GetBondKpiDataItemPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get a single KPI data point by ID" })
  @ApiResponse({ status: 200, type: BondKpiDataItemResponse })
  @Get("/:bondContractId/kpi/data/:kpiDataId")
  async getBondKpiDataItem(
    @Param("bondContractId") bondContractId: string,
    @Param("kpiDataId") kpiDataId: string,
  ): Promise<BondKpiDataItemResponse> {
    return await this.queryBus.execute(new GetBondKpiDataItemQuery(bondContractId, kpiDataId))
  }
}
