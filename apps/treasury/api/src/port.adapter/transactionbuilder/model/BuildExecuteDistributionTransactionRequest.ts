// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsNotEmpty, IsOptional, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { TransactionPageOptionsRequest } from "@port/shared/model/TransactionPageOptionsRequest"

export class BuildExecuteDistributionTransactionRequest extends BaseBuildTransactionRequest {
  @IsInt()
  @Min(1)
  distributionId: number

  @IsInt()
  @IsOptional()
  @Min(1)
  maxBatchSize?: number

  @IsNotEmpty()
  bondContractId: string

  @ValidateNested()
  @Type(() => TransactionPageOptionsRequest)
  pageOptions: TransactionPageOptionsRequest
}
