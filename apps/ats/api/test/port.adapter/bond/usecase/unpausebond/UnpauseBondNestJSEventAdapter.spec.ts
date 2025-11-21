// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule, TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("UnpauseBondNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"

  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>

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
    bondRepository = app.get(getRepositoryToken(BondPersistence))

    await bondRepository.save({
      contractId: CONTRACT_ID,
      treasuryId: "0.0.6823801",
      kpiId: "0.0.6823801",
      name: "Green Bond",
      symbol: "GBND",
      decimals: 18,
      currency: "USD",
      nominalValue: "1000",
      nominalValueDecimals: 2,
      startingDate: new Date("2025-01-01"),
      maturityDate: new Date("2025-01-01"),
      maxSupply: "1000000",
      isin: "US1234567890",
      isPaused: true,
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondRepository.clear()
    await app.close()
  })

  describe("UnpauseBondNestJSEventAdapter", () => {
    it("should unpause bond when TokenUnpausedDLTEvent is published", async () => {
      const event = new TokenUnpausedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, TokenUnpausedDLTEvent.name)

      const updatedBond = await bondRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedBond).toBeDefined()
      expect(updatedBond).not.toBeNull()
      expect(updatedBond!.contractId).toBe(CONTRACT_ID)
      expect(updatedBond!.isPaused).toBe(false)
    })

    it("should publish BondUnpausedEvent after successful bond unpause", async () => {
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
