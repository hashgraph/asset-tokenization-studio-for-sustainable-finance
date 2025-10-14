// SPDX-License-Identifier: Apache-2.0

import { QueryPageOptions } from "./QueryPageOptions"
import { QueryOrderPageOptions } from "./QueryOrderPageOptions"
import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"

export class QueryPageRequest {
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

  static readonly DEFAULT: QueryPageRequest = (() => {
    const instance = new QueryPageRequest()
    instance.page = 1
    instance.limit = 10
    instance.orderBy = "createdAt"
    instance.order = "DESC"
    return instance
  })()
}
