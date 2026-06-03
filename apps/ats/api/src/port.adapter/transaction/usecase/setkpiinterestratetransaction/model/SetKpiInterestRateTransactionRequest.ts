// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ValidateNested, IsNotEmpty } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { InterestRateRequest } from "@port/shared/model/KpiRequest"

export class SetKpiInterestRateTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Interest rate configuration for KPI-linked bond",
    type: InterestRateRequest,
  })
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => InterestRateRequest)
  interestRate: InterestRateRequest
}
