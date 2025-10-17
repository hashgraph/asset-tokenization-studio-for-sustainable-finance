// SPDX-License-Identifier: Apache-2.0
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { LogLevel } from "@nestjs/common"

async function bootstrap() {
  // Configure log levels
  const defaultLevels: LogLevel[] = ["log", "error", "warn"]
  const logLevels: LogLevel[] = process.env.LOG_LEVELS
    ? (process.env.LOG_LEVELS.split(",") as LogLevel[])
    : defaultLevels

  const app = await NestFactory.create(AppModule, { logger: logLevels })

  // Enable CORS
  app.enableCors()

  // Set global prefix
  app.setGlobalPrefix("api/v1/ats")

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("GreenBonds ATS API")
    .setDescription("The GreenBonds ATS API documentation")
    .setVersion("1.0")
    .addTag("ats", "greenbonds")
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, documentFactory)

  // Start the application
  const port = process.env.PORT ?? 3000
  await app.listen(port)

  console.log(`🏃 GreenBond ATS API is running on: http://localhost:${port}`)
  console.log(`📖 API Documentation: http://localhost:${port}/api`)
}
void bootstrap()
