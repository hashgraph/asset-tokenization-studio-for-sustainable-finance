// SPDX-License-Identifier: Apache-2.0
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"
import { CONTROLLERS, PROVIDERS } from "./Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { HealthHttpAdapter } from "@port/health/HealthHttpAdapter"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    SharedModule,
    PostgresModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [...CONTROLLERS, HealthHttpAdapter],
  providers: PROVIDERS,
})
export class AppModule {}
