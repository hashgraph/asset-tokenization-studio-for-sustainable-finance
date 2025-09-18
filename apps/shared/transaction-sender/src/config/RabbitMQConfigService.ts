// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQConfigService {
  constructor(private readonly configService: ConfigService) {}

  get uri(): string {
    return (
      this.configService.get<string>('RABBITMQ_URI') || 'amqp://localhost:5672'
    );
  }

  get exchangeName(): string {
    return this.configService.get<string>('RABBITMQ_EXCHANGE_NAME') || 'tx';
  }

  get exchangeType(): string {
    return this.configService.get<string>('RABBITMQ_EXCHANGE_TYPE') || 'topic';
  }

  get hederaQueueName(): string {
    return (
      this.configService.get<string>('RABBITMQ_HEDERA_QUEUE_NAME') ||
      'hederaFormat.incoming'
    );
  }

  get hederaRoutingKey(): string {
    return (
      this.configService.get<string>('RABBITMQ_HEDERA_ROUTING_KEY') ||
      'hederaFormat.incoming'
    );
  }

  get ethereumQueueName(): string {
    return (
      this.configService.get<string>('RABBITMQ_ETHEREUM_QUEUE_NAME') ||
      'ethereumFormat.incoming'
    );
  }

  get ethereumRoutingKey(): string {
    return (
      this.configService.get<string>('RABBITMQ_ETHEREUM_ROUTING_KEY') ||
      'ethereumFormat.incoming'
    );
  }

  get connectionInitOptions(): { wait: boolean } {
    const wait = this.configService.get<string>('RABBITMQ_CONNECTION_WAIT');
    return {
      wait: wait === 'true' || false,
    };
  }
}
