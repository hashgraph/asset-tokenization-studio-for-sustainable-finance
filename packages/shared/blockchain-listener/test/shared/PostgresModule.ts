// SPDX-License-Identifier: Apache-2.0

import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { EVENT_LISTENER_ENTITIES, EVENT_LISTENER_MIGRATIONS } from "../../src/Components"

const ORM_TYPE: string = "postgres"

@Module({})
export class PostgresModule {
  static forRoot(
    typeOrmOptions?: TypeOrmModuleOptions,
    entities: EntityClassOrSchema[] = EVENT_LISTENER_ENTITIES,
  ): DynamicModule {
    return {
      module: PostgresModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: (): TypeOrmModuleOptions => {
            return {
              ...this.getDefaultPostgreSqlConfig(),
              ...typeOrmOptions,
            } as TypeOrmModuleOptions
          },
        }),
        TypeOrmModule.forFeature(entities),
      ],
      exports: [TypeOrmModule],
    }
  }

  static getDefaultPostgreSqlConfig(): TypeOrmModuleOptions {
    return {
      type: ORM_TYPE,
      synchronize: false,
      migrationsRun: true,
      migrations: EVENT_LISTENER_MIGRATIONS,
      autoLoadEntities: true,
      extra: {
        options: `-c lock_timeout=${process.env.POSTGRESQL_LOCK_TIMEOUT || 10}s`,
      },
    } as TypeOrmModuleOptions
  }
}
