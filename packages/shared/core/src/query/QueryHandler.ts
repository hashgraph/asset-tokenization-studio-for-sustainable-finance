// SPDX-License-Identifier: Apache-2.0

import { Query } from "./Query"

export interface QueryHandler<Q extends Query<R>, R> {
  execute(query: Q): R
}
