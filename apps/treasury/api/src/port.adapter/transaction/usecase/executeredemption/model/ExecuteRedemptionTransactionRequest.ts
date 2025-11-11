// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsOptional, IsInt, Min } from "class-validator"

export class ExecuteRedemptionTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsInt()
  @Min(1)
  maxBatchSize?: number
}
