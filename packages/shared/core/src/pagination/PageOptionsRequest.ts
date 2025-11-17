// SPDX-License-Identifier: Apache-2.0

import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"
import { QueryOrderPageOptions } from "src/query/QueryOrderPageOptions"
import { QueryPageOptions } from "src/query/QueryPageOptions"

export class PageOptionsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10

  @IsOptional()
  @IsString()
  orderBy: string = "createdAt"

  @IsOptional()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  order: string = "DESC"

  toQueryPageOptions(): QueryPageOptions {
    return new QueryPageOptions(
      this.page,
      this.limit,
      new QueryOrderPageOptions(this.order as "asc" | "desc" | "ASC" | "DESC", this.orderBy),
    )
  }

  static readonly DEFAULT: PageOptionsRequest = (() => {
    const instance = new PageOptionsRequest()
    instance.page = 1
    instance.limit = 10
    instance.orderBy = "createdAt"
    instance.order = "DESC"
    return instance
  })()
}
