// SPDX-License-Identifier: Apache-2.0
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { LogLevel, LOG_LEVELS, Logger } from "@nestjs/common"
import { RestExceptionFilter } from "@hashgraph/green-bonds-shared-core"

function getLogLevels(): LogLevel[] {
  const logLevels: LogLevel[] = LOG_LEVELS
  const defaultLogLevel: LogLevel = "log"
  const minLogLevel = (process.env.LOG_LEVEL as LogLevel) || defaultLogLevel
  return logLevels.slice(logLevels.indexOf(minLogLevel))
}

async function bootstrap() {
  // Configure log levels
  const app = await NestFactory.create(AppModule, { logger: getLogLevels() })

  // Enable CORS
  app.enableCors()

  // Set global exception filter
  app.useGlobalFilters(new RestExceptionFilter())

  // Set global prefix
  app.setGlobalPrefix("api/v1/oracle")

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Oracle Backend API")
    .setDescription("KPI Oracle Backend - Fetches KPI values from MSG Indexer and writes to KPI Smart Contracts")
    .setVersion("1.0")
    .addTag("Oracle Registry", "Manage oracle registry instances")
    .addTag("Execution History", "View and retry task executions")
    .addTag("Health", "Health check endpoints")
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

  // Start the application
  const port = process.env.PORT ?? 3010
  await app.listen(port)

  const logger = new Logger("main")
  logger.log(`🏃 Oracle API is running on: http://localhost:${port}`)
  logger.log(`📖 API Documentation: /api/v1/docs`)
}
void bootstrap()
