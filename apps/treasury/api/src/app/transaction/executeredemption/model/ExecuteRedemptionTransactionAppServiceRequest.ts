// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest, QueryPageOptions } from "@hashgraph/green-bonds-shared-core"
import { ValidateNested, IsOptional, IsInt, Min } from "class-validator"
import { Type } from "class-transformer"

export class ExecuteRedemptionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly maxBatchSize?: number

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    pageOptions: QueryPageOptions,
    maxBatchSize?: number,
  ) {
    super(format, accountId, contractId)
    this.maxBatchSize = maxBatchSize
    this.pageOptions = pageOptions
  }
}
