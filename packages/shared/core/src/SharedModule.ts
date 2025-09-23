// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { PROVIDERS } from "./Components"
import { ConfigurationModule } from "./config/ConfigurationModule"

@Module({
  imports: [ConfigurationModule.forRoot(), CqrsModule.forRoot(), EventEmitterModule.forRoot()],
  controllers: [],
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class SharedModule {}
