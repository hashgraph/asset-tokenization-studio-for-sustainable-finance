// SPDX-License-Identifier: Apache-2.0

import { IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class TransactionPageOptionsRequest {
  @ApiProperty({ description: "Page you are requesting starting in 1", example: 1, default: 1, required: false })
  @IsOptional()
  page: number = 1

  @ApiProperty({ description: "Number of elements returned in a page", example: 25, default: 10, required: false })
  @IsOptional()
  limit: number = 25

  constructor(page: number, limit: number) {
    this.page = page
    this.limit = limit
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
