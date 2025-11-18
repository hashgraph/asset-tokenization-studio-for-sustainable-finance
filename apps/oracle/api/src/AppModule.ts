// SPDX-License-Identifier: Apache-2.0
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { CONTROLLERS, PROVIDERS } from "./Components";
import { PostgresModule } from "@config/PostgresModule";
import { HealthHttpAdapter } from "@port/health/HealthHttpAdapter";
import { OracleRegistryPersistence } from "@port/oracle/persistence/model/OracleRegistryPersistence";
import { ScheduledTaskResultPersistence } from "@port/oracle/persistence/model/ScheduledTaskResultPersistence";

@Module({
  imports: [
    CqrsModule,
    PostgresModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([OracleRegistryPersistence, ScheduledTaskResultPersistence]),
  ],
  controllers: [...CONTROLLERS, HealthHttpAdapter],
  providers: PROVIDERS,
})
export class AppModule {}
