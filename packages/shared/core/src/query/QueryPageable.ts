// SPDX-License-Identifier: Apache-2.0

export interface QueryPageable<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
