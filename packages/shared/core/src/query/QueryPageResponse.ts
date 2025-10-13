// SPDX-License-Identifier: Apache-2.0

import { QueryPageable } from "./QueryPageable"

export class QueryPageResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number

  static fromPage<T, R>(page: QueryPageable<T>, transform: (item: T) => R): QueryPageResponse<R> {
    const response = new QueryPageResponse<R>()
    response.items = page.items.map(transform)
    response.total = page.total
    response.page = page.page
    response.limit = page.limit
    response.totalPages = page.totalPages
    return response
  }
}
