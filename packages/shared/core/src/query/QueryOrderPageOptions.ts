// SPDX-License-Identifier: Apache-2.0

export class QueryOrderPageOptions {
  static DEFAULT: QueryOrderPageOptions = new QueryOrderPageOptions("DESC", "createdAt")

  constructor(
    public order: "asc" | "desc" | "ASC" | "DESC",
    public orderBy: string,
  ) {}
}
