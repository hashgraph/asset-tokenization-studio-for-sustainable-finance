// SPDX-License-Identifier: Apache-2.0

import { CommandBus } from '@nestjs/cqrs';
import { Singleton, Logger } from '@hashgraph/green-bonds-shared-core';

import { SendSignedTransactionPort } from './SendSignedTransactionPort';
import { SendSignedTransactionCommand } from '../../app/command/sendsignedtransaction/SendSignedTransactionCommand';
import { SignedTransactionMessage } from '../../domain/model/SignedTransactionMessage';
import { RabbitMQDecoratorFactory } from '../../config/RabbitMQDecoratorFactory';

@Singleton()
export class SendSignedTransactionRabbitAdapter
  implements SendSignedTransactionPort
{
  private readonly logger = new Logger(SendSignedTransactionRabbitAdapter.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitMQDecoratorFactory.createHederaSubscribe()
  async onHederaMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || 'unknown';
    const startTime = Date.now();

    this.logger.log(`Received Hedera transaction`, {
      requestId: msg.metadata?.requestId,
      payloadLength: msg.payload?.length,
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
        { requestId, format: 'hedera', duration },
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to process Hedera transaction with requestId: ${requestId}. Error: ${errorMessage}`,
        { requestId, format: 'hedera', duration, error: errorStack },
      );
      throw error;
    }
  }

  @RabbitMQDecoratorFactory.createEthereumSubscribe()
  async onEthereumMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || 'unknown';
    const startTime = Date.now();

    this.logger.log(`Received Ethereum transaction`, {
      requestId: msg.metadata?.requestId,
      payloadLength: msg.payload?.length,
    });

    try {
      const command = new SendSignedTransactionCommand(
        msg.payload,
        msg.metadata!,
        'ethereum',
      );
      await this.commandBus.execute(command);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Successfully processed Ethereum transaction with requestId: ${requestId}`,
        { requestId, format: 'ethereum', duration },
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to process Ethereum transaction with requestId: ${requestId}. Error: ${errorMessage}`,
        { requestId, format: 'ethereum', duration, error: errorStack },
      );

      throw error;
    }
  }
}
