// SPDX-License-Identifier: Apache-2.0

import { CommandBus } from '@nestjs/cqrs';
import { Singleton, Logger } from '@hashgraph/green-bonds-shared-core';

import { HederaTransactionPort } from './HederaTransactionPort';
import { SendSignedTransactionCommand } from '../../app/command/sendsignedtransaction/SendSignedTransactionCommand';
import { SignedTransactionMessage } from '../../domain/model/SignedTransactionMessage';
import { RabbitMQDecoratorFactory } from '../../config/RabbitMQDecoratorFactory';

/**
 * RabbitMQ adapter for processing Hedera signed transactions.
 * Implements the HederaTransactionPort to handle Hedera-specific message processing.
 * This adapter is responsible for:
 * - Receiving Hedera transaction messages from RabbitMQ
 * - Validating and logging Hedera transaction data
 * - Executing business commands for Hedera transactions
 * - Handling Hedera-specific error scenarios
 */
@Singleton()
export class HederaTransactionRabbitAdapter implements HederaTransactionPort {
  private readonly logger = new Logger(HederaTransactionRabbitAdapter.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitMQDecoratorFactory.createHederaSubscribe()
  async onHederaMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || 'unknown';
    const startTime = Date.now();

    this.logger.log(`Received Hedera transaction`, {
      requestId: msg.metadata?.requestId,
      payloadLength: msg.payload?.length,
      blockchain: 'hedera',
    });

    try {
      const command = new SendSignedTransactionCommand(
        msg.payload,
        msg.metadata!,
        'hedera',
      );
      await this.commandBus.execute(command);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Successfully processed Hedera transaction with requestId: ${requestId}`,
        {
          requestId,
          format: 'hedera',
          duration,
          blockchain: 'hedera',
        },
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to process Hedera transaction with requestId: ${requestId}. Error: ${errorMessage}`,
        {
          requestId,
          format: 'hedera',
          duration,
          error: errorStack,
          blockchain: 'hedera',
        },
      );
      throw error;
    }
  }
}
