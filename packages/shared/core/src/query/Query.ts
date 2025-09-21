// SPDX-License-Identifier: Apache-2.0

import { Query as NestJSQuery } from "@nestjs/cqrs"

export abstract class Query<R> extends NestJSQuery<R> {
  readonly timestamp: number = Date.now()
}
