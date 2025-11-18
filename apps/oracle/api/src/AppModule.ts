// SPDX-License-Identifier: Apache-2.0
import { Module } from "@nestjs/common";
import { CONTROLLERS, PROVIDERS } from "./Components";
import { PostgresModule } from "@config/PostgresModule";
import { HealthHttpAdapter } from "@port/health/HealthHttpAdapter";

@Module({
  imports: [PostgresModule.forRoot()],
  controllers: [...CONTROLLERS, HealthHttpAdapter],
  providers: PROVIDERS,
})
export class AppModule {}
