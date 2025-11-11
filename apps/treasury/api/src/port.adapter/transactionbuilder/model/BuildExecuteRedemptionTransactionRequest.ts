// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, ValidateNested, IsOptional, IsInt, Min } from "class-validator"
import { Type } from "class-transformer"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"

export class BuildExecuteRedemptionTransactionRequest extends BaseBuildTransactionRequest {
  @IsNotEmpty()
  bondContractId: string

  @IsOptional()
  @IsInt()
  @Min(1)
  maxBatchSize?: number

  @ValidateNested()
  @Type(() => TransactionPageOptionsRequest)
  pageOptions: TransactionPageOptionsRequest
}
