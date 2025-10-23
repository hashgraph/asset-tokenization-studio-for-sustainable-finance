// SPDX-License-Identifier: Apache-2.0

import { QueryBus } from "./QueryBus"
import { QueryBus as InternalNestJSQueryBus } from "@nestjs/cqrs"
import { Singleton } from "../decorators/Singleton"
import { Query } from "./Query"
import { Logger } from "../logger/Logger"

@Singleton()
export class NestJSQueryBus implements QueryBus {
  private readonly logger = new Logger(NestJSQueryBus.name)
  private readonly excludedQueriesForDebug = ["GetEventFiltersQuery"]

  constructor(private internalQueryBus: InternalNestJSQueryBus) {}

  async execute<Q extends Query<R>, R>(query: Q): Promise<R> {
    const queryName = query.constructor.name
    if (this.excludedQueriesForDebug.includes(queryName)) {
      this.logger.debug(`Executing query ${queryName}`)
    } else {
      this.logger.log(`Executing query ${queryName}`)
    }
    return await this.internalQueryBus.execute(query)
  }
}
