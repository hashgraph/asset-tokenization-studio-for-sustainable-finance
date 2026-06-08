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
import { BondImpactDataPersistence } from "@port/impactdata/persistence/model/BondImpactDataPersistence"
import { ImpactDataUpdatedDLTEvent } from "@port/impactdata/usecase/setbondimpactdata/model/ImpactDataUpdatedDLTEvent"

describe("GetBondImpactData API Integration", () => {
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
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
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

  describe("GET /bonds/:bondContractId/kpi/impact-data", () => {
    it("should return 200 with impact data when configured", async () => {
      await eventBus.publishSync(
        new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validImpactData),
        ImpactDataUpdatedDLTEvent.name,
      )

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/impact-data`)
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        bondContractId: CONTRACT_ID,
        operator: OPERATOR,
        maxDeviationCap: validImpactData.maxDeviationCap,
        baseLine: validImpactData.baseLine,
        maxDeviationFloor: validImpactData.maxDeviationFloor,
        impactDataDecimals: validImpactData.impactDataDecimals,
        adjustmentPrecision: validImpactData.adjustmentPrecision,
      })
      expect(response.body.id).toBeDefined()
    })

    it("should return 404 when bond has no impact data configured", async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/impact-data`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 404 when bond does not exist", async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/0.0.9999999/kpi/impact-data`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return updated values after second event (upsert)", async () => {
      await eventBus.publishSync(
        new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, validImpactData),
        ImpactDataUpdatedDLTEvent.name,
      )
      await eventBus.publishSync(
        new ImpactDataUpdatedDLTEvent(CONTRACT_ID, TX_HASH, OPERATOR, { ...validImpactData, baseLine: "150" }),
        ImpactDataUpdatedDLTEvent.name,
      )

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/impact-data`)
        .expect(HttpStatus.OK)

      expect(response.body.baseLine).toBe("150")
    })
  })
})
