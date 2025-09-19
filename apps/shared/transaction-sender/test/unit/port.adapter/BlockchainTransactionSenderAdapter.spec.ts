// SPDX-License-Identifier: Apache-2.0

import { BlockchainTransactionSenderAdapter } from "../../../src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"
import { SignedTransactionMessage } from "../../../src/domain/model/SignedTransactionMessage"
import { TransactionMetadata } from "../../../src/domain/model/TransactionMetadata"

describe("BlockchainTransactionSenderAdapter", () => {
  let adapter: BlockchainTransactionSenderAdapter

  beforeEach(() => {
    adapter = new BlockchainTransactionSenderAdapter()
  })

  describe("sendTransaction", () => {
    it("should route Hedera transactions to sendHederaTransaction", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-hedera-request"
      metadata.origin = "test-origin"
      metadata.description = "Test transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.metadata = metadata
      signedTransaction.format = "hedera"

      // Spy on private method through public interface
      const sendHederaSpy = jest.spyOn(adapter as any, "sendHederaTransaction")
      sendHederaSpy.mockResolvedValue("mocked_hedera_hash")

      // Act
      const result = await adapter.sendTransaction(signedTransaction)

      // Assert
      expect(sendHederaSpy).toHaveBeenCalledWith(signedTransaction)
      expect(result).toBe("mocked_hedera_hash")
    })

    it("should route Ethereum transactions to sendEthereumTransaction", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-ethereum-request"
      metadata.origin = "test-origin"
      metadata.description = "Test Ethereum transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.metadata = metadata
      signedTransaction.format = "ethereum"

      // Spy on private method through public interface
      const sendEthereumSpy = jest.spyOn(adapter as any, "sendEthereumTransaction")
      sendEthereumSpy.mockResolvedValue("mocked_ethereum_hash")

      // Act
      const result = await adapter.sendTransaction(signedTransaction)

      // Assert
      expect(sendEthereumSpy).toHaveBeenCalledWith(signedTransaction)
      expect(result).toBe("mocked_ethereum_hash")
    })

    it("should generate unique Hedera transaction hashes", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-hedera-unique"
      metadata.origin = "test-origin"
      metadata.description = "Test Hedera transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.metadata = metadata
      signedTransaction.format = "hedera"

      // Act
      const result1 = await adapter.sendTransaction(signedTransaction)
      const result2 = await adapter.sendTransaction(signedTransaction)

      // Assert
      expect(result1).toMatch(/^hedera_hedera_\d+_[a-z0-9]+$/)
      expect(result2).toMatch(/^hedera_hedera_\d+_[a-z0-9]+$/)
      expect(result1).not.toBe(result2) // Should be unique
    })

    it("should generate unique Ethereum transaction hashes", async () => {
      // Arrange
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-ethereum-unique"
      metadata.origin = "test-origin"
      metadata.description = "Test Ethereum transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.metadata = metadata
      signedTransaction.format = "ethereum"

      // Act
      const result1 = await adapter.sendTransaction(signedTransaction)
      const result2 = await adapter.sendTransaction(signedTransaction)

      // Assert
      expect(result1).toMatch(/^ethereum_ethereum_\d+_[a-z0-9]+$/)
      expect(result2).toMatch(/^ethereum_ethereum_\d+_[a-z0-9]+$/)
      expect(result1).not.toBe(result2) // Should be unique
    })

    it("should handle transactions with minimal metadata", async () => {
      // Arrange
      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"
      // No metadata set

      // Act
      const result = await adapter.sendTransaction(signedTransaction)

      // Assert
      expect(result).toMatch(/^hedera_hedera_\d+_[a-z0-9]+$/)
    })

    it("should preserve transaction format in hash generation", async () => {
      // Arrange
      const hederaTransaction = new SignedTransactionMessage()
      hederaTransaction.payload = "0x1234567890abcdef"
      hederaTransaction.format = "hedera"

      const ethereumTransaction = new SignedTransactionMessage()
      ethereumTransaction.payload = "0xabcdef1234567890"
      ethereumTransaction.format = "ethereum"

      // Act
      const hederaResult = await adapter.sendTransaction(hederaTransaction)
      const ethereumResult = await adapter.sendTransaction(ethereumTransaction)

      // Assert
      expect(hederaResult).toContain("hedera_hedera_")
      expect(ethereumResult).toContain("ethereum_ethereum_")
    })

    it("should return Promise<string> for both blockchain types", async () => {
      // Arrange
      const hederaTransaction = new SignedTransactionMessage()
      hederaTransaction.payload = "0x1234567890abcdef"
      hederaTransaction.format = "hedera"

      const ethereumTransaction = new SignedTransactionMessage()
      ethereumTransaction.payload = "0xabcdef1234567890"
      ethereumTransaction.format = "ethereum"

      // Act
      const hederaPromise = adapter.sendTransaction(hederaTransaction)
      const ethereumPromise = adapter.sendTransaction(ethereumTransaction)

      // Assert
      expect(hederaPromise).toBeInstanceOf(Promise)
      expect(ethereumPromise).toBeInstanceOf(Promise)

      const hederaResult = await hederaPromise
      const ethereumResult = await ethereumPromise

      expect(typeof hederaResult).toBe("string")
      expect(typeof ethereumResult).toBe("string")
    })
  })
})
