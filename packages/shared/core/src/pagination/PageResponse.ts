// SPDX-License-Identifier: Apache-2.0

import { QueryPageResponse } from "src/query/QueryPageResponse"
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "Page" })
export class PageResponse<T> {
  @ApiProperty({ description: "Items of this page" })
  items: T[]

  @ApiProperty({ description: "Total number of elements", example: 100 })
  total: number

  @ApiProperty({ description: "Page number starting in 1", example: 1 })
  page: number

  @ApiProperty({ description: "Number of elements returned in a page", example: 25 })
  limit: number

  @ApiProperty({ description: "Total number of pages", example: 10 })
  totalPages: number

  static fromQueryPageResponse<T, R>(page: QueryPageResponse<T>, transform: (item: T) => R): PageResponse<R> {
    const response = new PageResponse<R>()
    response.items = page.items.map(transform)
    response.total = page.total
    response.page = page.page
    response.limit = page.limit
    response.totalPages = page.totalPages
    return response
  }
}
