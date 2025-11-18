// SPDX-License-Identifier: Apache-2.0
import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({})
export class PostgresModule {
  static forRoot(): DynamicModule {
    return {
      module: PostgresModule,
      imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.POSTGRES_HOST || "localhost",
          port: parseInt(process.env.POSTGRES_PORT || "5432"),
          username: process.env.POSTGRES_USER || "postgres",
          password: process.env.POSTGRES_PASSWORD || "postgres",
          database: process.env.POSTGRES_DB || "oracle_db",
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: process.env.NODE_ENV !== "production", // Only for development
          logging: process.env.DB_LOGGING === "true",
        }),
      ],
    };
  }
}
