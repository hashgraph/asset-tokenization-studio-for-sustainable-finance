// SPDX-License-Identifier: Apache-2.0

import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
import { Logger, Singleton } from "@hashgraph/green-bonds-shared-core"

import type { Event } from "@hashgraph/green-bonds-shared-core"
import { EventPublisherPort } from "@port/eventpublisher/EventPublisherPort"

/**
 * RabbitMQ adapter implementing EventPublisherPort.
 * Minimal configuration: publish incoming events to a single exchange + routing key.
 */
@Singleton()
export class RabbitMQEventPublisherAdapter implements EventPublisherPort {
  private readonly exchangeName: string
  private readonly routingKeyBase: string
  private readonly publishEnabled: boolean
  private readonly logger = new Logger(RabbitMQEventPublisherAdapter.name)

  constructor(private readonly amqpConnection: AmqpConnection) {
    this.exchangeName = process.env.RABBITMQ_EXCHANGE_NAME || "greenbond.events"
    this.routingKeyBase = process.env.RABBITMQ_BLOCKCHAIN_ROUTING_KEY || "blockchain.events"
    this.publishEnabled = (process.env.RABBITMQ_PUBLISH_ENABLED || "true").toLowerCase() === "true"
  }

  async publish(event: Event): Promise<void> {
    try {
      if (!this.publishEnabled) {
        return
      }
      const payload = {
        eventName: ((event as any)?.constructor?.name || "Unknown").replace(/DLTEvent$/, ""),
        ...event,
      }

      const options = {
        persistent: true,
        contentType: "application/json",
        headers: { source: "blockchain-listener" },
      }

      const routingKey = `${this.routingKeyBase}.${payload.eventName}`
      await this.amqpConnection.publish(this.exchangeName, routingKey, payload, options as any)
    } catch (err) {
      this.logger.error(`Failed to publish DLT event to RabbitMQ: ${err?.message}`, err?.stack)
    }
  }
}
