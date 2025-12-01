import { DynamicModule, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { ConfigKeys } from "./ConfigKeys"
import { ENTITIES } from "../Components"

@Module({})
export class PostgresModule {
  static forRoot(typeOrmOptions?: TypeOrmModuleOptions, entities: EntityClassOrSchema[] = ENTITIES): DynamicModule {
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
        TypeOrmModule.forFeature(entities),
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
      // migrations: [...EVENT_LISTENER_MIGRATIONS, "dist/migrations/*{.ts,.js}"],
      autoLoadEntities: true,
      extra: {
        options: `-c lock_timeout=${configService.get(ConfigKeys.POSTGRESQL_LOCK_TIMEOUT, "10")}s`,
      }
    } as TypeOrmModuleOptions
  }
}
