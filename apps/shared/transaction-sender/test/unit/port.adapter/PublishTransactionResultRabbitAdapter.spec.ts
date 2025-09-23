// SPDX-License-Identifier: Apache-2.0

import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
import { PublishTransactionResultRabbitAdapter } from "../../../src/port.adapter/publishtransactionresult/PublishTransactionResultRabbitAdapter"
import { TransactionMetadata } from "../../../src/domain/model/TransactionMetadata"
import type { TransactionResult } from "../../../src/port.adapter/publishtransactionresult/PublishTransactionResultPort"

jest.mock("../../../src/config/RabbitMQDecoratorFactory", () => ({
  RabbitMQDecoratorFactory: {
    getHederaOutgoingConfig: jest.fn().mockReturnValue({
      exchange: "tx",
      routingKey: "hederaFormat.outgoing",
      queue: "hederaFormat.outgoing",
    }),
    getEthereumOutgoingConfig: jest.fn().mockReturnValue({
      exchange: "tx",
      routingKey: "ethereumFormat.outgoing",
      queue: "ethereumFormat.outgoing",
    }),
  },
}))

describe("PublishTransactionResultRabbitAdapter", () => {
  let adapter: PublishTransactionResultRabbitAdapter
  let mockAmqpConnection: jest.Mocked<AmqpConnection>
  let mockPublish: jest.MockedFunction<AmqpConnection["publish"]>

  beforeEach(() => {
    mockPublish = jest.fn()
    mockAmqpConnection = {
      publish: mockPublish,
    } as unknown as jest.Mocked<AmqpConnection>

    adapter = new PublishTransactionResultRabbitAdapter(mockAmqpConnection)
  })

  it("should be defined", () => {
    expect(adapter).toBeDefined()
  })

  describe("publishResult", () => {
    it("should publish Hedera transaction result to correct queue", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "hedera-test-123"
      metadata.origin = "hedera-service"
      metadata.description = "Test Hedera transaction"

      const result: TransactionResult = {
        payload: "0x0a640a200a0c08b6a6c4a60610c0843d1a0c08b6a6c4a60610c0843d22020878",
        metadata: metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "success",
        errorCode: undefined,
      }

      await adapter.publishResult(result)

      expect(mockPublish).toHaveBeenCalledTimes(1)
      expect(mockPublish).toHaveBeenCalledWith(
        "tx",
        "hederaFormat.outgoing",
        {
          status: "success",
          txId: "0.0.123@1234567890.123456789",
          metadata: {
            origin: "hedera-service",
            description: "Test Hedera transaction",
            requestId: "hedera-test-123",
          },
          errorCode: undefined,
        },
        {
          persistent: true,
          headers: {
            format: "hedera",
            requestId: "hedera-test-123",
            origin: "hedera-service",
          },
        },
      )
    })

    it("should publish Ethereum transaction result to correct queue", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "ethereum-test-456"
      metadata.origin = "ethereum-service"
      metadata.description = "Test Ethereum transaction"

      const result: TransactionResult = {
        payload: "0xf86c808504a817c800825208943535353535353535353535353535353535353535",
        metadata: metadata,
        format: "ethereum",
        transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        status: "success",
        errorCode: undefined,
      }

      await adapter.publishResult(result)

      expect(mockPublish).toHaveBeenCalledTimes(1)
      expect(mockPublish).toHaveBeenCalledWith(
        "tx",
        "ethereumFormat.outgoing",
        {
          status: "success",
          txId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          metadata: {
            origin: "ethereum-service",
            description: "Test Ethereum transaction",
            requestId: "ethereum-test-456",
          },
          errorCode: undefined,
        },
        {
          persistent: true,
          headers: {
            format: "ethereum",
            requestId: "ethereum-test-456",
            origin: "ethereum-service",
          },
        },
      )
    })

    it("should handle failed transaction (no hash) with failed status", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "failed-test-789"
      metadata.origin = "test-service"
      metadata.description = "Failed transaction"

      const result: TransactionResult = {
        payload: "0xinvalidpayload",
        metadata: metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "failed",
        errorCode: "INVALID_TRANSACTION",
      }

      await adapter.publishResult(result)

      expect(mockPublish).toHaveBeenCalledTimes(1)
      const publishCall = mockPublish.mock.calls[0]
      const message = publishCall[2]

      expect(message.status).toBe("failed")
      expect(message.transactionHash).toBeUndefined()
    })

    it("should throw error for unsupported format", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "unsupported-test"

      const result: TransactionResult = {
        payload: "0xtest",
        metadata: metadata,
        format: "bitcoin",
        transactionHash: "0xhash",
        status: "success",
        errorCode: undefined,
      }

      await expect(adapter.publishResult(result)).rejects.toThrow("Unsupported transaction format: bitcoin")
      expect(mockPublish).not.toHaveBeenCalled()
    })

    it("should handle metadata with undefined fields gracefully", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "minimal-test"

      const result: TransactionResult = {
        payload: "0xtest",
        metadata: metadata,
        format: "ethereum",
        transactionHash: "0xhash",
        status: "success",
        errorCode: undefined,
      }

      await adapter.publishResult(result)

      expect(mockPublish).toHaveBeenCalledTimes(1)
      const publishCall = mockPublish.mock.calls[0]
      const message = publishCall[2]
      const headers = publishCall[3].headers

      expect(message.metadata.requestId).toBe("minimal-test")
      expect(message.metadata.origin).toBeUndefined()
      expect(message.metadata.description).toBeUndefined()
      expect(headers.requestId).toBe("minimal-test")
      expect(headers.origin).toBeUndefined()
    })

    it("should propagate AMQP connection errors", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "error-test"

      const result: TransactionResult = {
        payload: "0x1234567890abcdef",
        metadata: metadata,
        format: "hedera",
        transactionHash: "0.0.123@1234567890.123456789",
        status: "success",
        errorCode: undefined,
      }

      const error = new Error("AMQP connection failed")
      mockPublish.mockRejectedValue(error)

      await expect(adapter.publishResult(result)).rejects.toThrow("AMQP connection failed")
    })

    it("should propagate errorCode when transaction fails", async () => {
      const metadata = new TransactionMetadata()
      metadata.requestId = "error-code-test"
      metadata.origin = "error-service"
      metadata.description = "Test error code propagation"

      const result: TransactionResult = {
        payload: "0xerrorpayload",
        metadata: metadata,
        format: "hedera",
        transactionHash: "EXECUTION_FAILED",
        status: "failed",
        errorCode: "INSUFFICIENT_ACCOUNT_BALANCE",
      }

      await adapter.publishResult(result)

      expect(mockPublish).toHaveBeenCalledTimes(1)
      expect(mockPublish).toHaveBeenCalledWith(
        "tx",
        "hederaFormat.outgoing",
        {
          status: "failed",
          txId: "EXECUTION_FAILED",
          metadata: {
            origin: "error-service",
            description: "Test error code propagation",
            requestId: "error-code-test",
          },
          errorCode: "INSUFFICIENT_ACCOUNT_BALANCE",
        },
        {
          persistent: true,
          headers: {
            format: "hedera",
            requestId: "error-code-test",
            origin: "error-service",
          },
        },
      )
    })
  })
})
