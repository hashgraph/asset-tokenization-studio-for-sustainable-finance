// SPDX-License-Identifier: Apache-2.0
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CONTROLLERS, PROVIDERS } from "./Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { HealthHttpAdapter } from "@port/health/HealthHttpAdapter"
import { OracleRegistryPersistence } from "@port/oracle/persistence/model/OracleRegistryPersistence"
import { ScheduledTaskResultPersistence } from "@port/oracle/persistence/model/ScheduledTaskResultPersistence"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    SharedModule,
    PostgresModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([OracleRegistryPersistence, ScheduledTaskResultPersistence]),
  ],
  controllers: [...CONTROLLERS, HealthHttpAdapter],
  providers: PROVIDERS,
})
export class AppModule {}
