// SPDX-License-Identifier: Apache-2.0

import { EventBus } from "./EventBus"
import { EventBus as InternalNestJSEventBus } from "@nestjs/cqrs"
import { Singleton } from "../decorators/Singleton"
import { Event } from "./Event"
import { Logger } from "../logger/Logger"

@Singleton()
export class NestJSEventBus implements EventBus {
  private readonly logger = new Logger(NestJSEventBus.name)

  constructor(private internalEventBus: InternalNestJSEventBus) {}

  publish<E extends Event>(event: E): void {
    this.internalEventBus.publish(event)
    this.logger.log(`Event ${event.constructor.name} published successfully:`, event)
  }
}
