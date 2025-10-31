// SPDX-License-Identifier: Apache-2.0

import { IsOptional } from "class-validator"

export class TransactionPageOptionsRequest {
  @IsOptional()
  page: number = 1

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
