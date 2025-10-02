// SPDX-License-Identifier: Apache-2.0

import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { Module } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "./Components"
import { PostgresModule } from "@config/PostgresModule"

@Module({
  imports: [SharedModule, PostgresModule.forRoot()],
  controllers: CONTROLLERS,
  providers: PROVIDERS,
})
export class AppModule {}
