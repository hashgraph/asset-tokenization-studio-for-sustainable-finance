// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { EVENT_LISTENER_PROVIDERS } from "./Components"

@Module({
  imports: [SharedModule],
  providers: EVENT_LISTENER_PROVIDERS,
  exports: EVENT_LISTENER_PROVIDERS,
})
export class BlockchainEventListenerModule {}
