// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ValidateNested, IsNotEmpty } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { ImpactDataRequest } from "@port/shared/model/KpiRequest"

export class SetKpiImpactDataTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Impact data configuration for KPI measurement",
    type: ImpactDataRequest,
  })
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => ImpactDataRequest)
  impactData: ImpactDataRequest
}
