// SPDX-License-Identifier: Apache-2.0

import { BlockchainTransactionSenderAdapter } from "../../../src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"
import { SignedTransactionMessage } from "../../../src/domain/model/SignedTransactionMessage"
import { TransactionMetadata } from "../../../src/domain/model/TransactionMetadata"

jest.mock("@hashgraph/sdk", () => ({
  Client: {
    forTestnet: jest.fn().mockReturnValue({
      close: jest.fn(),
    }),
  },
  Transaction: {
    fromBytes: jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        transactionId: {
          toString: jest.fn().mockReturnValue("0.0.123@1234567890.123456789"),
        },
        getReceipt: jest.fn().mockResolvedValue({}),
      }),
    }),
  },
}))

jest.mock("ethers", () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        sendTransaction: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({
            transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
          }),
        }),
      })),
    },
  },
}))

describe("BlockchainTransactionSenderAdapter", () => {
  let adapter: BlockchainTransactionSenderAdapter

  beforeEach(() => {
    adapter = new BlockchainTransactionSenderAdapter()
    jest.clearAllMocks()
  })

  describe("sendTransaction", () => {
    it("should route Hedera transactions to sendHederaTransaction", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-hedera-request"
      metadata.origin = "test-origin"
      metadata.description = "Test transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.metadata = metadata
      signedTransaction.format = "hedera"

      const sendHederaSpy = jest.spyOn(adapter as any, "sendHederaTransaction")
      sendHederaSpy.mockResolvedValue("mocked_hedera_hash")

      const result = await adapter.sendTransaction(signedTransaction)

      expect(sendHederaSpy).toHaveBeenCalledWith(signedTransaction)
      expect(result).toBe("mocked_hedera_hash")
    })

    it("should route Ethereum transactions to sendEthereumTransaction", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-ethereum-request"
      metadata.origin = "test-origin"
      metadata.description = "Test Ethereum transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.metadata = metadata
      signedTransaction.format = "ethereum"

      const sendEthereumSpy = jest.spyOn(adapter as any, "sendEthereumTransaction")
      sendEthereumSpy.mockResolvedValue("mocked_ethereum_hash")

      const result = await adapter.sendTransaction(signedTransaction)

      expect(sendEthereumSpy).toHaveBeenCalledWith(signedTransaction)
      expect(result).toBe("mocked_ethereum_hash")
    })

    it("should successfully send Hedera transaction and return transaction ID", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-hedera-real"
      metadata.origin = "test-origin"
      metadata.description = "Test Hedera transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.metadata = metadata
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toBe("0.0.123@1234567890.123456789")
    })

    it("should successfully send Ethereum transaction and return transaction hash", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-ethereum-real"
      metadata.origin = "test-origin"
      metadata.description = "Test Ethereum transaction"

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.metadata = metadata
      signedTransaction.format = "ethereum"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toBe("0x1234567890abcdef1234567890abcdef12345678")
    })

    it("should handle transactions with minimal metadata", async () => {
      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toBe("0.0.123@1234567890.123456789")
    })

    it("should return Promise<string> for both blockchain types", async () => {
      const hederaTransaction = new SignedTransactionMessage()
      hederaTransaction.payload = "0x1234567890abcdef"
      hederaTransaction.format = "hedera"

      const ethereumTransaction = new SignedTransactionMessage()
      ethereumTransaction.payload = "0xabcdef1234567890"
      ethereumTransaction.format = "ethereum"

      const hederaPromise = adapter.sendTransaction(hederaTransaction)
      const ethereumPromise = adapter.sendTransaction(ethereumTransaction)

      expect(hederaPromise).toBeInstanceOf(Promise)
      expect(ethereumPromise).toBeInstanceOf(Promise)

      const hederaResult = await hederaPromise
      const ethereumResult = await ethereumPromise

      expect(typeof hederaResult).toBe("string")
      expect(typeof ethereumResult).toBe("string")
    })
  })
})
