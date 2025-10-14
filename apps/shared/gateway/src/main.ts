// SPDX-License-Identifier: Apache-2.0

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"
import { LogLevel, LOG_LEVELS } from "@nestjs/common"

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
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
