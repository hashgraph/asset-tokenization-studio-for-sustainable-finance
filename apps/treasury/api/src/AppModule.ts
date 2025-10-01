// SPDX-License-Identifier: Apache-2.0

import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { Module } from "@nestjs/common"

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
