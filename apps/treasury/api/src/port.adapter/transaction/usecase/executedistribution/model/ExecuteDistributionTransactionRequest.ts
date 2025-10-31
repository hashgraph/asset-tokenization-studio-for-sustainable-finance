// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsOptional, Min } from "class-validator"

export class ExecuteDistributionTransactionRequest extends BaseTransactionRequest {
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly maxBatchSize?: number
}
