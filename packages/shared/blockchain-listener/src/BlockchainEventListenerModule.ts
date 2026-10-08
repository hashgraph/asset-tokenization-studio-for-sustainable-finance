// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq"
import { EVENT_LISTENER_PROVIDERS } from "./Components"

const RABBIT_DYNAMIC_MODULE =
  process.env.RABBITMQ_PUBLISH_ENABLED === "false"
    ? []
    : [
        RabbitMQModule.forRoot({
          exchanges: [
            {
              name: process.env.RABBITMQ_EXCHANGE_NAME || "greenbond.events",
              type: "topic",
            },
          ],
          uri: process.env.RABBITMQ_URI || process.env.RABBITMQ_URL || "amqp://localhost:5672",
          connectionInitOptions: {
            wait: process.env.RABBITMQ_CONNECTION_WAIT === "true" || false,
          },
        }),
      ]

@Module({
  imports: [...RABBIT_DYNAMIC_MODULE, SharedModule],
  providers: EVENT_LISTENER_PROVIDERS,
  exports: EVENT_LISTENER_PROVIDERS,
})
export class BlockchainEventListenerModule {}
