// SPDX-License-Identifier: Apache-2.0

import { IsInt, IsOptional, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { QueryPageOptions, QueryOrderPageOptions } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"

export class TransactionPageOptionsRequest {
  @ApiProperty({ description: "Page you are requesting starting in 1", example: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiProperty({ description: "Number of elements returned in a page", example: 25, default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 25

  toQueryPageOptions(): QueryPageOptions {
    return new QueryPageOptions(this.page, this.limit, QueryOrderPageOptions.DEFAULT)
  }

  getFirstBatchPageIndex(): number {
    return (this.page - 1) * this.limit
  }

  getLastBatchPageIndex(numberOfBatches: number): number {
    const lastBatchPageIndex = this.getFirstBatchPageIndex() + this.limit - 1
    const lastPageLastBatchPageIndex = numberOfBatches - 1
    return lastBatchPageIndex > lastPageLastBatchPageIndex ? lastPageLastBatchPageIndex : lastBatchPageIndex
  }
}
