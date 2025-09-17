import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { TransactionService } from '../../app/service/TransactionService';
import { SignedTransactionMessage } from '../../domain/model/SignedTransactionMessage';
import { ValidationError } from '../../domain/error/TransactionSenderError';

@Injectable()
export class RabbitMQIncomingHandler {
  private readonly logger = new Logger(RabbitMQIncomingHandler.name);

  constructor(private readonly transactionService: TransactionService) {}

  @RabbitSubscribe({
    exchange: 'tx',
    routingKey: 'hederaFormat.incoming',
    queue: 'hederaFormat.incoming',
  })
  async onHederaMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || 'unknown';

    this.logger.log(
      `Received Hedera transaction message with requestId: ${requestId}`,
    );
    this.logger.debug(
      `Hedera message payload length: ${msg.payload?.length || 0} characters`,
    );

    try {
      await this.validateMessage(msg, 'hedera');

      await this.transactionService.processSignedTransaction(
        msg.payload,
        msg.metadata,
        'hedera',
      );

      this.logger.log(
        `Successfully processed Hedera transaction with requestId: ${requestId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to process Hedera transaction with requestId: ${requestId}. Error: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'tx',
    routingKey: 'ethereumFormat.incoming',
    queue: 'ethereumFormat.incoming',
  })
  async onEthereumMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || 'unknown';

    this.logger.log(
      `Received Ethereum transaction message with requestId: ${requestId}`,
    );
    this.logger.debug(
      `Ethereum message payload length: ${msg.payload?.length || 0} characters`,
    );

    try {
      await this.validateMessage(msg, 'ethereum');

      await this.transactionService.processSignedTransaction(
        msg.payload,
        msg.metadata,
        'ethereum',
      );

      this.logger.log(
        `Successfully processed Ethereum transaction with requestId: ${requestId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to process Ethereum transaction with requestId: ${requestId}. Error: ${errorMessage}`,
        errorStack,
      );

      throw error;
    }
  }

  private async validateMessage(msg: unknown, format: string): Promise<void> {
    this.logger.debug(`Validating ${format} message structure`);

    const transactionMessage = plainToClass(SignedTransactionMessage, msg);

    const validationErrors = await validate(transactionMessage);

    if (validationErrors.length > 0) {
      const errorMessages = validationErrors
        .map((error) => {
          const constraints = error.constraints || {};
          return `${error.property}: ${Object.values(constraints).join(', ')}`;
        })
        .join('; ');

      this.logger.error(
        `Validation failed for ${format} message: ${errorMessages}`,
      );
      throw new ValidationError(
        `${format} message validation failed: ${errorMessages}`,
      );
    }

    if (typeof msg !== 'object' || msg === null) {
      throw new ValidationError(`${format} message must be a valid object`);
    }

    const msgObj = msg as Record<string, unknown>;

    if (!msgObj.payload || typeof msgObj.payload !== 'string') {
      throw new ValidationError(
        `${format} message must have a valid payload string`,
      );
    }

    if (
      !msgObj.metadata ||
      typeof msgObj.metadata !== 'object' ||
      msgObj.metadata === null
    ) {
      throw new ValidationError(
        `${format} message must have valid metadata object`,
      );
    }

    const metadata = msgObj.metadata as Record<string, unknown>;
    if (!metadata.requestId) {
      throw new ValidationError(
        `${format} message metadata must include requestId`,
      );
    }

    this.logger.debug(`${format} message structure validation passed`);
  }
}
