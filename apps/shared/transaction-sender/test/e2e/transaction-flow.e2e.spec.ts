// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AppModule } from '../../src/AppModule';
import { HederaTransactionRabbitAdapter } from '../../src/port.adapter/hedera/HederaTransactionRabbitAdapter';
import { EthereumTransactionRabbitAdapter } from '../../src/port.adapter/ethereum/EthereumTransactionRabbitAdapter';
import { SignedTransactionMessage } from '../../src/domain/model/SignedTransactionMessage';
import { TransactionMetadata } from '../../src/domain/model/TransactionMetadata';
import { SendSignedTransactionCommand } from '../../src/app/command/sendsignedtransaction/SendSignedTransactionCommand';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

jest.mock('@hashgraph/green-bonds-shared-core', () => ({
  Singleton: () => (target: unknown) => target,
  Logger: jest.fn().mockImplementation(() => mockLogger),
}));

jest.mock('@golevelup/nestjs-rabbitmq', () => ({
  RabbitMQModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockRabbitMQModule {},
      providers: [],
      exports: [],
    }),
  },
  RabbitSubscribe:
    () =>
    (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('Transaction Flow E2E', () => {
  let app: TestingModule;
  let hederaAdapter: HederaTransactionRabbitAdapter;
  let ethereumAdapter: EthereumTransactionRabbitAdapter;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    app = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CommandBus)
      .useValue(mockCommandBus)
      .compile();

    hederaAdapter = app.get<HederaTransactionRabbitAdapter>(
      HederaTransactionRabbitAdapter,
    );
    ethereumAdapter = app.get<EthereumTransactionRabbitAdapter>(
      EthereumTransactionRabbitAdapter,
    );
    commandBus = app.get(CommandBus);

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Hedera Transaction Flow', () => {
    it('should process complete Hedera transaction flow successfully', async () => {
      const hederaMessage: SignedTransactionMessage = {
        payload: '0x1234567890abcdef1234567890abcdef',
        metadata: {
          requestId: 'hedera-req-123',
          origin: 'hedera-service',
          description: 'Hedera token transfer transaction',
        },
      };

      const executeMethod = jest.fn().mockResolvedValue(undefined);
      commandBus.execute = executeMethod;

      await hederaAdapter.onHederaMessage(hederaMessage);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Received Hedera transaction',
        {
          requestId: 'hedera-req-123',
          payloadLength: hederaMessage.payload.length,
          blockchain: 'hedera',
        },
      );

      expect(executeMethod).toHaveBeenCalledTimes(1);
      expect(executeMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: hederaMessage.payload,
          metadata: hederaMessage.metadata,
          format: 'hedera',
        }),
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Successfully processed Hedera transaction with requestId: hedera-req-123',
        ),
        expect.objectContaining({
          requestId: 'hedera-req-123',
          format: 'hedera',
          duration: expect.any(Number) as number,
        }),
      );
    });

    it('should handle Hedera transaction processing errors gracefully', async () => {
      // Arrange
      const hederaMessage: SignedTransactionMessage = {
        payload: '0x1234567890abcdef1234567890abcdef',
        metadata: {
          requestId: 'hedera-req-error',
          origin: 'hedera-service',
          description: 'Hedera transaction that will fail',
        },
      };

      const processingError = new Error('Command processing failed');
      const executeMethod = jest.fn().mockRejectedValue(processingError);
      commandBus.execute = executeMethod;

      await expect(
        hederaAdapter.onHederaMessage(hederaMessage),
      ).rejects.toThrow('Command processing failed');

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Received Hedera transaction',
        {
          requestId: 'hedera-req-error',
          payloadLength: hederaMessage.payload.length,
          blockchain: 'hedera',
        },
      );

      expect(executeMethod).toHaveBeenCalledTimes(1);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to process Hedera transaction with requestId: hedera-req-error',
        ),
        expect.objectContaining({
          requestId: 'hedera-req-error',
          format: 'hedera',
        }),
      );
    });
  });

  describe('Ethereum Transaction Flow', () => {
    it('should process complete Ethereum transaction flow successfully', async () => {
      const ethereumMessage: SignedTransactionMessage = {
        payload: '0xabcdef1234567890abcdef1234567890',
        metadata: {
          requestId: 'ethereum-req-456',
          origin: 'ethereum-service',
          description: 'Ethereum ERC-20 token transfer',
        },
      };

      const executeMethod = jest.fn().mockResolvedValue(undefined);
      commandBus.execute = executeMethod;

      await ethereumAdapter.onEthereumMessage(ethereumMessage);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Received Ethereum transaction',
        {
          requestId: 'ethereum-req-456',
          payloadLength: ethereumMessage.payload.length,
          blockchain: 'ethereum',
        },
      );

      expect(executeMethod).toHaveBeenCalledTimes(1);
      expect(executeMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: ethereumMessage.payload,
          metadata: ethereumMessage.metadata,
          format: 'ethereum',
        }),
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Successfully processed Ethereum transaction with requestId: ethereum-req-456',
        ),
        expect.objectContaining({
          requestId: 'ethereum-req-456',
          format: 'ethereum',
          duration: expect.any(Number) as number,
        }),
      );
    });

    it('should handle Ethereum transaction processing errors gracefully', async () => {
      const ethereumMessage: SignedTransactionMessage = {
        payload: '0xabcdef1234567890abcdef1234567890',
        metadata: {
          requestId: 'ethereum-req-error',
          origin: 'ethereum-service',
          description: 'Ethereum transaction that will fail',
        },
      };

      const processingError = new Error('Ethereum processing failed');
      const executeMethod = jest.fn().mockRejectedValue(processingError);
      commandBus.execute = executeMethod;

      await expect(
        ethereumAdapter.onEthereumMessage(ethereumMessage),
      ).rejects.toThrow('Ethereum processing failed');

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Received Ethereum transaction',
        {
          requestId: 'ethereum-req-error',
          payloadLength: ethereumMessage.payload.length,
          blockchain: 'ethereum',
        },
      );

      expect(executeMethod).toHaveBeenCalledTimes(1);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to process Ethereum transaction with requestId: ethereum-req-error. Error: Ethereum processing failed',
        expect.objectContaining({
          requestId: 'ethereum-req-error',
          format: 'ethereum',
        }),
      );
    });
  });

  describe('Transaction Service Integration', () => {
    it('should process transaction through command bus correctly', async () => {
      const payload = '0x1234567890abcdef1234567890abcdef';
      const metadata: TransactionMetadata = {
        requestId: 'service-req-789',
        origin: 'integration-test',
        description: 'Direct service integration test',
      };
      const format = 'hedera';

      const executeMethod = jest.fn().mockResolvedValue(undefined);
      commandBus.execute = executeMethod;

      await commandBus.execute(
        new SendSignedTransactionCommand(payload, metadata, format),
      );

      expect(executeMethod).toHaveBeenCalledTimes(1);
      expect(executeMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: payload,
          metadata: metadata,
          format: format,
        }),
      );
    });

    it('should handle missing metadata gracefully', async () => {
      const messageWithoutMetadata: SignedTransactionMessage = {
        payload: '0x1234567890abcdef1234567890abcdef',
      };

      const executeMethod = jest.fn().mockResolvedValue(undefined);
      commandBus.execute = executeMethod;

      await hederaAdapter.onHederaMessage(messageWithoutMetadata);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Received Hedera transaction',
        {
          requestId: undefined,
          payloadLength: messageWithoutMetadata.payload.length,
          blockchain: 'hedera',
        },
      );

      expect(executeMethod).toHaveBeenCalledTimes(1);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Received Hedera transaction',
        expect.objectContaining({
          requestId: undefined,
          payloadLength: expect.any(Number) as number,
        }),
      );
    });
  });

  describe('Performance and Timing', () => {
    it('should track transaction processing duration accurately', async () => {
      const payload = '0x1234567890abcdef1234567890abcdef';
      const metadata: TransactionMetadata = {
        requestId: 'perf-test-001',
        origin: 'performance-test',
        description: 'Performance timing test',
      };
      const format = 'ethereum';

      const executeMethod = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      commandBus.execute = executeMethod;

      const startTime = Date.now();

      await commandBus.execute(
        new SendSignedTransactionCommand(payload, metadata, format),
      );

      const endTime = Date.now();
      const actualDuration = endTime - startTime;

      expect(executeMethod).toHaveBeenCalledTimes(1);
      expect(actualDuration).toBeGreaterThanOrEqual(90);
      expect(actualDuration).toBeLessThanOrEqual(150);
    });
  });
});
