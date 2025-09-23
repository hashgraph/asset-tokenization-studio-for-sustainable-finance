// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"

import { PublishTransactionResultCommandHandler } from "../../src/app/publishtransactionresult/command/PublishTransactionResultCommandHandler"
import { SignedTransactionEventHandlerNestJSAdapter } from "../../src/port.adapter/transaction/usecase/signedtransactioneventhandle/SignedTransactionEventHandlerNestJSAdapter"
import { SignedTransactionSentEvent } from "../../src/domain/events/SignedTransactionSentEvent"
import { TransactionResultPublishedEvent } from "../../src/domain/events/TransactionResultPublishedEvent"
import { TransactionMetadata } from "../../src/domain/model/TransactionMetadata"
import type { PublishTransactionResultPort } from "../../src/port.adapter/publishtransactionresult/PublishTransactionResultPort"

describe("PublishTransactionResult Flow Integration", () => {
  let app: TestingModule
  let adapter: SignedTransactionEventHandlerNestJSAdapter
  let mockRabbitPort: jest.Mocked<PublishTransactionResultPort>
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    mockRabbitPort = {
      publishResult: jest.fn().mockResolvedValue(undefined),
    }

    app = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [
        PublishTransactionResultCommandHandler,
        SignedTransactionEventHandlerNestJSAdapter,
        {
          provide: "PublishTransactionResult",
          useValue: mockRabbitPort,
        },
      ],
    }).compile()

    adapter = app.get<SignedTransactionEventHandlerNestJSAdapter>(SignedTransactionEventHandlerNestJSAdapter)
    eventEmitter = app.get<EventEmitter2>(EventEmitter2)

    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe("Complete flow without recursion", () => {
    it("should handle SignedTransactionSentEvent and publish TransactionResultPublishedEvent", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "integration-test-123"
      metadata.origin = "integration-test-service"
      metadata.description = "Integration test for transaction result flow"

      const originalEvent = new SignedTransactionSentEvent(
        "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
        undefined,
      )

      const eventHistory: string[] = []
      const maxEvents = 10

      const resultPublishedPromise = new Promise<TransactionResultPublishedEvent>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("TransactionResultPublishedEvent not received within timeout"))
        }, 5000)

        eventEmitter.on("TransactionResultPublishedEvent", (event: TransactionResultPublishedEvent) => {
          clearTimeout(timeout)
          eventHistory.push("TransactionResultPublishedEvent")
          resolve(event)
        })
      })

      eventEmitter.on("SignedTransactionSentEvent", () => {
        eventHistory.push("SignedTransactionSentEvent")
        if (eventHistory.filter((e) => e === "SignedTransactionSentEvent").length > 1) {
          throw new Error("Recursion detected: Multiple SignedTransactionSentEvent emissions")
        }
      })

      eventHistory.push("SignedTransactionSentEvent")
      await adapter.handle(originalEvent)

      const publishedEvent = await resultPublishedPromise

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRabbitPort.publishResult).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRabbitPort.publishResult).toHaveBeenCalledWith({
        payload: "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "success",
        errorCode: undefined,
      })

      expect(publishedEvent).toBeInstanceOf(TransactionResultPublishedEvent)
      expect(publishedEvent.payload).toBe("0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878")
      expect(publishedEvent.transactionHash).toBe("0.0.123@1234567890.123456789")
      expect(publishedEvent.status).toBe("success")

      const signedEventCount = eventHistory.filter((e) => e === "SignedTransactionSentEvent").length
      const publishedEventCount = eventHistory.filter((e) => e === "TransactionResultPublishedEvent").length

      expect(signedEventCount).toBe(1)
      expect(publishedEventCount).toBe(1)
      expect(eventHistory.length).toBeLessThanOrEqual(maxEvents)
    })

    it("should handle failed transaction without recursion", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "integration-test-failed-456"
      metadata.origin = "integration-test-service"
      metadata.description = "Integration test for failed transaction"

      const failedEvent = new SignedTransactionSentEvent(
        "0xerrorpayload",
        metadata,
        "hedera",
        "EXECUTION_FAILED",
        "failed",
        "INSUFFICIENT_ACCOUNT_BALANCE",
      )

      const eventHistory: string[] = []

      const resultPublishedPromise = new Promise<TransactionResultPublishedEvent>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("TransactionResultPublishedEvent not received within timeout"))
        }, 5000)

        eventEmitter.on("TransactionResultPublishedEvent", (event: TransactionResultPublishedEvent) => {
          clearTimeout(timeout)
          eventHistory.push("TransactionResultPublishedEvent")
          resolve(event)
        })
      })

      eventHistory.push("SignedTransactionSentEvent")
      await adapter.handle(failedEvent)

      const publishedEvent = await resultPublishedPromise

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRabbitPort.publishResult).toHaveBeenCalledWith({
        payload: "0xerrorpayload",
        metadata,
        format: "hedera",
        transactionHash: "EXECUTION_FAILED",
        status: "failed",
        errorCode: "INSUFFICIENT_ACCOUNT_BALANCE",
      })

      expect(publishedEvent.status).toBe("failed")
      expect(publishedEvent.errorCode).toBe("INSUFFICIENT_ACCOUNT_BALANCE")

      const signedEventCount = eventHistory.filter((e) => e === "SignedTransactionSentEvent").length
      expect(signedEventCount).toBe(1)
    })

    it("should handle RabbitMQ errors gracefully without causing recursion", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "integration-test-error-789"
      metadata.origin = "integration-test-service"
      metadata.description = "Integration test for RabbitMQ error handling"

      mockRabbitPort.publishResult.mockRejectedValueOnce(new Error("RabbitMQ connection failed"))

      const errorEvent = new SignedTransactionSentEvent(
        "0xerrortest",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
        undefined,
      )

      const eventHistory: string[] = []

      eventEmitter.on("TransactionResultPublishedEvent", () => {
        eventHistory.push("TransactionResultPublishedEvent")
      })

      eventEmitter.on("SignedTransactionSentEvent", () => {
        eventHistory.push("SignedTransactionSentEvent")
      })

      eventHistory.push("SignedTransactionSentEvent")

      await expect(adapter.handle(errorEvent)).rejects.toThrow("RabbitMQ connection failed")

      await new Promise((resolve) => setTimeout(resolve, 100))

      const publishedEventCount = eventHistory.filter((e) => e === "TransactionResultPublishedEvent").length
      expect(publishedEventCount).toBe(0)

      const signedEventCount = eventHistory.filter((e) => e === "SignedTransactionSentEvent").length
      expect(signedEventCount).toBe(1)
    })
  })
})
