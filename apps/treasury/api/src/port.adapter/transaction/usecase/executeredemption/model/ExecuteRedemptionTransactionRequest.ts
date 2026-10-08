// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsOptional, IsInt, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ExecuteRedemptionTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description:
      "Maximum number of holders that will be paid in a batch (transaction). " +
      "Configuration value MAX_BATCH_SIZE from env variables will be used if the property is not defined",
    example: "15",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxBatchSize?: number
}
