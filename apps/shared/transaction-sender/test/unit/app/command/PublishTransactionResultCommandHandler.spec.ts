// SPDX-License-Identifier: Apache-2.0

import { PublishTransactionResultCommandHandler } from "../../../../src/app/publishtransactionresult/command/PublishTransactionResultCommandHandler"
import { PublishTransactionResultCommand } from "../../../../src/app/publishtransactionresult/command/PublishTransactionResultCommand"
import { TransactionResultPublishedEvent } from "../../../../src/domain/events/TransactionResultPublishedEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"

import type { TransactionResultPublisherPort } from "../../../../src/port.adapter/transactionresultpublisher/TransactionResultPublisherPort"

describe("PublishTransactionResultCommandHandler", () => {
  let handler: PublishTransactionResultCommandHandler
  let mockPublishTransactionResultPort: jest.Mocked<TransactionResultPublisherPort>
  let mockEventBus: jest.Mocked<EventBus>
  let publishResultSpy: jest.MockedFunction<TransactionResultPublisherPort["publishResult"]>
  let eventBusPublishSpy: jest.MockedFunction<EventBus["publish"]>

  beforeEach(() => {
    publishResultSpy = jest.fn().mockResolvedValue(undefined)
    eventBusPublishSpy = jest.fn()

    mockPublishTransactionResultPort = {
      publishResult: publishResultSpy,
    }

    mockEventBus = {
      publish: eventBusPublishSpy,
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

      expect(publishResultSpy).toHaveBeenCalledWith(expectedResult)
      expect(publishResultSpy).toHaveBeenCalledTimes(1)

      expect(eventBusPublishSpy).toHaveBeenCalledWith(expect.any(TransactionResultPublishedEvent))
      expect(eventBusPublishSpy).toHaveBeenCalledTimes(1)
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

      expect(publishResultSpy).toHaveBeenCalledWith(expectedResult)
      expect(publishResultSpy).toHaveBeenCalledTimes(1)
      expect(eventBusPublishSpy).toHaveBeenCalledTimes(1)
    })

    it("should ensure correct execution order: publishResult before publishEvent", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "order-test-789"
      metadata.origin = "order-service"
      metadata.description = "Test execution order"

      const command = new PublishTransactionResultCommand(
        "0xordertest",
        metadata,
        "hedera",
        "0.0.789@1234567890.555555555",
        "success",
        undefined,
      )

      const callOrder: string[] = []

      publishResultSpy.mockImplementation(() => {
        callOrder.push("publishResult")
        return Promise.resolve()
      })

      eventBusPublishSpy.mockImplementation(() => {
        callOrder.push("publishEvent")
      })

      await handler.execute(command)

      expect(callOrder).toEqual(["publishResult", "publishEvent"])
      expect(publishResultSpy).toHaveBeenCalledTimes(1)
      expect(eventBusPublishSpy).toHaveBeenCalledTimes(1)
    })
  })
})
