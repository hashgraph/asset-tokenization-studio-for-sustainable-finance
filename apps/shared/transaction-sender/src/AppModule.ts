// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { SendHederaSignedTransactionRabbitAdapter } from "./port.adapter/hedera/sendsignedtransaction/SendHederaSignedTransactionRabbitAdapter"
import { SendEthereumSignedTransactionRabbitAdapter } from "./port.adapter/ethereum/sendsignedtransaction/SendEthereumSignedTransactionRabbitAdapter"

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
  providers: [SendHederaSignedTransactionRabbitAdapter, SendEthereumSignedTransactionRabbitAdapter],
})
export class AppModule {}
