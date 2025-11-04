// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ArrayMinSize, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator"

export class BuildExecuteBondRedemptionByAddressesTransactionRequest extends BaseBuildTransactionRequest {
  @IsNotEmpty()
  bondContractId: string

  @IsInt()
  @Min(1)
  @IsOptional()
  maxBatchSize?: number

  @ArrayMinSize(1)
  @IsOptional()
  holdersAccountIds?: string[]
}
