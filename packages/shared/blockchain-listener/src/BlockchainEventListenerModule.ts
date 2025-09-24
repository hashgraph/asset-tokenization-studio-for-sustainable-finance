// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { ConfigurationModule } from "@hashgraph/green-bonds-shared-core"
import { PROVIDERS } from "./Components"

@Module({
  imports: [ConfigurationModule.forRoot()],
  providers: PROVIDERS,
  exports: [],
})
export class BlockchainEventListenerModule {}
