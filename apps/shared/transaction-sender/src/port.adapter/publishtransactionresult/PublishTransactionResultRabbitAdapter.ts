// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
import { PublishTransactionResultPort, TransactionResult } from "./PublishTransactionResultPort"
import { RabbitMQDecoratorFactory } from "../../config/RabbitMQDecoratorFactory"

@Injectable()
export class PublishTransactionResultRabbitAdapter implements PublishTransactionResultPort {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishResult(result: TransactionResult): Promise<void> {
    const message = this.createOutgoingMessage(result)
    const config = this.getQueueConfig(result.format)

    await this.amqpConnection.publish(config.exchange, config.routingKey, message, {
      persistent: true,
      headers: {
        format: result.format,
        requestId: result.metadata.requestId,
        origin: result.metadata.origin,
      },
    })
  }

  private createOutgoingMessage(result: TransactionResult) {
    return {
      transactionHash: result.transactionHash,
      originalPayload: result.payload,
      metadata: {
        requestId: result.metadata.requestId,
        origin: result.metadata.origin,
        description: result.metadata.description,
        processedAt: new Date().toISOString(),
      },
      format: result.format,
      status: result.transactionHash ? "success" : "failed",
    }
  }

  private getQueueConfig(format: string) {
    switch (format) {
      case "hedera":
        return RabbitMQDecoratorFactory.getHederaOutgoingConfig()
      case "ethereum":
        return RabbitMQDecoratorFactory.getEthereumOutgoingConfig()
      default:
        throw new Error(`Unsupported transaction format: ${format}`)
    }
  }
}
