// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsOptional, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ExecuteDistributionTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description:
      "Maximum number of holders that will be paid in a batch (transaction). " +
      "Configuration value MAX_BATCH_SIZE from env variables will be used if the property is not defined",
    example: "15",
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly maxBatchSize?: number
}
