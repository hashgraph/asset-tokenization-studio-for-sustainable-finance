// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ArrayMinSize, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator"

export class ExecuteDistributionByAddressesTransactionRequest extends BaseTransactionRequest {
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly maxBatchSize?: number

  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  holdersAccountIds: string[]
}
