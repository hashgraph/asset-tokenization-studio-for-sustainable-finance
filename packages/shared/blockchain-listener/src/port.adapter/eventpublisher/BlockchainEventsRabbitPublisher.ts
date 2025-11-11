// SPDX-License-Identifier: Apache-2.0

import * as amqp from "amqplib"
import { Handler, Logger, Singleton } from "@hashgraph/green-bonds-shared-core"
import { EventProcessedEvent } from "@domain/eventstore/events/EventProcessedEvent"
import type { ConfigService } from "@port/config/ConfigService"
import { Inject } from "@nestjs/common"
import type { EventStoreRepository } from "@domain/eventstore/repositories/EventStoreRepository"

/**
 * RabbitMQ publisher that listens for EventProcessedEvent and publishes
 * the processed event (and optionally the raw event payload) to a RabbitMQ exchange.
 *
 * Highly configurable via env vars, using existing naming conventions. All variables are optional
 * and have sensible defaults. Whenever possible, we reuse the same variables as transaction-sender.
 *
 * Supported env vars:
 * - RABBITMQ_URI or RABBITMQ_URL: AMQP connection URI
 * - RABBITMQ_EXCHANGE_NAME: Exchange name to publish to (default: greenbond.events)
 * - RABBITMQ_EXCHANGE_TYPE: Exchange type (default: topic)
 * - RABBITMQ_BLOCKCHAIN_EVENTS_ROUTING_KEY: Routing key for processed events (default: blockchain.events.processed)
 * - RABBITMQ_BLOCKCHAIN_EVENTS_RAW_ROUTING_KEY: Routing key for raw events (default: blockchain.events.raw)
 * - BLOCKCHAIN_LISTENER_RABBITMQ_PUBLISH_RAW: If "true", also publish the raw event payload (default: false)
 * - BLOCKCHAIN_LISTENER_RABBITMQ_PERSISTENT: If "false", disable persistent messages (default: true)
 */
@Singleton()
export class BlockchainEventsRabbitPublisher {
  private connection: amqp.Connection | null = null
  private channel: amqp.ConfirmChannel | null = null

  private readonly exchangeName: string
  private readonly exchangeType: string
  private readonly routingKeyProcessed: string
  private readonly routingKeyRaw: string
  private readonly publishRaw: boolean
  private readonly persistentMessages: boolean

  constructor(
    @Inject("ConfigService") private readonly configService: ConfigService,
    @Inject("EventStoreRepository") private readonly eventStoreRepository: EventStoreRepository,
  ) {
    this.exchangeName = process.env.RABBITMQ_EXCHANGE_NAME || "greenbond.events"
    this.exchangeType = process.env.RABBITMQ_EXCHANGE_TYPE || "topic"
    this.routingKeyProcessed = process.env.RABBITMQ_BLOCKCHAIN_EVENTS_ROUTING_KEY || "blockchain.events.processed"
    this.routingKeyRaw = process.env.RABBITMQ_BLOCKCHAIN_EVENTS_RAW_ROUTING_KEY || "blockchain.events.raw"
    this.publishRaw = (process.env.BLOCKCHAIN_LISTENER_RABBITMQ_PUBLISH_RAW || "false").toLowerCase() === "true"
    this.persistentMessages = (process.env.BLOCKCHAIN_LISTENER_RABBITMQ_PERSISTENT || "true").toLowerCase() !== "false"
  }

  private async ensureChannel(): Promise<amqp.ConfirmChannel | null> {
    const uri = process.env.RABBITMQ_URI || process.env.RABBITMQ_URL || null
    if (!uri) {
      Logger.warn(
        "RabbitMQ URI not provided (RABBITMQ_URI/RABBITMQ_URL). Rabbit publishing is disabled.",
        BlockchainEventsRabbitPublisher.name,
      )
      return null
    }
    try {
      if (!this.connection) {
        this.connection = (await amqp.connect(uri)) as unknown as amqp.Connection
        this.connection.on("error", (err) => {
          Logger.error(`RabbitMQ connection error: ${err?.message}`, BlockchainEventsRabbitPublisher.name)
        })
        this.connection.on("close", () => {
          Logger.warn("RabbitMQ connection closed. Will re-open on next publish.", BlockchainEventsRabbitPublisher.name)
          this.connection = null
          this.channel = null
        })
      }
      if (!this.channel) {
        this.channel = (await (this.connection as any).createConfirmChannel()) as unknown as amqp.ConfirmChannel
        await this.channel.assertExchange(this.exchangeName, this.exchangeType, { durable: true })
      }
      return this.channel
    } catch (err) {
      Logger.error(`Failed to ensure RabbitMQ channel: ${err?.message}`, BlockchainEventsRabbitPublisher.name)
      this.connection = null
      this.channel = null
      return null
    }
  }

  private buildOptions(): amqp.Options.Publish {
    const headers: Record<string, any> = {
      source: "blockchain-listener",
    }
    return {
      persistent: this.persistentMessages,
      contentType: "application/json",
      headers,
    }
  }

  @Handler(EventProcessedEvent)
  async onEventProcessed(event: EventProcessedEvent): Promise<void> {
    try {
      const channel = await this.ensureChannel()
      if (!channel) {
        return
      }

      const basePayload = {
        id: event.id,
        eventName: event.eventName,
        status: event.status,
        errorReason: event.errorReason || null,
        timestamp: new Date().toISOString(),
      }

      const processedBuffer = Buffer.from(JSON.stringify(basePayload))
      const options = this.buildOptions()
      channel.publish(this.exchangeName, this.routingKeyProcessed, processedBuffer, options)
      await channel.waitForConfirms()

      if (this.publishRaw) {
        try {
          const stored = await this.eventStoreRepository.findById(event.id)
          if (stored?.data) {
            const rawPayload = {
              id: event.id,
              eventName: event.eventName,
              raw: stored.data,
              timestamp: new Date().toISOString(),
            }
            const rawBuffer = Buffer.from(JSON.stringify(rawPayload))
            channel.publish(this.exchangeName, this.routingKeyRaw, rawBuffer, options)
            await channel.waitForConfirms()
          }
        } catch (err) {
          Logger.warn(
            `Failed to fetch raw event data from EventStore for id=${event.id}: ${err?.message}`,
            BlockchainEventsRabbitPublisher.name,
          )
        }
      }
    } catch (err) {
      Logger.error(
        `Failed to publish EventProcessedEvent to RabbitMQ: ${err?.message}`,
        BlockchainEventsRabbitPublisher.name,
      )
    }
  }
}
