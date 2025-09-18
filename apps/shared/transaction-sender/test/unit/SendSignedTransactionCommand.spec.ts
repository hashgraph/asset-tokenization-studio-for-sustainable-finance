// SPDX-License-Identifier: Apache-2.0

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SendSignedTransactionCommand } from '../../src/app/command/sendsignedtransaction/SendSignedTransactionCommand';
import { TransactionMetadata } from '../../src/domain/model/TransactionMetadata';

describe('SendSignedTransactionCommand', () => {
  describe('Validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        payload: 'valid-signed-transaction-payload',
        metadata: {
          origin: 'test-origin',
          description: 'Test transaction description',
          requestId: 'req-123',
        } as TransactionMetadata,
        format: 'hedera',
      };

      const command = plainToClass(SendSignedTransactionCommand, validData);
      const errors = await validate(command);

      expect(errors).toHaveLength(0);
      expect(command.payload).toBe(validData.payload);
      expect(command.metadata).toEqual(validData.metadata);
      expect(command.format).toBe(validData.format);
    });

    it('should fail validation when payload is empty', async () => {
      const invalidData = {
        payload: '',
        metadata: {
          origin: 'test-origin',
          description: 'Test transaction description',
          requestId: 'req-123',
        } as TransactionMetadata,
        format: 'hedera',
      };

      const command = plainToClass(SendSignedTransactionCommand, invalidData);
      const errors = await validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when payload is not a string', async () => {
      const invalidData = {
        payload: 123,
        metadata: {
          origin: 'test-origin',
          description: 'Test transaction description',
          requestId: 'req-123',
        } as TransactionMetadata,
        format: 'hedera',
      };

      const command = plainToClass(SendSignedTransactionCommand, invalidData);
      const errors = await validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when format is invalid', async () => {
      const invalidData = {
        payload: 'valid-payload',
        metadata: {
          origin: 'test-origin',
          description: 'Test transaction description',
          requestId: 'req-123',
        } as TransactionMetadata,
        format: 'invalid-format',
      };

      const command = plainToClass(SendSignedTransactionCommand, invalidData);
      const errors = await validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('format');
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should fail validation when metadata is missing', async () => {
      const invalidData = {
        payload: 'valid-payload',
        metadata: null,
        format: 'hedera',
      };

      const command = plainToClass(SendSignedTransactionCommand, invalidData);
      const errors = await validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
      expect(errors[0].constraints).toHaveProperty('nestedValidation');
    });

    it('should validate nested metadata object', async () => {
      const invalidData = {
        payload: 'valid-payload',
        metadata: {
          origin: '',
          description: 'Test description',
          requestId: 'req-123',
        },
        format: 'hedera',
      };

      const command = plainToClass(SendSignedTransactionCommand, invalidData);
      const errors = await validate(command);

      expect(errors.length).toBeGreaterThan(0);
      const metadataError = errors.find(
        (error) => error.property === 'metadata',
      );
      expect(metadataError).toBeDefined();
    });
  });

  describe('Constructor', () => {
    it('should create command with all properties', () => {
      const payload = 'test-payload';
      const metadata = {
        origin: 'test-origin',
        description: 'Test transaction description',
        requestId: 'req-123',
      } as TransactionMetadata;
      const format = 'hedera';

      const command = new SendSignedTransactionCommand(
        payload,
        metadata,
        format,
      );

      expect(command.payload).toBe(payload);
      expect(command.metadata).toBe(metadata);
      expect(command.format).toBe(format);
    });
  });

  describe('Supported formats', () => {
    it.each(['hedera', 'ethereum'])(
      'should accept %s format',
      async (format) => {
        const validData = {
          payload: 'valid-payload',
          metadata: {
            origin: 'test-origin',
            description: 'Test transaction description',
            requestId: 'req-123',
          } as TransactionMetadata,
          format,
        };

        const command = plainToClass(SendSignedTransactionCommand, validData);
        const errors = await validate(command);

        expect(errors).toHaveLength(0);
        expect(command.format).toBe(format);
      },
    );
  });
});
