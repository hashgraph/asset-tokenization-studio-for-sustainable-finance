// SPDX-License-Identifier: Apache-2.0

import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq"

/**
 * Factory for creating RabbitMQ decorators with centralized configuration.
 * Uses environment variables directly since decorators are evaluated at compile time.
 * This approach maintains consistency with RabbitMQConfigService defaults.
 */
export class RabbitMQDecoratorFactory {
  private static getExchangeName(): string {
    return process.env.RABBITMQ_EXCHANGE_NAME || "tx"
  }

  private static getExchangeType(): string {
    return process.env.RABBITMQ_EXCHANGE_TYPE || "topic"
  }

  private static getHederaQueueName(): string {
    return process.env.RABBITMQ_HEDERA_QUEUE_NAME || "hederaFormat.incoming"
  }

  private static getHederaRoutingKey(): string {
    return process.env.RABBITMQ_HEDERA_ROUTING_KEY || "hederaFormat.incoming"
  }

  private static getEthereumQueueName(): string {
    return process.env.RABBITMQ_ETHEREUM_QUEUE_NAME || "ethereumFormat.incoming"
  }

  private static getEthereumRoutingKey(): string {
    return process.env.RABBITMQ_ETHEREUM_ROUTING_KEY || "ethereumFormat.incoming"
  }

  private static getHederaOutgoingRoutingKey(): string {
    return process.env.RABBITMQ_HEDERA_OUTGOING_ROUTING_KEY || "hederaFormat.outgoing"
  }

  private static getEthereumOutgoingRoutingKey(): string {
    return process.env.RABBITMQ_ETHEREUM_OUTGOING_ROUTING_KEY || "ethereumFormat.outgoing"
  }

  static createHederaSubscribe() {
    return RabbitSubscribe({
      exchange: this.getExchangeName(),
      routingKey: this.getHederaRoutingKey(),
      queue: this.getHederaQueueName(),
    })
  }

  static createEthereumSubscribe() {
    return RabbitSubscribe({
      exchange: this.getExchangeName(),
      routingKey: this.getEthereumRoutingKey(),
      queue: this.getEthereumQueueName(),
    })
  }

  static getHederaOutgoingConfig() {
    return {
      exchange: this.getExchangeName(),
      routingKey: this.getHederaOutgoingRoutingKey(),
    }
  }

  static getEthereumOutgoingConfig() {
    return {
      exchange: this.getExchangeName(),
      routingKey: this.getEthereumOutgoingRoutingKey(),
    }
  }
}
