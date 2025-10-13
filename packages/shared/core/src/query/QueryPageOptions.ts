// SPDX-License-Identifier: Apache-2.0

import { QueryOrderPageOptions } from "./QueryOrderPageOptions"
import { PageOptions } from "../pagination/PageOptions"
import { OrderPageOptions } from "../pagination/OrderPageOptions"

export class QueryPageOptions {
  static DEFAULT: QueryPageOptions = new QueryPageOptions(1, 10, QueryOrderPageOptions.DEFAULT)

  constructor(
    public page: number,
    public limit: number,
    public order: QueryOrderPageOptions,
  ) {}

  toPageOptions(): PageOptions {
    return {
      page: this.page,
      limit: this.limit,
      order: {
        order: this.order.order,
        orderBy: this.order.orderBy,
      } as OrderPageOptions,
    }
  }
}
