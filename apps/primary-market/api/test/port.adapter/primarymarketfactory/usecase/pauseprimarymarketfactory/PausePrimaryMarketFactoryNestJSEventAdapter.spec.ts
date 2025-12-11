// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule, TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { PrimaryMarketFactoryPersistence } from "@port/persistence/primarymarketfactory/model/PrimaryMarketFactoryPersistence"

describe("PausePrimaryMarketFactoryNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.7247643"

  let app: INestApplication
  let eventBus: EventBus
  let factoryRepository: Repository<PrimaryMarketFactoryPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    factoryRepository = app.get(getRepositoryToken(PrimaryMarketFactoryPersistence))

    await factoryRepository.save({
      contractId: CONTRACT_ID,
      isPaused: false,
    })
  })

  afterEach(async () => {
    await factoryRepository.delete({ contractId: CONTRACT_ID })
    await app.close()
  })

  describe("PausePrimaryMarketFactoryNestJSEventAdapter", () => {
    it("should pause primary market factory when TokenPausedDLTEvent is published", async () => {
      const event = new TokenPausedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, TokenPausedDLTEvent.name)

      const updatedFactory = await factoryRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedFactory).toBeDefined()
      expect(updatedFactory).not.toBeNull()
      expect(updatedFactory!.contractId).toBe(CONTRACT_ID)
      expect(updatedFactory!.isPaused).toBe(true)
    })

    it("should publish PrimaryMarketFactoryPausedEvent after successful factory pause", async () => {
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
          factoryContractId: CONTRACT_ID,
        }),
      )
    })
  })
})
