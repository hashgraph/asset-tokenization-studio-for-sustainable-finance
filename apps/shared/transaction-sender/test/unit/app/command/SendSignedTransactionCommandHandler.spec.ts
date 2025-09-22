import { SendSignedTransactionCommandHandler } from "../../../../src/app/command/sendsignedtransaction/SendSignedTransactionCommandHandler"
import { SendSignedTransactionCommand } from "../../../../src/app/command/sendsignedtransaction/SendSignedTransactionCommand"
import { SignedTransactionSentEvent } from "../../../../src/domain/events/SignedTransactionSentEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"

import { EventBus } from "@hashgraph/green-bonds-shared-core"
import { BlockchainTransactionSenderAdapter } from "src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"

describe("SendSignedTransactionCommandHandler", () => {
  let handler: SendSignedTransactionCommandHandler
  let mockEventBus: jest.Mocked<EventBus>
  let mockBlockchainSender: jest.Mocked<BlockchainTransactionSenderAdapter>

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn(),
    } as jest.Mocked<EventBus>

    mockBlockchainSender = {
      sendTransaction: jest.fn(),
    } as unknown as jest.Mocked<BlockchainTransactionSenderAdapter>

    handler = new SendSignedTransactionCommandHandler(mockEventBus, mockBlockchainSender)
  })

  describe("execute", () => {
    it("should execute command for Hedera transaction and publish event", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id"
      metadata.origin = "test-origin"
      metadata.description = "Test Hedera transaction"

      const command = new SendSignedTransactionCommand("0x1234567890abcdef", metadata, "hedera")

      const expectedTransactionResult = { transactionId: "hedera_hash_123", status: "success" as const }
      const mockSendTransaction = jest.fn().mockResolvedValue(expectedTransactionResult)
      mockBlockchainSender.sendTransaction = mockSendTransaction

      const mockPublish = jest.fn()
      mockEventBus.publish = mockPublish

      // Act
      await handler.execute(command)

      // Assert
      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0x1234567890abcdef",
          metadata,
          format: "hedera",
        }),
      )

      expect(mockPublish).toHaveBeenCalledWith(expect.any(SignedTransactionSentEvent))

      const publishedEvent = mockPublish.mock.calls[0][0] as SignedTransactionSentEvent
      expect(publishedEvent.payload).toBe("0x1234567890abcdef")
      expect(publishedEvent.metadata).toBe(metadata)
      expect(publishedEvent.format).toBe("hedera")
      expect(publishedEvent.transactionHash).toBe(expectedTransactionResult.transactionId)
      expect(publishedEvent.status).toBe(expectedTransactionResult.status)
    })

    it("should execute command for Ethereum transaction and publish event", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-eth"
      metadata.origin = "test-origin-eth"
      metadata.description = "Test Ethereum transaction"

      const command = new SendSignedTransactionCommand("0xabcdef1234567890", metadata, "ethereum")

      const expectedTransactionResult = { transactionId: "ethereum_hash_456", status: "success" as const }
      const mockSendTransaction = jest.fn().mockResolvedValue(expectedTransactionResult)
      mockBlockchainSender.sendTransaction = mockSendTransaction

      const mockPublish = jest.fn()
      mockEventBus.publish = mockPublish

      // Act
      await handler.execute(command)

      // Assert
      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0xabcdef1234567890",
          metadata,
          format: "ethereum",
        }),
      )

      expect(mockPublish).toHaveBeenCalledWith(expect.any(SignedTransactionSentEvent))

      const publishedEvent = mockPublish.mock.calls[0][0] as SignedTransactionSentEvent
      expect(publishedEvent.payload).toBe("0xabcdef1234567890")
      expect(publishedEvent.metadata).toBe(metadata)
      expect(publishedEvent.format).toBe("ethereum")
      expect(publishedEvent.transactionHash).toBe(expectedTransactionResult.transactionId)
      expect(publishedEvent.status).toBe(expectedTransactionResult.status)
    })

    it("should handle blockchain sender errors", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-error"
      metadata.origin = "test-origin-error"
      metadata.description = "Test error transaction"

      const command = new SendSignedTransactionCommand("0x1234567890abcdef", metadata, "hedera")

      const expectedError = new Error("Blockchain network error")
      const mockSendTransaction = jest.fn().mockRejectedValue(expectedError)
      mockBlockchainSender.sendTransaction = mockSendTransaction

      const mockPublish = jest.fn()
      mockEventBus.publish = mockPublish

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow("Blockchain network error")

      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "0x1234567890abcdef",
          metadata,
          format: "hedera",
        }),
      )

      // Event should not be published when blockchain sender fails
      expect(mockPublish).not.toHaveBeenCalled()
    })

    it("should create SignedTransactionMessage with correct properties", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-props"
      metadata.origin = "test-origin-props"
      metadata.description = "Test properties transaction"

      const command = new SendSignedTransactionCommand("test_payload", metadata, "hedera")

      const mockSendTransaction = jest.fn().mockResolvedValue({ transactionId: "hash789", status: "success" as const })
      mockBlockchainSender.sendTransaction = mockSendTransaction

      const mockPublish = jest.fn()
      mockEventBus.publish = mockPublish

      // Act
      await handler.execute(command)

      // Assert
      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "test_payload",
          metadata: metadata,
          format: "hedera",
          transactionHash: "hash789",
          status: "success",
        }),
      )
    })
  })
})
