// SPDX-License-Identifier: Apache-2.0

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '@nestjs/config';
import { HederaTransactionRabbitAdapter } from './port.adapter/hedera/HederaTransactionRabbitAdapter';
import { EthereumTransactionRabbitAdapter } from './port.adapter/ethereum/EthereumTransactionRabbitAdapter';
import { RabbitMQConfigService } from './config/RabbitMQConfigService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: process.env.RABBITMQ_EXCHANGE_NAME || 'tx',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
      connectionInitOptions: {
        wait: process.env.RABBITMQ_CONNECTION_WAIT === 'true' || false,
      },
    }),
  ],
  controllers: [],
  providers: [
    HederaTransactionRabbitAdapter,
    EthereumTransactionRabbitAdapter,
    RabbitMQConfigService,
  ],
})
export class AppModule {}
