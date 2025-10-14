// SPDX-License-Identifier: Apache-2.0

import { Page } from "src/pagination/Page"

export class QueryPageResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number

  static fromPage<T, R>(page: Page<T>, transform: (item: T) => R): QueryPageResponse<R> {
    const response = new QueryPageResponse<R>()
    response.items = page.items.map(transform)
    response.total = page.total
    response.page = page.page
    response.limit = page.limit
    response.totalPages = page.totalPages
    return response
  }
}
