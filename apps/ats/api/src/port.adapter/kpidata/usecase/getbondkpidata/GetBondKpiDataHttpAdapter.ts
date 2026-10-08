// SPDX-License-Identifier: Apache-2.0
import { Inject, PageOptionsRequest, PageResponse, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondKpiDataPort } from "@port/kpidata/usecase/getbondkpidata/GetBondKpiDataPort"
import { GetBondKpiDataQuery } from "@app/kpidata/getbondkpidata/query/GetBondKpiDataQuery"
import { BondKpiDataResponse } from "@port/kpidata/usecase/getbondkpidata/model/BondKpiDataResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondKpiDataHttpAdapter implements GetBondKpiDataPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get paginated KPI data points for a bond" })
  @ApiResponse({ status: 200, type: BondKpiDataResponse, isArray: true })
  @Get("/:bondContractId/kpi/data")
  async getBondKpiData(
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondKpiDataResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondKpiDataQuery(bondContractId, queryPageOptions))
  }
}
