// SPDX-License-Identifier: Apache-2.0

import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { Module } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "./Components"

@Module({
  imports: [SharedModule],
  controllers: CONTROLLERS,
  providers: PROVIDERS,
})
export class AppModule {}
