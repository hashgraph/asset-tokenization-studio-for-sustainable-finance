import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TransactionService } from './app/service/TransactionService';
import { RabbitMQIncomingAdapter } from './port.adapter/in/RabbitMQIncomingAdapter';

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
  providers: [TransactionService, RabbitMQIncomingAdapter],
})
export class AppModule {}
