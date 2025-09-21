// SPDX-License-Identifier: Apache-2.0

import { QueryBus } from "./QueryBus"
import { QueryBus as InternalNestJSQueryBus } from "@nestjs/cqrs"
import { Singleton } from "../decorators/Singleton"
import { Query } from "./Query"
import { Logger } from "../logger/Logger"

@Singleton()
export class NestJSQueryBus implements QueryBus {
  private readonly logger = new Logger(NestJSQueryBus.name)

  constructor(private internalQueryBus: InternalNestJSQueryBus) {}

  async execute<Q extends Query<R>, R>(query: Q): Promise<R> {
    this.logger.log(`Executing query ${query.constructor.name}`)
    return await this.internalQueryBus.execute(query)
  }
}
