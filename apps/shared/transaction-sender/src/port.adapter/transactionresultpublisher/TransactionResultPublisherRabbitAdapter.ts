// SPDX-License-Identifier: Apache-2.0

import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
import { TransactionResultPublisherPort } from "./TransactionResultPublisherPort"
import { TransactionResult } from "@domain/model/TransactionResult"
import { RabbitMQDecoratorFactory } from "../../config/RabbitMQDecoratorFactory"
import { Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class TransactionResultPublisherRabbitAdapter implements TransactionResultPublisherPort {
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
      status: result.status,
      txId: result.transactionHash,
      metadata: {
        origin: result.metadata.origin,
        description: result.metadata.description,
        requestId: result.metadata.requestId,
      },
      errorCode: result.errorCode,
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
