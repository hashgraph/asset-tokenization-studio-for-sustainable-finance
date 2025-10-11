// SPDX-License-Identifier: Apache-2.0

import { Query } from "./Query"

export interface QueryBus {
  execute<Q extends Query<R>, R>(query: Q): Promise<R>
}
