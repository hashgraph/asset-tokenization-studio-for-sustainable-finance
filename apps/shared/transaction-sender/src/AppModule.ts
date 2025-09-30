// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { RabbitMQModule, MessageHandlerErrorBehavior } from "@golevelup/nestjs-rabbitmq"
import { SendHederaSignedTransactionRabbitAdapter } from "./port.adapter/transaction/usecase/sendsignedtransaction/hedera/SendHederaSignedTransactionRabbitAdapter"
import { SendEthereumSignedTransactionRabbitAdapter } from "./port.adapter/transaction/usecase/sendsignedtransaction/ethereum/SendEthereumSignedTransactionRabbitAdapter"
import { SendSignedTransactionCommandHandler } from "@app/sendsignedtransaction/command/SendSignedTransactionCommandHandler"
import { PublishTransactionResultCommandHandler } from "@app/publishtransactionresult/command/PublishTransactionResultCommandHandler"
import { BlockchainTransactionSenderAdapter } from "./port.adapter/transactionsender/BlockchainTransactionSenderAdapter"

import { TransactionResultPublisherRabbitAdapter } from "./port.adapter/transactionresultpublisher/TransactionResultPublisherRabbitAdapter"
import { PublishTransactionResultNestJSEventAdapter } from "@port/transaction/usecase/publishtransactionresult/PublishTransactionResultNestJSEventAdapter"
@Module({
  imports: [
    SharedModule,
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: process.env.RABBITMQ_EXCHANGE_NAME || "tx",
          type: process.env.RABBITMQ_EXCHANGE_TYPE || "topic",
        },
      ],
      uri: process.env.RABBITMQ_URI || "amqp://localhost:5672",
      connectionInitOptions: {
        wait: process.env.RABBITMQ_CONNECTION_WAIT === "true" || false,
      },
      defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
    }),
  ],
  controllers: [],
  providers: [
    SendHederaSignedTransactionRabbitAdapter,
    SendEthereumSignedTransactionRabbitAdapter,
    SendSignedTransactionCommandHandler,
    PublishTransactionResultCommandHandler,
    BlockchainTransactionSenderAdapter,
    PublishTransactionResultNestJSEventAdapter,
    TransactionResultPublisherRabbitAdapter,
    {
      provide: "BlockchainTransactionSender",
      useClass: BlockchainTransactionSenderAdapter,
    },
    {
      provide: "PublishTransactionResult",
      useClass: TransactionResultPublisherRabbitAdapter,
    },
  ],
})
export class AppModule {}
