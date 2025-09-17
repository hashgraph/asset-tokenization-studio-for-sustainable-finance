import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Singleton, Logger } from '@hashgraph/green-bonds-shared-core';

import { RabbitMQIncomingPort } from './RabbitMQIncomingPort';
import { TransactionService } from '../../app/service/TransactionService';
import { SignedTransactionMessage } from '../../domain/model/SignedTransactionMessage';

@Singleton()
export class RabbitMQIncomingAdapter implements RabbitMQIncomingPort {
  private readonly logger = new Logger(RabbitMQIncomingAdapter.name);

  constructor(private readonly transactionService: TransactionService) {}

  @RabbitSubscribe({
    exchange: 'tx',
    routingKey: 'hederaFormat.incoming',
    queue: 'hederaFormat.incoming',
  })
  async onHederaMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || 'unknown';

    this.logger.log(`Received Hedera transaction`, {
      requestId: msg.metadata?.requestId,
      payloadLength: msg.payload?.length,
    });

    try {
      await this.transactionService.processSignedTransaction(
        msg.payload,
        msg.metadata!,
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

    this.logger.log(`Received Ethereum transaction`, {
      requestId: msg.metadata?.requestId,
      payloadLength: msg.payload?.length,
    });

    try {
      await this.transactionService.processSignedTransaction(
        msg.payload,
        msg.metadata!,
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
}
