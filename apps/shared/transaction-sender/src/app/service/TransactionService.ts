import { CommandBus } from '@nestjs/cqrs';
import { SendSignedTransactionCommand } from '../command/send-signed-transaction/SendSignedTransactionCommand';
import { Singleton, Logger } from '@hashgraph/green-bonds-shared-core';

interface TransactionMetadata {
  requestId: string;
  origin: string;
  description: string;
}

@Singleton()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly commandBus: CommandBus) {}

  async processSignedTransaction(
    payload: string,
    metadata: TransactionMetadata,
    format: string,
  ): Promise<void> {
    const startTime = Date.now();
    const requestId = metadata?.requestId || 'unknown';

    this.logger.log(`Processing signed transaction`, {
      requestId,
      format,
      payloadLength: payload.length,
    });

    try {
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
