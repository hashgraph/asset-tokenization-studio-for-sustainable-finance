// SPDX-License-Identifier: Apache-2.0

import { SendSignedTransactionCommandHandler } from "../../../../src/app/sendsignedtransaction/command/SendSignedTransactionCommandHandler"
import { SendSignedTransactionCommand } from "../../../../src/app/sendsignedtransaction/command/SendSignedTransactionCommand"
import { SignedTransactionSentEvent } from "../../../../src/domain/events/SignedTransactionSentEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"
import { BlockchainError } from "../../../../src/domain/errors/BlockchainError"
import { EventBus } from "@hashgraph/green-bonds-shared-core"
import { BlockchainTransactionSenderAdapter } from "src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"

describe("SendSignedTransactionCommandHandler", () => {
  let handler: SendSignedTransactionCommandHandler
  let mockEventBus: jest.Mocked<EventBus>
  let mockBlockchainSender: jest.Mocked<BlockchainTransactionSenderAdapter>

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<EventBus>

    mockBlockchainSender = {
      sendTransaction: jest.fn(),
    } as unknown as jest.Mocked<BlockchainTransactionSenderAdapter>

    handler = new SendSignedTransactionCommandHandler(mockEventBus, mockBlockchainSender)
  })

  describe("execute", () => {
    it("should execute command for Hedera transaction and publish event", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id"
      metadata.origin = "test-origin"
      metadata.description = "Test Hedera transaction"

      const command = new SendSignedTransactionCommand("0x1234567890abcdef", metadata, "hedera")

      const expectedTransactionResult = {
        transactionId: "0.0.123@1234567890.123456789",
        status: "success" as const,
        errorCode: undefined,
      }
      mockBlockchainSender.sendTransaction.mockResolvedValue(expectedTransactionResult)

      await handler.execute(command)

      expect(mockBlockchainSender.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0x1234567890abcdef",
          metadata,
          format: "hedera",
        }),
      )

      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(SignedTransactionSentEvent))

      const publishedEvent = mockEventBus.publish.mock.calls[0][0] as SignedTransactionSentEvent
      expect(publishedEvent.payload).toBe("0x1234567890abcdef")
      expect(publishedEvent.metadata).toBe(metadata)
      expect(publishedEvent.format).toBe("hedera")
      expect(publishedEvent.transactionHash).toBe(expectedTransactionResult.transactionId)
      expect(publishedEvent.status).toBe(expectedTransactionResult.status)
      expect(publishedEvent.errorCode).toBe(expectedTransactionResult.errorCode)
    })

    it("should execute command for Ethereum transaction and publish event", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-eth"
      metadata.origin = "test-origin-eth"
      metadata.description = "Test Ethereum transaction"

      const command = new SendSignedTransactionCommand("0xabcdef1234567890", metadata, "ethereum")

      const expectedTransactionResult = {
        transactionId: "0x9876543210abcdef9876543210abcdef98765432",
        status: "success" as const,
        errorCode: undefined,
      }
      mockBlockchainSender.sendTransaction.mockResolvedValue(expectedTransactionResult)

      await handler.execute(command)

      expect(mockBlockchainSender.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0xabcdef1234567890",
          metadata,
          format: "ethereum",
        }),
      )

      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(SignedTransactionSentEvent))

      const publishedEvent = mockEventBus.publish.mock.calls[0][0] as SignedTransactionSentEvent
      expect(publishedEvent.payload).toBe("0xabcdef1234567890")
      expect(publishedEvent.metadata).toBe(metadata)
      expect(publishedEvent.format).toBe("ethereum")
      expect(publishedEvent.transactionHash).toBe(expectedTransactionResult.transactionId)
      expect(publishedEvent.status).toBe(expectedTransactionResult.status)
      expect(publishedEvent.errorCode).toBe(expectedTransactionResult.errorCode)
    })

    // NEW BEHAVIOR: Handler now catches BlockchainError and converts to failed event
    it("should handle blockchain sender errors and publish failed event", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-error"
      metadata.origin = "test-origin-error"
      metadata.description = "Test error transaction"

      const command = new SendSignedTransactionCommand("0x1234567890abcdef", metadata, "hedera")

      const blockchainError = new BlockchainError(
        "Hedera execution error",
        "INSUFFICIENT_ACCOUNT_BALANCE",
        "EXECUTION_FAILED",
        false, // Not transient
      )
      mockBlockchainSender.sendTransaction.mockRejectedValue(blockchainError)

      await handler.execute(command)

      expect(mockBlockchainSender.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0x1234567890abcdef",
          metadata,
          format: "hedera",
        }),
      )

      // Event SHOULD be published with failed status
      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(SignedTransactionSentEvent))

      const publishedEvent = mockEventBus.publish.mock.calls[0][0] as SignedTransactionSentEvent
      expect(publishedEvent.status).toBe("failed")
      expect(publishedEvent.transactionHash).toBe("EXECUTION_FAILED")
      expect(publishedEvent.errorCode ).toBe("INSUFFICIENT_ACCOUNT_BALANCE")
    })

    it("should propagate errorCode when transaction fails", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-error-code"
      metadata.origin = "test-origin-error-code"
      metadata.description = "Test error code transaction"

      const command = new SendSignedTransactionCommand("0x1234567890abcdef", metadata, "hedera")

      const blockchainError = new BlockchainError(
        "Transaction failed",
        "TIMEOUT",
        "0.0.123@1234567890.123456789",
        true, // Transient but retries exhausted
      )
      mockBlockchainSender.sendTransaction.mockRejectedValue(blockchainError)

      await handler.execute(command)

      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(SignedTransactionSentEvent))

      const publishedEvent = mockEventBus.publish.mock.calls[0][0] as SignedTransactionSentEvent
      expect(publishedEvent.payload).toBe("0x1234567890abcdef")
      expect(publishedEvent.metadata).toBe(metadata)
      expect(publishedEvent.format).toBe("hedera")
      expect(publishedEvent.transactionHash).toBe("0.0.123@1234567890.123456789")
      expect(publishedEvent.status).toBe("failed")
      expect(publishedEvent.errorCode).toBe("TIMEOUT")
    })
  })
})
