// SPDX-License-Identifier: Apache-2.0

import { CommandBus } from "./CommandBus"
import { Command } from "./Command"
import { CommandBus as InternalNestJSCommandBus } from "@nestjs/cqrs"
import { Singleton } from "../decorators/Singleton"
import { Logger } from "../logger/Logger"

@Singleton()
export class NestJSCommandBus implements CommandBus {
  private readonly logger = new Logger(NestJSCommandBus.name)

  constructor(private internalCommandBus: InternalNestJSCommandBus) {}

  async execute<C extends Command<R>, R>(command: C): Promise<R> {
    this.logger.log(`Executing command ${command.constructor.name}`)
    return await this.internalCommandBus.execute(command)
  }
}
