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
  Status: {
    INSUFFICIENT_ACCOUNT_BALANCE: "INSUFFICIENT_ACCOUNT_BALANCE",
    INVALID_TRANSACTION: "INVALID_TRANSACTION",
  },
}))

jest.mock("ethers", () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        sendTransaction: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({
            transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
            status: 1,
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
      sendHederaSpy.mockResolvedValue({
        transactionId: "0.0.123@1234567890.123456789",
        status: "success",
      })

      const result = await adapter.sendTransaction(signedTransaction)

      expect(sendHederaSpy).toHaveBeenCalledWith(signedTransaction)
      expect(result).toEqual({
        transactionId: "0.0.123@1234567890.123456789",
        status: "success",
      })
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
      sendEthereumSpy.mockResolvedValue({
        transactionId: "0x1234567890abcdef1234567890abcdef12345678",
        status: "success",
      })

      const result = await adapter.sendTransaction(signedTransaction)

      expect(sendEthereumSpy).toHaveBeenCalledWith(signedTransaction)
      expect(result).toEqual({
        transactionId: "0x1234567890abcdef1234567890abcdef12345678",
        status: "success",
      })
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

      expect(result).toEqual({
        transactionId: "0.0.123@1234567890.123456789",
        status: "success",
      })
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

      expect(result).toEqual({
        transactionId: "0x1234567890abcdef1234567890abcdef12345678",
        status: "success",
      })
    })

    it("should handle transactions with minimal metadata", async () => {
      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toEqual({
        transactionId: "0.0.123@1234567890.123456789",
        status: "success",
      })
    })

    it("should return Promise<TransactionResult> for both blockchain types", async () => {
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

      expect(hederaResult).toHaveProperty("transactionId")
      expect(hederaResult).toHaveProperty("status")
      expect(ethereumResult).toHaveProperty("transactionId")
      expect(ethereumResult).toHaveProperty("status")
    })

    it("should handle Hedera transaction receipt errors with error details", async () => {
      const { Transaction } = jest.requireMock("@hashgraph/sdk")
      const mockError = {
        status: "INSUFFICIENT_ACCOUNT_BALANCE",
      }

      Transaction.fromBytes.mockReturnValueOnce({
        execute: jest.fn().mockResolvedValue({
          transactionId: {
            toString: jest.fn().mockReturnValue("0.0.123@1234567890.123456789"),
          },
          getReceipt: jest.fn().mockRejectedValue(mockError),
        }),
      })

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toEqual({
        transactionId: "0.0.123@1234567890.123456789",
        status: "failed",
        errorCode: "INSUFFICIENT_ACCOUNT_BALANCE",
      })
    })

    it("should handle Hedera transaction execution errors with error details", async () => {
      const { Transaction } = jest.requireMock("@hashgraph/sdk")
      const mockError = {
        status: "INVALID_TRANSACTION",
      }

      Transaction.fromBytes.mockReturnValueOnce({
        execute: jest.fn().mockRejectedValue(mockError),
      })

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toEqual({
        transactionId: "EXECUTION_FAILED",
        status: "failed",
        errorCode: "INVALID_TRANSACTION",
      })
    })

    it("should handle Ethereum transaction reverted with error details", async () => {
      const { ethers } = jest.requireMock("ethers")
      const mockProvider = {
        sendTransaction: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({
            transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
            status: 0, // Transaction reverted
          }),
        }),
      }

      ethers.providers.JsonRpcProvider.mockImplementationOnce(() => mockProvider)

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.format = "ethereum"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toEqual({
        transactionId: "0x1234567890abcdef1234567890abcdef12345678",
        status: "failed",
        errorCode: "CALL_EXCEPTION",
      })
    })

    it("should handle Ethereum transaction execution errors with error details", async () => {
      const { ethers } = jest.requireMock("ethers")
      const mockError = {
        code: "INSUFFICIENT_FUNDS",
      }

      const mockProvider = {
        sendTransaction: jest.fn().mockRejectedValue(mockError),
      }

      ethers.providers.JsonRpcProvider.mockImplementationOnce(() => mockProvider)

      const signedTransaction = new SignedTransactionMessage()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.format = "ethereum"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toEqual({
        transactionId: "EXECUTION_FAILED",
        status: "failed",
        errorCode: "INSUFFICIENT_FUNDS",
      })
    })
  })
})
