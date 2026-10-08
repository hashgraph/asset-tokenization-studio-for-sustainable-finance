// SPDX-License-Identifier: Apache-2.0

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"
import { LogLevel, LOG_LEVELS, Logger } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

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

  // Enable CORS
  app.enableCors()

  // Set global prefix
  app.setGlobalPrefix("api/v1")

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("GreenBonds Treasury API")
    .setDescription("The GreenBonds Treasury API documentation")
    .setVersion("1.0")
    .addGlobalResponse({
      status: 500,
      description: "Internal server error",
    })
    .addGlobalResponse({
      status: 401,
      description: "Unauthorized",
    })
    .addGlobalResponse({
      status: 400,
      description: "Bad Request",
    })
    .addGlobalResponse({
      status: 404,
      description: "Not Found",
    })
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/v1/docs", app, documentFactory)

  // Set time zone to UTC
  process.env.TZ = "utc"

  // Start the application
  const port = process.env.PORT ?? 3000
  await app.listen(port)

  const logger = new Logger("main")

  logger.log(`🏃 GreenBond Treasury API is running on: http://localhost:${port}`)
  logger.log(`📖 API Documentation: /api/v1/docs`)
}
bootstrap()
