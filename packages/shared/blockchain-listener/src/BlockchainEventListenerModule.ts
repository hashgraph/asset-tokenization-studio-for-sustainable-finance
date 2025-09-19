// SPDX-License-Identifier: Apache-2.0
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import EventListenerAdapter from "@port/adapter/listener/EventListenerAdapter"
import EventListenerNestAdapter from "@port/adapter/EventListenerNestAdapter"
import EventFetcherAdapter from "@port/adapter/blockchain/EventFetcherAdapter"
import BlockchainEventListenerAppService from "@app/service/BlockchainEventListenerAppService"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [EventFetcherAdapter, EventListenerAdapter, EventListenerNestAdapter, BlockchainEventListenerAppService],
  exports: [EventFetcherAdapter, EventListenerAdapter, EventListenerNestAdapter],
})
export class BlockchainEventListenerModule {}
