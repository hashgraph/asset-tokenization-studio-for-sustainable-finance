// SPDX-License-Identifier: Apache-2.0
import { NestFactory } from "@nestjs/core"
import { BlockchainEventListenerModule } from "../src/BlockchainEventListenerModule"

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const app = await NestFactory.createApplicationContext(BlockchainEventListenerModule)
  console.log("Blockchain listener is running...")
}
bootstrap().catch((err) => {
  console.error("Bootstrap failed", err)
  process.exit(1)
})
