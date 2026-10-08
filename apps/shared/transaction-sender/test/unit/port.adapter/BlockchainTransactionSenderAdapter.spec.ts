// SPDX-License-Identifier: Apache-2.0

import { BlockchainTransactionSenderAdapter } from "../../../src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"
import { SignedTransactionRequest } from "../../../src/domain/model/SignedTransactionRequest"
import { TransactionMetadata } from "../../../src/domain/model/TransactionMetadata"
import { BlockchainError } from "../../../src/domain/errors/BlockchainError"

jest.mock("@hiero-ledger/sdk", () => ({
  Client: {
    forTestnet: jest.fn().mockReturnValue({
      close: jest.fn(),
    }),
    forMainnet: jest.fn().mockReturnValue({
      close: jest.fn(),
    }),
    forPreviewnet: jest.fn().mockReturnValue({
      close: jest.fn(),
    }),
    forNetwork: jest.fn().mockReturnValue({
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
    TIMEOUT: "TIMEOUT",
    BUSY: "BUSY",
  },
}))

jest.mock("ethers", () => {
  class MockContractFactory {}
  class MockContract {}
  return {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      broadcastTransaction: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          hash: "0x1234567890abcdef1234567890abcdef12345678",
          status: 1,
        }),
      }),
    })),
    ContractFactory: MockContractFactory,
    Contract: MockContract,
  }
})

const mockConfigService = {
  getNetwork: jest.fn().mockReturnValue("testnet"),
  getLogLevel: jest.fn().mockReturnValue("info"),
}

describe("BlockchainTransactionSenderAdapter", () => {
  let adapter: BlockchainTransactionSenderAdapter

  beforeEach(() => {
    adapter = new BlockchainTransactionSenderAdapter(mockConfigService as any)
    jest.clearAllMocks()
  })

  describe("sendTransaction", () => {
    it("should successfully send Hedera transaction and return transaction ID", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "test-hedera-real"
      metadata.origin = "test-origin"
      metadata.description = "Test Hedera transaction"

      const signedTransaction = new SignedTransactionRequest()
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

      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.metadata = metadata
      signedTransaction.format = "ethereum"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toEqual({
        transactionId: "0x1234567890abcdef1234567890abcdef12345678",
        status: "success",
      })
    })

    // NEW BEHAVIOR: Now throws BlockchainError instead of returning failed status
    it("should throw BlockchainError for Hedera receipt errors", async () => {
      const { Transaction } = jest.requireMock("@hiero-ledger/sdk")
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

      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"

      await expect(adapter.sendTransaction(signedTransaction)).rejects.toThrow(BlockchainError)

      try {
        await adapter.sendTransaction(signedTransaction)
      } catch (error: any) {
        expect(error.errorCode).toBe("INSUFFICIENT_ACCOUNT_BALANCE")
        expect(error.transactionId).toBe("0.0.123@1234567890.123456789")
        expect(error.isTransient).toBe(false) // Validation error - not transient
      }
    })

    it("should throw BlockchainError for Hedera execution errors", async () => {
      const { Transaction } = jest.requireMock("@hiero-ledger/sdk")
      const mockError = {
        status: "INVALID_TRANSACTION",
      }

      Transaction.fromBytes.mockReturnValueOnce({
        execute: jest.fn().mockRejectedValue(mockError),
      })

      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "0x1234567890abcdef"
      signedTransaction.format = "hedera"

      try {
        await adapter.sendTransaction(signedTransaction)
        fail("Should have thrown BlockchainError")
      } catch (error: any) {
        expect(error).toBeInstanceOf(BlockchainError)
        expect(error.errorCode).toBe("INVALID_TRANSACTION")
        expect(error.isTransient).toBe(false)
      }
    })

    it("should throw BlockchainError for Ethereum reverted transactions", async () => {
      const { JsonRpcProvider } = jest.requireMock("ethers")
      const mockProvider = {
        broadcastTransaction: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({
            hash: "0x1234567890abcdef1234567890abcdef12345678",
            status: 0, // Failed
          }),
        }),
      }

      JsonRpcProvider.mockImplementationOnce(() => mockProvider)

      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.format = "ethereum"

      try {
        await adapter.sendTransaction(signedTransaction)
        fail("Should have thrown BlockchainError")
      } catch (error: any) {
        expect(error).toBeInstanceOf(BlockchainError)
        expect(error.errorCode).toBe("CONTRACT_REVERT_EXECUTION")
        expect(error.isTransient).toBe(false) // Contract revert is not transient
      }
    })

    it("should throw BlockchainError for Ethereum execution errors", async () => {
      const { JsonRpcProvider } = jest.requireMock("ethers")
      const mockError = {
        code: "INSUFFICIENT_FUNDS",
      }

      const mockProvider = {
        broadcastTransaction: jest.fn().mockRejectedValue(mockError),
      }

      JsonRpcProvider.mockImplementationOnce(() => mockProvider)

      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "0xabcdef1234567890"
      signedTransaction.format = "ethereum"

      try {
        await adapter.sendTransaction(signedTransaction)
        fail("Should have thrown BlockchainError")
      } catch (error: any) {
        expect(error).toBeInstanceOf(BlockchainError)
        expect(error.errorCode).toBe("INSUFFICIENT_FUNDS")
        expect(error.isTransient).toBe(false) // Validation error
      }
    })
  })
})
