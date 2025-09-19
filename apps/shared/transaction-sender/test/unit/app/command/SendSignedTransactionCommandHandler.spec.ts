import { SendSignedTransactionCommandHandler } from "../../../../src/app/command/sendsignedtransaction/SendSignedTransactionCommandHandler"
import { SendSignedTransactionCommand } from "../../../../src/app/command/sendsignedtransaction/SendSignedTransactionCommand"
import { SignedTransactionSentEvent } from "../../../../src/domain/event/SignedTransactionSentEvent"
import { TransactionMetadata } from "../../../../src/domain/model/TransactionMetadata"

import { NestJSEventBus } from "@hashgraph/green-bonds-shared-core"
import { BlockchainTransactionSenderAdapter } from "src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"

describe("SendSignedTransactionCommandHandler", () => {
  let handler: SendSignedTransactionCommandHandler
  let mockEventBus: jest.Mocked<NestJSEventBus>
  let mockBlockchainSender: jest.Mocked<BlockchainTransactionSenderAdapter>

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<NestJSEventBus>

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

      const expectedTransactionHash = "hedera_hash_123"
      const mockSendTransaction = jest.fn().mockResolvedValue(expectedTransactionHash)
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
      expect(publishedEvent.transactionHash).toBe(expectedTransactionHash)
    })

    it("should execute command for Ethereum transaction and publish event", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-request-id-eth"
      metadata.origin = "test-origin-eth"
      metadata.description = "Test Ethereum transaction"

      const command = new SendSignedTransactionCommand("0xabcdef1234567890", metadata, "ethereum")

      const expectedTransactionHash = "ethereum_hash_456"
      const mockSendTransaction = jest.fn().mockResolvedValue(expectedTransactionHash)
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
      expect(publishedEvent.transactionHash).toBe(expectedTransactionHash)
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

      const mockSendTransaction = jest.fn().mockResolvedValue("hash789")
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
        }),
      )
    })
  })
})
