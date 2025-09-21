// SPDX-License-Identifier: Apache-2.0

import { ConfigModule } from "@nestjs/config"
import { DynamicModule, Module } from "@nestjs/common"

@Module({})
export class ConfigurationModule {
  private static DEFAULT_ENV_FILE = "/.env"

  static forRoot(envFile?: string): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.cwd() + (envFile ?? ConfigurationModule.DEFAULT_ENV_FILE),
          isGlobal: true,
        }),
      ],
      exports: [ConfigModule],
    }
  }
}
