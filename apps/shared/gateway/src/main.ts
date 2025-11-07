// SPDX-License-Identifier: Apache-2.0

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"
import { LogLevel, LOG_LEVELS } from "@nestjs/common"
import { ApiDocService } from "./config/apidoc/ApiDocService"
import { SwaggerModule } from "@nestjs/swagger"

function getLogLevels(minLogLevel: LogLevel): LogLevel[] {
  const logLevels: LogLevel[] = LOG_LEVELS
  const logLevelIndex = logLevels.indexOf(minLogLevel)
  return logLevels.slice(logLevelIndex)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels((process.env.LOG_LEVEL as LogLevel) || "log"),
    rawBody: true,
  })

  // Swagger configuration
  const apiDoc = await app.get(ApiDocService).buildApiDoc()
  SwaggerModule.setup("api/v1/docs", app, apiDoc)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
