// SPDX-License-Identifier: Apache-2.0
import { NestFactory } from "@nestjs/core"
import { DynamicModule } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "./shared/containers/PostgresqlContainer"
import { PostgresModule } from "./shared/PostgresModule"
import { EVENT_LISTENER_PROVIDERS } from "../src/Components"

class TestBlockchainEventListenerModule {
  static async register(): Promise<DynamicModule> {
    const container = await PostgreSqlContainer.create()

    return {
      module: TestBlockchainEventListenerModule,
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      providers: [...EVENT_LISTENER_PROVIDERS],
      exports: [],
    }
  }
}

async function bootstrap() {
  const testModule = await TestBlockchainEventListenerModule.register()
  await NestFactory.createApplicationContext(testModule)
  console.log("Blockchain listener is running...")
}
bootstrap().catch((err) => {
  console.error("Bootstrap failed", err)
  process.exit(1)
})
