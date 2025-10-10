// SPDX-License-Identifier: Apache-2.0

import { Query } from "./Query"
import { PageOptions } from "../pagination/PageOptions"
import { Page } from "../pagination/Page"

export abstract class QueryPageable<T> extends Query<Page<T>> {
  readonly pageOptions: PageOptions

  protected constructor(pageOptions: PageOptions) {
    super()
    this.pageOptions = pageOptions
  }
}
