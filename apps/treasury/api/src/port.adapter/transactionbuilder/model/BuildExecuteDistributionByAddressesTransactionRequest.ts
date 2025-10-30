// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsNotEmpty, IsOptional, Min, ArrayMinSize } from "class-validator"

export class BuildExecuteDistributionByAddressesTransactionRequest extends BaseBuildTransactionRequest {
  @IsInt()
  @Min(1)
  distributionId: number

  @IsInt()
  @IsOptional()
  @Min(1)
  maxBatchSize?: number

  @IsNotEmpty()
  bondContractId: string

  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  holdersAccountIds: string[]
}
