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
import { BondKpiDataPersistence } from "@port/kpidata/persistence/model/BondKpiDataPersistence"
import { KpiDataAddedDLTEvent } from "@port/kpidata/usecase/addbondkpidata/model/KpiDataAddedDLTEvent"

describe("GetBondKpiData API Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const PROJECT = "0xcdc1c3a95ec40007cf92e3db67617063a177f54c"
  const TX_HASH = "0xabc123"

  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let kpiDataRepository: Repository<BondKpiDataPersistence>

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
    kpiDataRepository = app.get(getRepositoryToken(BondKpiDataPersistence))

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
    await kpiDataRepository.query('DELETE FROM "BondKpiData"')
    await bondRepository.query('DELETE FROM "Bonds"')
    await app.close()
  })

  describe("GET /bonds/:bondContractId/kpi/data", () => {
    it("should return 200 with empty page when no KPI data exists", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/data`)
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(0)
      expect(response.body.total).toBe(0)
    })

    it("should return 200 with KPI data points", async () => {
      await eventBus.publishSync(
        new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, "1748908800", "105"),
        KpiDataAddedDLTEvent.name,
      )

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/data`)
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.items[0]).toMatchObject({
        bondContractId: CONTRACT_ID,
        project: PROJECT,
        date: "1748908800",
        value: "105",
      })
      expect(response.body.items[0].id).toBeDefined()
    })

    it("should return paginated results with multiple data points", async () => {
      for (let i = 0; i < 3; i++) {
        const date = String(1748908800 + i * 86400)
        await eventBus.publishSync(
          new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, date, String(100 + i)),
          KpiDataAddedDLTEvent.name,
        )
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${CONTRACT_ID}/kpi/data?limit=2&page=1`)
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(3)
      expect(response.body.totalPages).toBe(2)
    })

    it("should return 404 when bond does not exist", async () => {
      await request(app.getHttpServer()).get(`/api/v1/ats/bonds/0.0.9999999/kpi/data`).expect(HttpStatus.NOT_FOUND)
    })
  })
})
