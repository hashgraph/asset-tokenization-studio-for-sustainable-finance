// SPDX-License-Identifier: Apache-2.0

import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { Module } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "./Components"
import { PostgresModule } from "@config/PostgresModule"
import { BlockchainEventListenerModule } from "@hashgraph/green-bonds-blockchain-listener"
import { HealthHttpAdapter } from "@port/health/HealthHttpAdapter"

@Module({
  imports: [SharedModule, PostgresModule.forRoot(), BlockchainEventListenerModule],
  controllers: [...CONTROLLERS, HealthHttpAdapter],
  providers: PROVIDERS,
})
export class AppModule {}
