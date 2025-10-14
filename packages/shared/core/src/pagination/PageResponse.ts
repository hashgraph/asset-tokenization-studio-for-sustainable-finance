// SPDX-License-Identifier: Apache-2.0

import { QueryPageResponse } from "src/query/QueryPageResponse"

export class PageResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
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
