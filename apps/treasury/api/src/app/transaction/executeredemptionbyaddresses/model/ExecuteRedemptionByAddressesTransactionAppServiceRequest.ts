// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { ArrayMinSize, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator"

export class ExecuteRedemptionByAddressesTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly maxBatchSize?: number

  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  holdersAccountIds: string[]

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    maxBatchSize: number,
    holdersAccountIds: string[],
  ) {
    super(format, accountId, contractId)
    this.maxBatchSize = maxBatchSize
    this.holdersAccountIds = holdersAccountIds
  }
}
