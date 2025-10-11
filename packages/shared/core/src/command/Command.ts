// SPDX-License-Identifier: Apache-2.0

import { Command as NestJSCommand } from "@nestjs/cqrs"

export abstract class Command<R> extends NestJSCommand<R> {
  readonly timestamp: number = Date.now()
}
