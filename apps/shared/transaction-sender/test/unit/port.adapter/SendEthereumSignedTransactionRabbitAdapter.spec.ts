import type { NestJSCommandBus } from '@hashgraph/green-bonds-shared-core';
import { SendEthereumSignedTransactionRabbitAdapter } from '../../../src/port.adapter/ethereum/sendsignedtransaction/SendEthereumSignedTransactionRabbitAdapter';
import { SendSignedTransactionCommand } from '../../../src/app/command/sendsignedtransaction/SendSignedTransactionCommand';
import { SignedTransactionMessage } from '../../../src/domain/model/SignedTransactionMessage';
import { TransactionMetadata } from '../../../src/domain/model/TransactionMetadata';

describe('SendEthereumSignedTransactionRabbitAdapter', () => {
  let adapter: SendEthereumSignedTransactionRabbitAdapter;
  let mockCommandBus: jest.Mocked<NestJSCommandBus>;

  beforeEach(() => {
    mockCommandBus = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<NestJSCommandBus>;

    adapter = new SendEthereumSignedTransactionRabbitAdapter(mockCommandBus);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('onEthereumMessage', () => {
    it('should execute SendSignedTransactionCommand when receiving a valid message', async () => {
      const mockMetadata: TransactionMetadata = {
        requestId: 'test-request-id',
        origin: 'test-origin',
        description: 'test-description',
      };

      const mockMessage: SignedTransactionMessage = {
        payload: '0x1234567890abcdef',
        metadata: mockMetadata,
      };

      mockCommandBus.execute.mockResolvedValue(undefined);

      await adapter.onEthereumMessage(mockMessage);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(SendSignedTransactionCommand),
      );

      const executedCommand = mockCommandBus.execute.mock
        .calls[0][0] as SendSignedTransactionCommand;
      expect(executedCommand.payload).toBe(mockMessage.payload);
      expect(executedCommand.metadata).toBe(mockMessage.metadata);
      expect(executedCommand.format).toBe('ethereum');
    });

    it('should handle command execution errors gracefully', async () => {
      const mockMetadata: TransactionMetadata = {
        requestId: 'test-request-id',
        origin: 'test-origin',
        description: 'test-description',
      };

      const mockMessage: SignedTransactionMessage = {
        payload: '0x1234567890abcdef',
        metadata: mockMetadata,
      };

      const error = new Error('Command execution failed');
      mockCommandBus.execute.mockRejectedValue(error);

      await expect(adapter.onEthereumMessage(mockMessage)).rejects.toThrow(
        error,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should create command with correct format', async () => {
      const mockMetadata: TransactionMetadata = {
        requestId: 'test-request-id',
        origin: 'test-origin',
        description: 'test-description',
      };

      const mockMessage: SignedTransactionMessage = {
        payload: '0xabcdef1234567890',
        metadata: mockMetadata,
      };

      mockCommandBus.execute.mockResolvedValue(undefined);

      await adapter.onEthereumMessage(mockMessage);

      const executedCommand = mockCommandBus.execute.mock
        .calls[0][0] as SendSignedTransactionCommand;
      expect(executedCommand.format).toBe('ethereum');
    });
  });
});
