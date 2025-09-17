import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PayloadValidationService } from './domain/service/PayloadValidationService';

import { TransactionService } from './app/service/TransactionService';

import { RabbitMQIncomingHandler } from './port.adapter/listener/RabbitMQIncomingHandler';

@Module({
  imports: [
    CqrsModule,
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'tx',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  controllers: [],
  providers: [
    PayloadValidationService,
    TransactionService,
    RabbitMQIncomingHandler,
  ],
})
export class AppModule {}
