// SPDX-License-Identifier: Apache-2.0

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SignedTransactionMessage } from '../../../src/domain/model/SignedTransactionMessage';
import { TransactionMetadata } from '../../../src/domain/model/TransactionMetadata';

describe('SignedTransactionMessage', () => {
  describe('Validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        payload: '0x1234567890abcdef',
        metadata: {
          origin: 'test-service',
          description: 'Test transaction',
          requestId: 'req-123',
        },
      };

      const message = plainToClass(SignedTransactionMessage, validData);
      const errors = await validate(message);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with valid data and no metadata', async () => {
      const validData = {
        payload: '0x1234567890abcdef',
      };

      const message = plainToClass(SignedTransactionMessage, validData);
      const errors = await validate(message);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty payload', async () => {
      const invalidData = {
        payload: '',
        metadata: {
          origin: 'test-service',
          description: 'Test transaction',
          requestId: 'req-123',
        },
      };

      const message = plainToClass(SignedTransactionMessage, invalidData);
      const errors = await validate(message);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string payload', async () => {
      const invalidData = {
        payload: 123,
        metadata: {
          origin: 'test-service',
          description: 'Test transaction',
          requestId: 'req-123',
        },
      };

      const message = plainToClass(SignedTransactionMessage, invalidData);
      const errors = await validate(message);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with non-hexadecimal payload', async () => {
      const invalidData = {
        payload: 'not-hex-string',
        metadata: {
          origin: 'test-service',
          description: 'Test transaction',
          requestId: 'req-123',
        },
      };

      const message = plainToClass(SignedTransactionMessage, invalidData);
      const errors = await validate(message);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isHexadecimal');
    });

    it('should fail validation with invalid metadata', async () => {
      const invalidData = {
        payload: '0x1234567890abcdef',
        metadata: {
          origin: '',
          description: 'Test transaction',
          requestId: 'req-123',
        },
      };

      const message = plainToClass(SignedTransactionMessage, invalidData);
      const errors = await validate(message);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
      expect(errors[0].children).toHaveLength(1);
      expect(errors[0].children![0].property).toBe('origin');
      expect(errors[0].children![0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('Constructor', () => {
    it('should create message with all properties', () => {
      const payload = '0x1234567890abcdef';
      const metadata = {
        origin: 'test-service',
        description: 'Test transaction',
        requestId: 'req-123',
      } as TransactionMetadata;

      const message = new SignedTransactionMessage();
      message.payload = payload;
      message.metadata = metadata;

      expect(message.payload).toBe(payload);
      expect(message.metadata).toBe(metadata);
    });

    it('should create message without metadata', () => {
      const payload = '0x1234567890abcdef';

      const message = new SignedTransactionMessage();
      message.payload = payload;

      expect(message.payload).toBe(payload);
      expect(message.metadata).toBeUndefined();
    });
  });
});
