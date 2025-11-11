// SPDX-License-Identifier: Apache-2.0

import { BlockchainEventsRabbitPublisher } from "@port/eventpublisher/BlockchainEventsRabbitPublisher"
import { EventProcessedEvent } from "@domain/eventstore/events/EventProcessedEvent"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"
import * as amqp from "amqplib"

jest.mock("amqplib", () => {
  const channel = {
    assertExchange: jest.fn(() => Promise.resolve(undefined)),
    publish: jest.fn(() => true),
    waitForConfirms: jest.fn(() => Promise.resolve(undefined)),
  }
  const connection = {
    on: jest.fn(),
    createConfirmChannel: jest.fn(() => Promise.resolve(channel)),
  }
  return {
    connect: jest.fn(() => Promise.resolve(connection)),
    __mock: { channel, connection },
  }
})

describe("BlockchainEventsRabbitPublisher", () => {
  const originalEnv = process.env
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.RABBITMQ_URI = "amqp://localhost:5672"
    process.env.RABBITMQ_EXCHANGE_NAME = "greenbond.events"
    process.env.RABBITMQ_EXCHANGE_TYPE = "topic"
    process.env.RABBITMQ_BLOCKCHAIN_EVENTS_ROUTING_KEY = "blockchain.events.processed"
    process.env.RABBITMQ_BLOCKCHAIN_EVENTS_RAW_ROUTING_KEY = "blockchain.events.raw"
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("should publish processed event and raw payload when enabled", async () => {
    process.env.BLOCKCHAIN_LISTENER_RABBITMQ_PUBLISH_RAW = "true"
    const mockRepo = {
      findById: jest.fn((id: string) => ({ id, data: JSON.stringify({ foo: "bar" }) })),
    } as any
    const publisher = new BlockchainEventsRabbitPublisher({} as any, mockRepo)

    const event = new EventProcessedEvent("id-123", "Transfer", EventStoreStatus.PROCESSED, null)
    await publisher.onEventProcessed(event)

    const mocked = (amqp as any).__mock
    const channel = mocked.channel

    expect(channel.publish).toHaveBeenCalledWith(
      "greenbond.events",
      "blockchain.events.processed",
      expect.any(Buffer),
      expect.objectContaining({ contentType: "application/json" }),
    )

    expect(channel.publish).toHaveBeenCalledWith(
      "greenbond.events",
      "blockchain.events.raw",
      expect.any(Buffer),
      expect.objectContaining({ contentType: "application/json" }),
    )
    expect(channel.waitForConfirms).toHaveBeenCalledTimes(2)
    expect(mockRepo.findById).toHaveBeenCalledWith("id-123")
  })

  it("should not publish when RabbitMQ URI is not set", async () => {
    delete process.env.RABBITMQ_URI
    delete process.env.RABBITMQ_URL
    const mockRepo = {
      findById: jest.fn(),
    } as any
    const publisher = new BlockchainEventsRabbitPublisher({} as any, mockRepo)
    const event = new EventProcessedEvent("id-456", "Transfer", EventStoreStatus.PROCESSED, null)
    await publisher.onEventProcessed(event)
    expect(amqp.connect as jest.Mock).not.toHaveBeenCalled()
    expect(mockRepo.findById).not.toHaveBeenCalled()
  })
})
