import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { SignedTransactionMessage } from '../../domain/model/SignedTransactionMessage';
import { PayloadValidationService } from '../../domain/service/PayloadValidationService';
import { ValidationError } from '../../domain/error/TransactionSenderError';
import { SendSignedTransactionCommand } from '../command/send-signed-transaction/SendSignedTransactionCommand';

interface TransactionMetadata {
  requestId: string;
  origin: string;
  description: string;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly payloadValidationService: PayloadValidationService,
  ) {}

  async processSignedTransaction(
    payload: string,
    metadata: TransactionMetadata,
    format: 'hedera' | 'ethereum',
  ): Promise<void> {
    const startTime = Date.now();
    const requestId = metadata?.requestId || 'unknown';

    this.logger.log(`Processing signed transaction`, {
      requestId,
      format,
      payloadLength: payload.length,
    });

    try {
      const message = plainToClass(SignedTransactionMessage, {
        payload,
        metadata,
        format,
      });

      const validationErrors = await validate(message);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');
        throw new ValidationError(`Validation failed: ${errorMessages}`);
      }

      if (format === 'hedera') {
        this.payloadValidationService.validateHederaPayload(payload);
      } else if (format === 'ethereum') {
        this.payloadValidationService.validateEthereumPayload(payload);
      }

      const command = new SendSignedTransactionCommand(
        payload,
        metadata,
        format,
      );
      await this.commandBus.execute(command);

      const duration = Date.now() - startTime;
      this.logger.log(`Transaction processed successfully`, {
        requestId,
        format,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Failed to process transaction: ${errorMessage}`, {
        requestId,
        format,
        duration,
        error: errorStack,
      });
      throw error;
    }
  }
}
