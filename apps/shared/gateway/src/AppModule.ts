// SPDX-License-Identifier: Apache-2.0

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { ProxyMiddleware } from "./config/ProxyMiddleware"
import { LoggerMiddleware } from "./config/LoggerMiddleware"
import { PROVIDERS } from "./Components"

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: PROVIDERS,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, ProxyMiddleware).forRoutes("*")
  }
}
