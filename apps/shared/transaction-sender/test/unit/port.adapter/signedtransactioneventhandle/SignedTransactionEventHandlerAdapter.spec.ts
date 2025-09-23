// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionEventHandlerNestJSAdapter } from "@port/transaction/usecase/signedtransactioneventhandle/SignedTransactionEventHandlerNestJSAdapter"
import { SignedTransactionSentEvent } from "../../../../src/domain/events/SignedTransactionSentEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"

describe("PublishTransactionResultAdapter", () => {
  let handler: SignedTransactionEventHandlerNestJSAdapter
  let mockCommandBus: jest.Mocked<CommandBus>
  let mockExecute: jest.MockedFunction<CommandBus["execute"]>

  beforeEach(() => {
    mockExecute = jest.fn()
    mockCommandBus = {
      execute: mockExecute,
    } as jest.Mocked<CommandBus>

    handler = new SignedTransactionEventHandlerNestJSAdapter(mockCommandBus)
  })

  it("should be defined", () => {
    expect(handler).toBeDefined()
  })

  describe("handle", () => {
    it("should execute command for Hedera transaction", async () => {
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
        undefined,
      )

      await handler.handle(event)

      expect(mockExecute).toHaveBeenCalledTimes(1)
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
          metadata,
          format: "hedera",
          transactionHash: "0.0.123@1234567890.123456789",
          status: "success",
          errorCode: undefined,
        }),
      )
    })

    it("should execute command for Ethereum transaction", async () => {
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
        undefined,
      )

      await handler.handle(event)

      expect(mockExecute).toHaveBeenCalledTimes(1)
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0xf86c808504a817c800825208943535353535353535353535353535353535353535",
          metadata,
          format: "ethereum",
          transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          status: "success",
          errorCode: undefined,
        }),
      )
    })

    it("should handle failed transaction with error code", async () => {
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
        "INVALID_TRANSACTION",
      )

      await handler.handle(event)

      expect(mockExecute).toHaveBeenCalledTimes(1)
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0xinvalidpayload",
          metadata,
          format: "hedera",
          transactionHash: "0.0.123@1234567890.123456789",
          status: "failed",
          errorCode: "INVALID_TRANSACTION",
        }),
      )
    })

    it("should propagate errors from command bus", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "error-test-999"
      metadata.origin = "error-service"

      const event = new SignedTransactionSentEvent(
        "0xtest",
        metadata,
        "hedera",
        "0.0.123@1234567890.123456789",
        "success",
        undefined,
      )

      const error = new Error("Command execution failed")
      mockExecute.mockRejectedValue(error)

      await expect(handler.handle(event)).rejects.toThrow("Command execution failed")
      expect(mockExecute).toHaveBeenCalledTimes(1)
    })

    it("should handle events with minimal metadata", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "minimal-test"

      const event = new SignedTransactionSentEvent("0xminimal", metadata, "ethereum", "0xhash", "success", undefined)

      await handler.handle(event)

      expect(mockExecute).toHaveBeenCalledTimes(1)
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0xminimal",
          metadata,
          format: "ethereum",
          transactionHash: "0xhash",
          status: "success",
          errorCode: undefined,
        }),
      )
    })

    it("should propagate errorCode when transaction fails", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "error-code-test"
      metadata.origin = "error-service"
      metadata.description = "Test error code propagation"

      const event = new SignedTransactionSentEvent(
        "0xerrorpayload",
        metadata,
        "hedera",
        "EXECUTION_FAILED",
        "failed",
        "INSUFFICIENT_ACCOUNT_BALANCE",
      )

      await handler.handle(event)

      expect(mockExecute).toHaveBeenCalledTimes(1)
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0xerrorpayload",
          metadata,
          format: "hedera",
          transactionHash: "EXECUTION_FAILED",
          status: "failed",
          errorCode: "INSUFFICIENT_ACCOUNT_BALANCE",
        }),
      )
    })
  })
})
