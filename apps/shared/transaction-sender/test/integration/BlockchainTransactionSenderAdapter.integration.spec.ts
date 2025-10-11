// SPDX-License-Identifier: Apache-2.0

import { BlockchainTransactionSenderAdapter } from "../../src/port.adapter/transactionsender/BlockchainTransactionSenderAdapter"
import { SignedTransactionRequest } from "../../src/domain/model/SignedTransactionRequest"
import { TransactionMetadata } from "../../src/domain/model/TransactionMetadata"

jest.mock("@hashgraph/sdk", () => ({
  Client: {
    forTestnet: jest.fn().mockReturnValue({
      close: jest.fn(),
    }),
  },
  Transaction: {
    fromBytes: jest.fn().mockImplementation((bytes) => {
      if (!bytes || bytes.length === 0) {
        throw new Error("Invalid transaction bytes")
      }
      return {
        execute: jest.fn().mockResolvedValue({
          transactionId: {
            toString: jest.fn().mockReturnValue(`0.0.123@${Date.now()}.${Math.floor(Math.random() * 1000000)}`),
          },
          getReceipt: jest.fn().mockResolvedValue({
            status: "SUCCESS",
          }),
        }),
      }
    }),
  },
}))

jest.mock("ethers", () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        sendTransaction: jest.fn().mockImplementation((rawTx) => {
          if (!rawTx || !rawTx.startsWith("0x")) {
            throw new Error("Invalid transaction format")
          }
          const generateEthHash = () => {
            return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
          }

          return Promise.resolve({
            hash: generateEthHash(),
            wait: jest.fn().mockResolvedValue({
              transactionHash: generateEthHash(),
              status: 1,
              blockNumber: Math.floor(Math.random() * 1000000),
            }),
          })
        }),
      })),
    },
  },
}))

describe("BlockchainTransactionSenderAdapter Integration Tests", () => {
  let adapter: BlockchainTransactionSenderAdapter

  beforeEach(() => {
    adapter = new BlockchainTransactionSenderAdapter()
    jest.clearAllMocks()
  })

  describe("Hedera Transaction Integration", () => {
    it("should handle realistic Hedera transaction payload", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "hedera-integration-test-001"
      metadata.origin = "treasury-service"
      metadata.description = "Bond issuance transaction"
      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload =
        "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878320072240a220a0f0a09" +
        "08051205746f6b656e120508051203666565180112090a0708051205746f6b656e"
      signedTransaction.metadata = metadata
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toHaveProperty("transactionId")
      expect(result).toHaveProperty("status")
      expect(result.transactionId).toMatch(/^0\.0\.\d+@\d+\.\d+$/)
      expect(result.status).toBe("success")
    })

    it("should handle error when Hedera payload is invalid", async () => {
      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "0xinvalid"
      signedTransaction.format = "hedera"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toHaveProperty("status", "failed")
      expect(result).toHaveProperty("errorCode")
      expect(result.errorCode).toBeDefined()
    })
  })

  describe("Ethereum Transaction Integration", () => {
    it("should handle realistic Ethereum transaction payload", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "ethereum-integration-test-001"
      metadata.origin = "treasury-service"
      metadata.description = "ERC-20 token transfer"

      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload =
        "0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a764000080" +
        "25a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761a" +
        "ecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83"
      signedTransaction.metadata = metadata
      signedTransaction.format = "ethereum"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toHaveProperty("transactionId")
      expect(result).toHaveProperty("status")
      expect(result.transactionId).toMatch(/^0x[a-fA-F0-9]{64}$/)
      expect(result.status).toBe("success")
    })

    it("should handle error when Ethereum payload is invalid", async () => {
      const signedTransaction = new SignedTransactionRequest()
      signedTransaction.payload = "invalid-no-hex"
      signedTransaction.format = "ethereum"

      const result = await adapter.sendTransaction(signedTransaction)

      expect(result).toHaveProperty("status", "failed")
      expect(result).toHaveProperty("errorCode")
      expect(result.errorCode).toBeDefined()
    })
  })

  describe("Performance and Reliability", () => {
    it("should handle multiple concurrent transactions", async () => {
      const transactions = Array.from({ length: 5 }, (_, i) => {
        const metadata = new TransactionMetadata()
        metadata.requestId = `concurrent-test-${i}`
        metadata.origin = "load-test"

        const signedTransaction = new SignedTransactionRequest()
        signedTransaction.payload =
          i % 2 === 0
            ? "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878320072240a220a0f0a09" +
              "08051205746f6b656e120508051203666565180112090a0708051205746f6b656e"
            : "0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a764000080" +
              "25a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761a" +
              "ecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83"
        signedTransaction.metadata = metadata
        signedTransaction.format = i % 2 === 0 ? "hedera" : "ethereum"
        return signedTransaction
      })

      const results = await Promise.all(transactions.map((tx) => adapter.sendTransaction(tx)))

      expect(results).toHaveLength(5)
      results.forEach((result, i) => {
        expect(result).toHaveProperty("transactionId")
        expect(result).toHaveProperty("status")
        expect(result.status).toBe("success")
        if (i % 2 === 0) {
          expect(result.transactionId).toMatch(/^0\.0\.\d+@\d+\.\d+$/)
        } else {
          expect(result.transactionId).toMatch(/^0x[a-fA-F0-9]{64}$/)
        }
      })
    })
  })
})
