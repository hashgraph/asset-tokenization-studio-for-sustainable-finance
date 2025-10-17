// SPDX-License-Identifier: Apache-2.0

import { EventBus } from "./EventBus"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Singleton } from "../decorators/Singleton"
import { Event } from "./Event"
import { Logger } from "../logger/Logger"

@Singleton()
export class NestJSEventBus implements EventBus {
  private readonly logger = new Logger(NestJSEventBus.name)
  private readonly excludedEventsForDebug = ["SyncStateSetEvent"]

  constructor(private eventEmitter: EventEmitter2) {}

  publish<E extends Event>(event: E): void {
    const eventName = event.constructor.name
    this.eventEmitter.emit(eventName, event)
    if (this.excludedEventsForDebug.includes(eventName)) {
      this.logger.debug(`Event ${eventName} published successfully:`, event)
    } else {
      this.logger.log(`Event ${eventName} published successfully:`, event)
    }
  }

  async publishSync<E extends Event>(event: E, eventName?: string): Promise<void> {
    await this.eventEmitter.emitAsync(eventName ?? event.constructor.name, event)
    return new Promise((resolve) => resolve())
  }
}
