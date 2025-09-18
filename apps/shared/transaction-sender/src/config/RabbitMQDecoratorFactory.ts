// SPDX-License-Identifier: Apache-2.0

import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

export class RabbitMQDecoratorFactory {
  private static getExchangeName(): string {
    return process.env.RABBITMQ_EXCHANGE_NAME || 'tx';
  }

  private static getHederaQueueName(): string {
    return process.env.RABBITMQ_HEDERA_QUEUE_NAME || 'hederaFormat.incoming';
  }

  private static getHederaRoutingKey(): string {
    return process.env.RABBITMQ_HEDERA_ROUTING_KEY || 'hederaFormat.incoming';
  }

  private static getEthereumQueueName(): string {
    return (
      process.env.RABBITMQ_ETHEREUM_QUEUE_NAME || 'ethereumFormat.incoming'
    );
  }

  private static getEthereumRoutingKey(): string {
    return (
      process.env.RABBITMQ_ETHEREUM_ROUTING_KEY || 'ethereumFormat.incoming'
    );
  }

  static createHederaSubscribe() {
    return RabbitSubscribe({
      exchange: this.getExchangeName(),
      routingKey: this.getHederaRoutingKey(),
      queue: this.getHederaQueueName(),
    });
  }

  static createEthereumSubscribe() {
    return RabbitSubscribe({
      exchange: this.getExchangeName(),
      routingKey: this.getEthereumRoutingKey(),
      queue: this.getEthereumQueueName(),
    });
  }
}
