// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest, QueryPageOptions } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsOptional, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class ExecuteDistributionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsInt()
  @Min(1)
  readonly distributionId: number

  @IsInt()
  @IsOptional()
  @Min(1)
  readonly maxBatchSize?: number

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    distributionId: number,
    maxBatchSize: number,
    pageOptions: QueryPageOptions,
  ) {
    super(format, accountId, contractId)
    this.distributionId = distributionId
    this.maxBatchSize = maxBatchSize
    this.pageOptions = pageOptions
  }
}
