import type { CommandBus } from "@hashgraph/green-bonds-shared-core"

import { SendSignedTransactionCommand } from "../../../src/app/sendsignedtransaction/command/SendSignedTransactionCommand"
import { SignedTransactionRequest } from "../../../src/domain/model/SignedTransactionRequest"
import { TransactionMetadata } from "../../../src/domain/model/TransactionMetadata"
import { SendHederaSignedTransactionRabbitAdapter } from "../../../src/port.adapter/transaction/usecase/sendsignedtransaction/hedera/SendHederaSignedTransactionRabbitAdapter"

describe("SendHederaSignedTransactionRabbitAdapter", () => {
  let adapter: SendHederaSignedTransactionRabbitAdapter
  let mockCommandBus: jest.Mocked<CommandBus>

  beforeEach(() => {
    mockCommandBus = {
      execute: jest.fn(),
    } as jest.Mocked<CommandBus>

    adapter = new SendHederaSignedTransactionRabbitAdapter(mockCommandBus)
  })

  it("should be defined", () => {
    expect(adapter).toBeDefined()
  })

  describe("onHederaMessage", () => {
    it("should execute SendSignedTransactionCommand when receiving a valid message", async () => {
      const mockMetadata: TransactionMetadata = {
        requestId: "test-request-id",
        origin: "test-origin",
        description: "test-description",
      }

      const mockMessage: SignedTransactionRequest = {
        payload: "0x1234567890abcdef",
        metadata: mockMetadata,
        format: "hedera",
      }

      mockCommandBus.execute.mockResolvedValue(undefined)

      await adapter.onHederaMessage(mockMessage)

      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1)

      expect(mockCommandBus.execute).toHaveBeenCalledWith(expect.any(SendSignedTransactionCommand))

      const executedCommand = mockCommandBus.execute.mock.calls[0][0] as SendSignedTransactionCommand
      expect(executedCommand.payload).toBe(mockMessage.payload)
      expect(executedCommand.metadata).toBe(mockMessage.metadata)
      expect(executedCommand.format).toBe("hedera")
    })

    it("should handle command execution errors gracefully", async () => {
      const mockMetadata: TransactionMetadata = {
        requestId: "test-request-id",
        origin: "test-origin",
        description: "test-description",
      }

      const mockMessage: SignedTransactionRequest = {
        payload: "0x1234567890abcdef",
        metadata: mockMetadata,
        format: "hedera",
      }

      const error = new Error("Command execution failed")
      mockCommandBus.execute.mockRejectedValue(error)

      await expect(adapter.onHederaMessage(mockMessage)).rejects.toThrow(error)

      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1)
    })

    it("should create command with correct format", async () => {
      const mockMetadata: TransactionMetadata = {
        requestId: "test-request-id",
        origin: "test-origin",
        description: "test-description",
      }

      const mockMessage: SignedTransactionRequest = {
        payload: "0xabcdef1234567890",
        metadata: mockMetadata,
        format: "hedera",
      }

      mockCommandBus.execute.mockResolvedValue(undefined)

      await adapter.onHederaMessage(mockMessage)

      const executedCommand = mockCommandBus.execute.mock.calls[0][0] as SendSignedTransactionCommand
      expect(executedCommand.format).toBe("hedera")
    })
  })
})
