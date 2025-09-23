// SPDX-License-Identifier: Apache-2.0

import { PublishTransactionResultCommandHandler } from "../../../../src/app/publishtransactionresult/command/PublishTransactionResultCommandHandler"
import { PublishTransactionResultCommand } from "../../../../src/app/publishtransactionresult/command/PublishTransactionResultCommand"
import { TransactionResultPublishedEvent } from "../../../../src/domain/events/TransactionResultPublishedEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"

interface PublishTransactionResultRabbitPort {
  publishResult: (result: any) => Promise<void>
}

describe("PublishTransactionResultCommandHandler", () => {
  let handler: PublishTransactionResultCommandHandler
  let mockPublishTransactionResultPort: jest.Mocked<PublishTransactionResultRabbitPort>
  let mockEventBus: jest.Mocked<EventBus>

  beforeEach(() => {
    mockPublishTransactionResultPort = {
      publishResult: jest.fn().mockResolvedValue(undefined),
    }

    mockEventBus = {
      publish: jest.fn(),
      publishSync: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<EventBus>

    handler = new PublishTransactionResultCommandHandler(mockEventBus, mockPublishTransactionResultPort)
  })

  describe("execute", () => {
    it("should publish transaction result and emit event successfully", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "hedera-test-123"
      metadata.origin = "hedera-service"
      metadata.description = "Test successful Hedera transaction result"

      const command = new PublishTransactionResultCommand(
        "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
        undefined,
      )

      await handler.execute(command)

      const expectedResult = {
        payload: "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "success",
        errorCode: undefined,
      }

      expect(mockPublishTransactionResultPort.publishResult).toHaveBeenCalledWith(expectedResult)
      expect(mockPublishTransactionResultPort.publishResult).toHaveBeenCalledTimes(1)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(TransactionResultPublishedEvent))
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEventBus.publish).toHaveBeenCalledTimes(1)
    })

    it("should handle failed transaction with error code", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "failed-test-456"
      metadata.origin = "test-service"
      metadata.description = "Test failed transaction result"

      const command = new PublishTransactionResultCommand(
        "0xfailedtransaction",
        metadata,
        "hedera",
        "0.0.456@1234567890.987654321",
        "failed",
        "INSUFFICIENT_FUNDS",
      )

      await handler.execute(command)

      const expectedResult = {
        payload: "0xfailedtransaction",
        metadata,
        format: "hedera",
        transactionHash: "0.0.456@1234567890.987654321",
        status: "failed",
        errorCode: "INSUFFICIENT_FUNDS",
      }

      expect(mockPublishTransactionResultPort.publishResult).toHaveBeenCalledWith(expectedResult)

      const publishedEvent = (mockEventBus.publish as jest.Mock).mock.calls[0][0]
      expect(publishedEvent).toBeInstanceOf(TransactionResultPublishedEvent)
      expect(publishedEvent.payload).toBe("0xfailedtransaction")
      expect(publishedEvent.metadata).toBe(metadata)
    })

    it("should throw error if publishResult fails", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "error-test-789"
      metadata.origin = "test-service"
      metadata.description = "Test error handling"

      const command = new PublishTransactionResultCommand(
        "0xerrortest",
        metadata,
        "hedera",
        "0.0.789@1234567890.111111111",
        "success",
        undefined,
      )

      const publishError = new Error("RabbitMQ connection failed")
      mockPublishTransactionResultPort.publishResult.mockRejectedValue(publishError)

      await expect(handler.execute(command)).rejects.toThrow("RabbitMQ connection failed")

      expect(mockPublishTransactionResultPort.publishResult).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEventBus.publish).not.toHaveBeenCalled()
    })

    it("should publish result first, then emit event (correct order)", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "order-test-111"
      metadata.origin = "test-service"
      metadata.description = "Test execution order"

      const command = new PublishTransactionResultCommand(
        "0xordertest",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
        undefined,
      )

      const callOrder: string[] = []

      mockPublishTransactionResultPort.publishResult.mockImplementation(async () => {
        callOrder.push("publishResult")
        return Promise.resolve()
      })

      mockEventBus.publish.mockImplementation(() => {
        callOrder.push("publishEvent")
      })

      await handler.execute(command)

      expect(callOrder).toEqual(["publishResult", "publishEvent"])
      expect(mockPublishTransactionResultPort.publishResult).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEventBus.publish).toHaveBeenCalledTimes(1)
    })
  })
})
