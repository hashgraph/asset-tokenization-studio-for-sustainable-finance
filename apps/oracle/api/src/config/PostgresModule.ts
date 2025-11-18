// SPDX-License-Identifier: Apache-2.0
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm"
import { ConfigKeys } from "./ConfigKeys"

@Module({})
export class PostgresModule {
  static forRoot(typeOrmOptions?: TypeOrmModuleOptions): DynamicModule {
    return {
      module: PostgresModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
            return {
              ...this.getDefaultPostgreSqlConfig(configService),
              ...typeOrmOptions,
            } as TypeOrmModuleOptions
          },
        }),
      ],
      exports: [TypeOrmModule],
      global: true,
    }
  }

  static getDefaultPostgreSqlConfig(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: configService.get(ConfigKeys.POSTGRESQL_HOST),
      port: configService.get(ConfigKeys.POSTGRESQL_PORT),
      username: configService.get(ConfigKeys.POSTGRESQL_USER),
      password: configService.get(ConfigKeys.POSTGRESQL_PASSWORD),
      database: configService.get(ConfigKeys.POSTGRESQL_DB),
      synchronize: true,
      migrationsRun: false,
      autoLoadEntities: true,
    } as TypeOrmModuleOptions
  }
}
