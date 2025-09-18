// SPDX-License-Identifier: Apache-2.0

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TransactionMetadata } from '../../../src/domain/model/TransactionMetadata';

describe('TransactionMetadata', () => {
  describe('Validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        origin: 'hedera-service',
        description: 'Transfer tokens between accounts',
        requestId: 'req-12345',
      };

      const metadata = plainToClass(TransactionMetadata, validData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty origin', async () => {
      const invalidData = {
        origin: '',
        description: 'Transfer tokens between accounts',
        requestId: 'req-12345',
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('origin');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string origin', async () => {
      const invalidData = {
        origin: 123,
        description: 'Transfer tokens between accounts',
        requestId: 'req-12345',
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('origin');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with empty description', async () => {
      const invalidData = {
        origin: 'hedera-service',
        description: '',
        requestId: 'req-12345',
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string description', async () => {
      const invalidData = {
        origin: 'hedera-service',
        description: null,
        requestId: 'req-12345',
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with empty requestId', async () => {
      const invalidData = {
        origin: 'hedera-service',
        description: 'Transfer tokens between accounts',
        requestId: '',
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('requestId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string requestId', async () => {
      const invalidData = {
        origin: 'hedera-service',
        description: 'Transfer tokens between accounts',
        requestId: 12345,
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('requestId');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with missing fields', async () => {
      const invalidData = {};

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(3);
      const properties = errors.map((error) => error.property);
      expect(properties).toContain('origin');
      expect(properties).toContain('description');
      expect(properties).toContain('requestId');
    });

    it('should fail validation with multiple invalid fields', async () => {
      const invalidData = {
        origin: '',
        description: '',
        requestId: '',
      };

      const metadata = plainToClass(TransactionMetadata, invalidData);
      const errors = await validate(metadata);

      expect(errors).toHaveLength(3);
      errors.forEach((error) => {
        expect(error.constraints).toHaveProperty('isNotEmpty');
      });
    });
  });

  describe('Constructor', () => {
    it('should create metadata with all properties', () => {
      const origin = 'hedera-service';
      const description = 'Transfer tokens between accounts';
      const requestId = 'req-12345';

      const metadata = new TransactionMetadata();
      metadata.origin = origin;
      metadata.description = description;
      metadata.requestId = requestId;

      expect(metadata.origin).toBe(origin);
      expect(metadata.description).toBe(description);
      expect(metadata.requestId).toBe(requestId);
    });
  });
});
