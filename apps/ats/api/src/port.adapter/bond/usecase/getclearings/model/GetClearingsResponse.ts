// SPDX-License-Identifier: Apache-2.0
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"

export class GetClearingsResponse {
  clearings: ClearingHold[]
  total: number
  page: number
  limit: number
  totalPages: number

  constructor(clearings: ClearingHold[], total: number, page: number, limit: number) {
    this.clearings = clearings
    this.total = total
    this.page = page
    this.limit = limit
    this.totalPages = Math.ceil(total / limit)
  }
}
