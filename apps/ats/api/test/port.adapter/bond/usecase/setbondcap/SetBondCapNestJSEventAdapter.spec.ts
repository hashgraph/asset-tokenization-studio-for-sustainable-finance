// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { MaxSupplySetDLTEvent } from "@port/cap/usecase/setbondcap/model/MaxSupplySetDLTEvent"

describe("SetBondCapNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const INITIAL_MAX_SUPPLY = "1000000"

  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
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
      maxSupply: INITIAL_MAX_SUPPLY,
      isin: "US1234567890",
    })
  })
  afterEach(async () => {
    await bondRepository.clear()
    await app.close()
  })

  describe("SetBondCapNestJSEventAdapter", () => {
    it("should update bond max supply when MaxSupplySetDLTEvent is published", async () => {
      const newMaxSupply = "2000000"
      const event = new MaxSupplySetDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
        newMaxSupply,
        INITIAL_MAX_SUPPLY,
      )

      await eventBus.publishSync(event, MaxSupplySetDLTEvent.name)

      const updatedBond = await bondRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedBond).toBeDefined()
      expect(updatedBond).not.toBeNull()
      expect(updatedBond!.contractId).toBe(CONTRACT_ID)
      expect(updatedBond!.maxSupply).toBe(newMaxSupply)
    })

    it("should update bond max supply to zero when MaxSupplySetDLTEvent is published with zero", async () => {
      const newMaxSupply = "0"
      const event = new MaxSupplySetDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
        newMaxSupply,
        INITIAL_MAX_SUPPLY,
      )

      await eventBus.publishSync(event, MaxSupplySetDLTEvent.name)

      const updatedBond = await bondRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedBond).toBeDefined()
      expect(updatedBond).not.toBeNull()
      expect(updatedBond!.maxSupply).toBe(newMaxSupply)
    })

    it("should update bond max supply multiple times when multiple MaxSupplySetDLTEvent are published", async () => {
      const capValues = ["1500000", "2000000", "2500000"]

      for (const newMaxSupply of capValues) {
        const event = new MaxSupplySetDLTEvent(
          CONTRACT_ID,
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          "0x0000000000000000000000000000000000000001",
          newMaxSupply,
          INITIAL_MAX_SUPPLY,
        )

        await eventBus.publishSync(event, MaxSupplySetDLTEvent.name)

        const updatedBond = await bondRepository.findOne({
          where: { contractId: CONTRACT_ID },
        })

        expect(updatedBond).toBeDefined()
        expect(updatedBond!.maxSupply).toBe(newMaxSupply)
      }
    })

    it("should update bond max supply with very large numbers", async () => {
      const newMaxSupply = "999999999999999999999999"
      const event = new MaxSupplySetDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
        newMaxSupply,
        INITIAL_MAX_SUPPLY,
      )

      await eventBus.publishSync(event, MaxSupplySetDLTEvent.name)

      const updatedBond = await bondRepository.findOne({
        where: { contractId: CONTRACT_ID },
      })

      expect(updatedBond).toBeDefined()
      expect(updatedBond!.maxSupply).toBe(newMaxSupply)
    })

    it("should publish BondCapSetEvent after successful bond cap update", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const newMaxSupply = "2000000"
      const event = new MaxSupplySetDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x0000000000000000000000000000000000000001",
        newMaxSupply,
        INITIAL_MAX_SUPPLY,
      )

      await eventBus.publishSync(event, MaxSupplySetDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: CONTRACT_ID,
          newMaxSupply: newMaxSupply,
        }),
      )
    })
  })
})
