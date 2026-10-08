// SPDX-License-Identifier: Apache-2.0

import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"
import { QueryOrderPageOptions } from "src/query/QueryOrderPageOptions"
import { QueryPageOptions } from "src/query/QueryPageOptions"
import { ApiProperty } from "@nestjs/swagger"

export class PageOptionsRequest {
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
  limit: number = 10

  @ApiProperty({ description: "Field to order results", example: "createdAt", default: "createdAt", required: false })
  @IsOptional()
  @IsString()
  orderBy: string = "createdAt"

  @ApiProperty({
    description: "Order Direction",
    example: "asc",
    enum: ["ASC", "DESC", "asc", "desc"],
    default: "desc",
    required: false,
  })
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
