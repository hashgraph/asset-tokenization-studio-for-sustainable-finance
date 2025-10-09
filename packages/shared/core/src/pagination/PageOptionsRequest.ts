// SPDX-License-Identifier: Apache-2.0

import { PageOptions } from "./PageOptions"
import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"

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

  toPageOptions(): PageOptions {
    return {
      page: this.page,
      limit: this.limit,
      order: {
        orderBy: this.orderBy,
        order: this.order as "asc" | "desc" | "ASC" | "DESC",
      },
    }
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
