// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq"
import { SendHederaSignedTransactionRabbitAdapter } from "./port.adapter/transaction/usecase/sendsignedtransaction/hedera/SendHederaSignedTransactionRabbitAdapter"
import { SendEthereumSignedTransactionRabbitAdapter } from "./port.adapter/transaction/usecase/sendsignedtransaction/ethereum/SendEthereumSignedTransactionRabbitAdapter"
import { SendSignedTransactionCommandHandler } from "./app/command/sendsignedtransaction/SendSignedTransactionCommandHandler"
import { BlockchainTransactionSenderAdapter } from "./port.adapter/transactionsender/BlockchainTransactionSenderAdapter"
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
    }),
  ],
  controllers: [],
  providers: [
    SendHederaSignedTransactionRabbitAdapter,
    SendEthereumSignedTransactionRabbitAdapter,
    SendSignedTransactionCommandHandler,
    BlockchainTransactionSenderAdapter,
  ],
})
export class AppModule {}
