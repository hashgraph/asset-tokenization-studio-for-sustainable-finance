// SPDX-License-Identifier: Apache-2.0

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./AppModule"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix("api/v1/treasury")
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
