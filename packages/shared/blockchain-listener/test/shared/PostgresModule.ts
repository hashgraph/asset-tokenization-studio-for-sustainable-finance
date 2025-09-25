// SPDX-License-Identifier: Apache-2.0

import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { EventStorePersistence } from "@port/persistence/eventstore/model/EventStorePersistence"

export const ENTITIES: EntityClassOrSchema[] = [EventStorePersistence]
const ORM_TYPE: string = "postgres"

@Module({})
export class PostgresModule {
  static forRoot(typeOrmOptions?: TypeOrmModuleOptions, entities: EntityClassOrSchema[] = ENTITIES): DynamicModule {
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
      synchronize: true,
      migrationsRun: false,
      autoLoadEntities: true,
    } as TypeOrmModuleOptions
  }
}
