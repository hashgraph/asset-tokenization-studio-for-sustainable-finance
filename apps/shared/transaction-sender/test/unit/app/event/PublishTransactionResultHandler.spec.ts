// SPDX-License-Identifier: Apache-2.0

import { PublishTransactionResultHandler } from "../../../../src/app/event/publishtransactionresult/PublishTransactionResultHandler"
import { SignedTransactionSentEvent } from "../../../../src/domain/events/SignedTransactionSentEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"
import type { PublishTransactionResultPort } from "../../../../src/port.adapter/publishtransactionresult/PublishTransactionResultPort"

describe("PublishTransactionResultHandler", () => {
  let handler: PublishTransactionResultHandler
  let mockPublishPort: jest.Mocked<PublishTransactionResultPort>
  let mockPublishResult: jest.MockedFunction<PublishTransactionResultPort["publishResult"]>

  beforeEach(() => {
    mockPublishResult = jest.fn()
    mockPublishPort = {
      publishResult: mockPublishResult,
    } as jest.Mocked<PublishTransactionResultPort>

    handler = new PublishTransactionResultHandler(mockPublishPort)
  })

  it("should be defined", () => {
    expect(handler).toBeDefined()
  })

  describe("handle", () => {
    it("should publish transaction result for Hedera transaction", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "hedera-test-123"
      metadata.origin = "hedera-service"
      metadata.description = "Test Hedera transaction"

      const event = new SignedTransactionSentEvent(
        "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
      )

      await handler.handle(event)

      expect(mockPublishResult).toHaveBeenCalledTimes(1)
      expect(mockPublishResult).toHaveBeenCalledWith({
        payload: "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "success",
      })
    })

    it("should publish transaction result for Ethereum transaction", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "ethereum-test-456"
      metadata.origin = "ethereum-service"
      metadata.description = "Test Ethereum transaction"

      const event = new SignedTransactionSentEvent(
        "0xf86c808504a817c800825208943535353535353535353535353535353535353535",
        metadata,
        "ethereum",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "success",
      )

      await handler.handle(event)

      expect(mockPublishResult).toHaveBeenCalledTimes(1)
      expect(mockPublishResult).toHaveBeenCalledWith({
        payload: "0xf86c808504a817c800825208943535353535353535353535353535353535353535",
        metadata,
        format: "ethereum",
        transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        status: "success",
      })
    })

    it("should handle transaction without hash (failed transaction)", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "failed-test-789"
      metadata.origin = "test-service"
      metadata.description = "Failed transaction test"

      const event = new SignedTransactionSentEvent(
        "0xinvalidpayload",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "failed",
      )

      await handler.handle(event)

      expect(mockPublishResult).toHaveBeenCalledTimes(1)
      expect(mockPublishResult).toHaveBeenCalledWith({
        payload: "0xinvalidpayload",
        metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "failed",
      })
    })

    it("should propagate errors from publish port", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "error-test-999"
      metadata.origin = "error-service"

      const event = new SignedTransactionSentEvent(
        "0xtest",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
      )

      const error = new Error("Publishing failed")
      mockPublishResult.mockRejectedValue(error)

      await expect(handler.handle(event)).rejects.toThrow("Publishing failed")
      expect(mockPublishResult).toHaveBeenCalledTimes(1)
    })

    it("should handle events with minimal metadata", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "minimal-test"

      const event = new SignedTransactionSentEvent("0xminimal", metadata, "ethereum", "0xhash", "success")

      await handler.handle(event)

      expect(mockPublishResult).toHaveBeenCalledTimes(1)
      expect(mockPublishResult).toHaveBeenCalledWith({
        payload: "0xminimal",
        metadata,
        format: "ethereum",
        transactionHash: "0xhash",
        status: "success",
      })
    })
  })
})
