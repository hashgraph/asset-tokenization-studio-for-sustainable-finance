// SPDX-License-Identifier: Apache-2.0

import type { EventPublisherPort } from "@domain/eventpublisher/ports/EventPublisherPort"
import { PublishEventPort } from "@domain/eventpublisher/ports/PublishEventPort"
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { OnEvent } from "@nestjs/event-emitter"
import type { DLTEvent } from "@hashgraph/green-bonds-shared-core"

/**
 * Inbound NestJS adapter listening to DLT events and delegating to the outbound EventPublisherPort.
 * Keeps the publishing use case decoupled from the RabbitMQ implementation.
 */
@Singleton()
export class PublishEventPortNestJSEventAdapter implements PublishEventPort {
  constructor(@Inject("EventPublisherPort") private readonly eventPublisher: EventPublisherPort) {}

  @OnEvent("*DLTEvent")
  async handle(event: DLTEvent): Promise<void> {
    await this.eventPublisher.publish(event)
  }
}
