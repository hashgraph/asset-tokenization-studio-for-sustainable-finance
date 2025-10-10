// SPDX-License-Identifier: Apache-2.0

import { Page } from "../pagination/Page"
import { QueryResponse } from "./QueryResponse"

export class QueryPageResponse<T> extends QueryResponse<Page<T>> {
  constructor(page: Page<T>) {
    super(page)
  }

  get items(): T[] {
    return this.data.items
  }

  get total(): number {
    return this.data.total
  }

  get page(): number {
    return this.data.page
  }

  get limit(): number {
    return this.data.limit
  }

  get totalPages(): number {
    return this.data.totalPages
  }

  static fromPage<T>(page: Page<T>): QueryPageResponse<T> {
    return new QueryPageResponse(page)
  }
}
