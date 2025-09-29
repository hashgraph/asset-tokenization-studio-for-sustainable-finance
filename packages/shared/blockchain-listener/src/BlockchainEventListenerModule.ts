// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PROVIDERS } from "./Components"

@Module({
  imports: [SharedModule],
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class BlockchainEventListenerModule {}
