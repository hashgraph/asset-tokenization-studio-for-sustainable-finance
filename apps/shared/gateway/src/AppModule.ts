// SPDX-License-Identifier: Apache-2.0

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { ProxyMiddleware } from "./config/ProxyMiddleware"
import { LoggerMiddleware } from "./config/LoggerMiddleware"
import { CONTROLLERS, PROVIDERS } from "./Components"
import { HttpModule } from "@nestjs/axios"

@Module({
  imports: [SharedModule, HttpModule],
  controllers: CONTROLLERS,
  providers: PROVIDERS,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*")
    consumer.apply(ProxyMiddleware).exclude("api/v1/health").forRoutes("*")
  }
}
