// SPDX-License-Identifier: Apache-2.0

export abstract class QueryResponse<T> {
  readonly data: T

  protected constructor(data: T) {
    this.data = data
  }
}
