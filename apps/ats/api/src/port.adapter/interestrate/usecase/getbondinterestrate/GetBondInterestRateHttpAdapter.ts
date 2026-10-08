// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetBondInterestRatePort } from "@port/interestrate/usecase/getbondinterestrate/GetBondInterestRatePort"
import { GetBondInterestRateQuery } from "@app/interestrate/getbondinterestrate/query/GetBondInterestRateQuery"
import { BondInterestRateResponse } from "@port/interestrate/usecase/getbondinterestrate/model/BondInterestRateResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondInterestRateHttpAdapter implements GetBondInterestRatePort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get interest rate configuration for a KPI-linked bond" })
  @ApiResponse({ status: 200, type: BondInterestRateResponse })
  @Get("/:bondContractId/kpi/interest-rate")
  async getBondInterestRate(@Param("bondContractId") bondContractId: string): Promise<BondInterestRateResponse> {
    return await this.queryBus.execute(new GetBondInterestRateQuery(bondContractId))
  }
}
