// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PROVIDERS } from "./Components"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class BlockchainEventListenerModule {}
