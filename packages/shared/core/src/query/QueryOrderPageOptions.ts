// SPDX-License-Identifier: Apache-2.0

import { IsIn, IsNotEmpty, IsString } from "class-validator"

export class QueryOrderPageOptions {
  static DEFAULT: QueryOrderPageOptions = new QueryOrderPageOptions("DESC", "createdAt")

  @IsIn(["asc", "desc", "ASC", "DESC"])
  public order: "asc" | "desc" | "ASC" | "DESC"

  @IsString()
  @IsNotEmpty()
  public orderBy: string

  constructor(order: "asc" | "desc" | "ASC" | "DESC", orderBy: string) {
    this.order = order
    this.orderBy = orderBy
  }
}
