// SPDX-License-Identifier: Apache-2.0

import { OrderPageOptions } from "./OrderPageOptions"

export class PageOptions {
  static DEFAULT: PageOptions = {
    page: 1,
    limit: 10,
    order: OrderPageOptions.DEFAULT,
  }

  page: number
  limit: number
  order: OrderPageOptions
}
