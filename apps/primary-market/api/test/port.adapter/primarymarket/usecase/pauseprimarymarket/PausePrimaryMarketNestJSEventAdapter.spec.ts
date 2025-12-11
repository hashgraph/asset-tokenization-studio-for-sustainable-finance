// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule, TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("PausePrimaryMarketNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"

  let app: INestApplication
  let eventBus: EventBus
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))

    await primaryMarketRepository.save({
      contractId: CONTRACT_ID,
      isPaused: false,
    })
  })

  afterEach(async () => {
    await primaryMarketRepository.delete({ contractId: CONTRACT_ID })
    await app.close()
  })

  describe("PausePrimaryMarketNestJSEventAdapter", () => {
    it("should pause primary market when TokenPausedDLTEvent is published", async () => {
      const event = new TokenPausedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, TokenPausedDLTEvent.name)

      const updatedMarket = await primaryMarketRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedMarket).toBeDefined()
      expect(updatedMarket).not.toBeNull()
      expect(updatedMarket!.contractId).toBe(CONTRACT_ID)
      expect(updatedMarket!.isPaused).toBe(true)
    })

    it("should publish PrimaryMarketPausedEvent after successful primary market pause", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new TokenPausedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, TokenPausedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: CONTRACT_ID,
        }),
      )
    })
  })
})
