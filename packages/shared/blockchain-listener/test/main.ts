// SPDX-License-Identifier: Apache-2.0
import { NestFactory } from "@nestjs/core"
import { BlockchainEventListenerModule } from "../src/BlockchainEventListenerModule"

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(BlockchainEventListenerModule)
  console.log("Blockchain listener is running...")
}
bootstrap()
