// SPDX-License-Identifier: Apache-2.0

import { IsInt, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { QueryOrderPageOptions } from "./QueryOrderPageOptions"
import { PageOptions } from "../pagination/PageOptions"
import { OrderPageOptions } from "../pagination/OrderPageOptions"

export class QueryPageOptions {
  static DEFAULT: QueryPageOptions = new QueryPageOptions(1, 10, QueryOrderPageOptions.DEFAULT)

  @IsInt()
  @Min(1)
  public page: number

  @IsInt()
  @Min(1)
  public limit: number

  @ValidateNested()
  @Type(() => QueryOrderPageOptions)
  public order: QueryOrderPageOptions

  constructor(page: number, limit: number, order: QueryOrderPageOptions) {
    this.page = page
    this.limit = limit
    this.order = order
  }

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
