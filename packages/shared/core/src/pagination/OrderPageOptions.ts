// SPDX-License-Identifier: Apache-2.0

export class OrderPageOptions {
  static DEFAULT: OrderPageOptions = {
    order: "DESC",
    orderBy: "createdAt",
  }

  order: "asc" | "desc" | "ASC" | "DESC"
  orderBy: string
}
