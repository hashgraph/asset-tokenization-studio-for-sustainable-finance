// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule, TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("UnpausePrimaryMarketNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"

  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))

    await primaryMarketRepository.save({
      contractId: CONTRACT_ID,
      isPaused: true,
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await primaryMarketRepository.delete({ contractId: CONTRACT_ID })
    await app.close()
  })

  describe("UnpausePrimaryMarketNestJSEventAdapter", () => {
    it("should unpause primary market when TokenUnpausedDLTEvent is published", async () => {
      const event = new TokenUnpausedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, TokenUnpausedDLTEvent.name)

      const updatedMarket = await primaryMarketRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedMarket).toBeDefined()
      expect(updatedMarket).not.toBeNull()
      expect(updatedMarket!.contractId).toBe(CONTRACT_ID)
      expect(updatedMarket!.isPaused).toBe(false)
    })

    it("should publish PrimaryMarketUnpausedEvent after successful primary market unpause", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new TokenUnpausedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, TokenUnpausedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: CONTRACT_ID,
        }),
      )
    })
  })
})
