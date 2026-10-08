// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondInterestRatePersistence } from "@port/interestrate/persistence/model/BondInterestRatePersistence"
import { InterestRateUpdatedDLTEvent } from "@port/interestrate/usecase/setbondinterestrate/model/InterestRateUpdatedDLTEvent"

describe("GetBondInterestRate API Integration", () => {
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
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
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

  describe("GET /bonds/:bondContractId/kpi/interest-rate", () => {
    it("should return 200 with interest rate data when configured", async () => {
      await eventBus.publishSync(
        new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validInterestRate),
        InterestRateUpdatedDLTEvent.name,
      )

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/interest-rate`)
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        bondContractId: CONTRACT_ID,
        operator: OPERATOR,
        maxRate: validInterestRate.maxRate,
        baseRate: validInterestRate.baseRate,
        minRate: validInterestRate.minRate,
        startPeriod: validInterestRate.startPeriod,
        rateDecimals: validInterestRate.rateDecimals,
      })
      expect(response.body.id).toBeDefined()
      expect(response.body.createdAt).toBeDefined()
    })

    it("should return 404 when bond has no interest rate configured", async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/interest-rate`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 404 when bond does not exist", async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/0.0.9999999/kpi/interest-rate`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return updated values after second event (upsert)", async () => {
      await eventBus.publishSync(
        new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validInterestRate),
        InterestRateUpdatedDLTEvent.name,
      )
      await eventBus.publishSync(
        new InterestRateUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, { ...validInterestRate, baseRate: "500" }),
        InterestRateUpdatedDLTEvent.name,
      )

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/interest-rate`)
        .expect(HttpStatus.OK)

      expect(response.body.baseRate).toBe("500")
    })
  })
})
