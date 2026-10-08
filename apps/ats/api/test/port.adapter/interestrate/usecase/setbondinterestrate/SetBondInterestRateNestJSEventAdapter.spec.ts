// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondInterestRatePersistence } from "@port/interestrate/persistence/model/BondInterestRatePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { InterestRateUpdatedDLTEvent } from "@port/interestrate/usecase/setbondinterestrate/model/InterestRateUpdatedDLTEvent"
import { BondInterestRateSetEvent } from "@domain/interestrate/event/BondInterestRateSetEvent"

describe("SetBondInterestRateNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const OPERATOR = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
  const TX_HASH = "0xabc123"

  const validInterestRate = {
    maxRate: "600",
    baseRate: "400",
    minRate: "200",
    startPeriod: "0",
    startRate: "400",
    missedPenalty: "50",
    reportPeriod: "31536000",
    rateDecimals: "2",
  }

  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let interestRateRepository: Repository<BondInterestRatePersistence>

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
    interestRateRepository = app.get(getRepositoryToken(BondInterestRatePersistence))

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
    await interestRateRepository.query('DELETE FROM "BondInterestRates"')
    await bondRepository.query('DELETE FROM "Bonds"')
    await app.close()
  })

  describe("SetBondInterestRateNestJSEventAdapter", () => {
    it("should persist interest rate when InterestRateUpdatedDLTEvent is published", async () => {
      const event = new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validInterestRate)

      await eventBus.publishSync(event, InterestRateUpdatedDLTEvent.name)

      const saved = await interestRateRepository.findOne({ where: { bondContractId: CONTRACT_ID } })
      expect(saved).toBeDefined()
      expect(saved!.bondContractId).toBe(CONTRACT_ID)
      expect(saved!.operator).toBe(OPERATOR)
      expect(saved!.maxRate).toBe(validInterestRate.maxRate)
      expect(saved!.baseRate).toBe(validInterestRate.baseRate)
      expect(saved!.minRate).toBe(validInterestRate.minRate)
      expect(saved!.startPeriod).toBe(validInterestRate.startPeriod)
      expect(saved!.startRate).toBe(validInterestRate.startRate)
      expect(saved!.missedPenalty).toBe(validInterestRate.missedPenalty)
      expect(saved!.reportPeriod).toBe(validInterestRate.reportPeriod)
      expect(saved!.rateDecimals).toBe(validInterestRate.rateDecimals)
    })

    it("should upsert — second event replaces the first for same bond", async () => {
      const event1 = new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validInterestRate)
      await eventBus.publishSync(event1, InterestRateUpdatedDLTEvent.name)

      const updatedRate = { ...validInterestRate, baseRate: "500", maxRate: "700" }
      const event2 = new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, updatedRate)
      await eventBus.publishSync(event2, InterestRateUpdatedDLTEvent.name)

      const records = await interestRateRepository.find({ where: { bondContractId: CONTRACT_ID } })
      expect(records).toHaveLength(1)
      expect(records[0].baseRate).toBe("500")
      expect(records[0].maxRate).toBe("700")
    })

    it("should persist startPeriod with non-zero value", async () => {
      const rateWithPeriod = { ...validInterestRate, startPeriod: "1735689600" }
      const event = new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, rateWithPeriod)

      await eventBus.publishSync(event, InterestRateUpdatedDLTEvent.name)

      const saved = await interestRateRepository.findOne({ where: { bondContractId: CONTRACT_ID } })
      expect(saved!.startPeriod).toBe("1735689600")
    })

    it("should publish BondInterestRateSetEvent after persisting", async () => {
      let publishedEvent: unknown
      jest.spyOn(eventBus, "publish").mockImplementation((e) => (publishedEvent = e))

      const event = new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validInterestRate)
      await eventBus.publishSync(event, InterestRateUpdatedDLTEvent.name)

      expect(publishedEvent).toBeInstanceOf(BondInterestRateSetEvent)
      expect(publishedEvent).toEqual(expect.objectContaining({ bondContractId: CONTRACT_ID, operator: OPERATOR }))
    })
  })
})
