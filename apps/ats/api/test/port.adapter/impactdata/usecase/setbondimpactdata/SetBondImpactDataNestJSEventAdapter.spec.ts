// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondImpactDataPersistence } from "@port/impactdata/persistence/model/BondImpactDataPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ImpactDataUpdatedDLTEvent } from "@port/impactdata/usecase/setbondimpactdata/model/ImpactDataUpdatedDLTEvent"
import { BondImpactDataSetEvent } from "@domain/impactdata/event/BondImpactDataSetEvent"

describe("SetBondImpactDataNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const OPERATOR = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
  const TX_HASH = "0xabc123"

  const validImpactData = {
    maxDeviationCap: "120",
    baseLine: "100",
    maxDeviationFloor: "80",
    impactDataDecimals: "2",
    adjustmentPrecision: "10000",
  }

  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let impactDataRepository: Repository<BondImpactDataPersistence>

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
    impactDataRepository = app.get(getRepositoryToken(BondImpactDataPersistence))

    await bondRepository.save({
      contractId: CONTRACT_ID,
      treasuryId: "0.0.6823801",
      name: "Green Bond",
      symbol: "GBND",
      decimals: 18,
      currency: "USD",
      nominalValue: "1000",
      nominalValueDecimals: 2,
      startingDate: new Date("2025-01-01"),
      maturityDate: new Date("2030-01-01"),
      maxSupply: "1000000",
      isin: "US1234567890",
    })
  })

  afterEach(async () => {
    await impactDataRepository.query('DELETE FROM "BondImpactData"')
    await bondRepository.query('DELETE FROM "Bonds"')
    await app.close()
  })

  describe("SetBondImpactDataNestJSEventAdapter", () => {
    it("should persist impact data when ImpactDataUpdatedDLTEvent is published", async () => {
      const event = new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validImpactData)

      await eventBus.publishSync(event, ImpactDataUpdatedDLTEvent.name)

      const saved = await impactDataRepository.findOne({ where: { bondContractId: CONTRACT_ID } })
      expect(saved).toBeDefined()
      expect(saved!.bondContractId).toBe(CONTRACT_ID)
      expect(saved!.operator).toBe(OPERATOR)
      expect(saved!.maxDeviationCap).toBe(validImpactData.maxDeviationCap)
      expect(saved!.baseLine).toBe(validImpactData.baseLine)
      expect(saved!.maxDeviationFloor).toBe(validImpactData.maxDeviationFloor)
      expect(saved!.impactDataDecimals).toBe(validImpactData.impactDataDecimals)
      expect(saved!.adjustmentPrecision).toBe(validImpactData.adjustmentPrecision)
    })

    it("should upsert — second event replaces the first for same bond", async () => {
      const event1 = new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validImpactData)
      await eventBus.publishSync(event1, ImpactDataUpdatedDLTEvent.name)

      const updatedData = { ...validImpactData, baseLine: "150", maxDeviationCap: "200" }
      const event2 = new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, updatedData)
      await eventBus.publishSync(event2, ImpactDataUpdatedDLTEvent.name)

      const records = await impactDataRepository.find({ where: { bondContractId: CONTRACT_ID } })
      expect(records).toHaveLength(1)
      expect(records[0].baseLine).toBe("150")
      expect(records[0].maxDeviationCap).toBe("200")
    })

    it("should persist impact data with large adjustment precision", async () => {
      const highPrecision = { ...validImpactData, adjustmentPrecision: "1000000000" }
      const event = new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, highPrecision)

      await eventBus.publishSync(event, ImpactDataUpdatedDLTEvent.name)

      const saved = await impactDataRepository.findOne({ where: { bondContractId: CONTRACT_ID } })
      expect(saved!.adjustmentPrecision).toBe("1000000000")
    })

    it("should publish BondImpactDataSetEvent after persisting", async () => {
      let publishedEvent: unknown
      jest.spyOn(eventBus, "publish").mockImplementation((e) => (publishedEvent = e))

      const event = new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validImpactData)
      await eventBus.publishSync(event, ImpactDataUpdatedDLTEvent.name)

      expect(publishedEvent).toBeInstanceOf(BondImpactDataSetEvent)
      expect(publishedEvent).toEqual(expect.objectContaining({ bondContractId: CONTRACT_ID, operator: OPERATOR }))
    })
  })
})
