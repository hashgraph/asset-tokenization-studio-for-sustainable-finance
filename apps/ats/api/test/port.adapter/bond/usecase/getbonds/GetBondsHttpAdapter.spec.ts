// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("GetBondsHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalBondRepository: Repository<BondPersistence>

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
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    internalBondRepository = app.get(getRepositoryToken(BondPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (internalBondRepository) {
      await internalBondRepository.clear()
    }
    if (app) {
      await app.close()
    }
  })

  describe("GET /", () => {
    it("should return empty page when no bonds exist", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/ats/bonds")
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it("should return paginated bonds with correct structure", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const bond = await internalBondRepository.save({
        contractId: "0.0.6823801",
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6823801",
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const response = await request(app.getHttpServer())
        .get("/api/v1/ats/bonds")
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)

      const bondResponse = response.body.items[0]
      expect(bondResponse).toMatchObject({
        id: bond.id,
        contractId: bond.contractId,
        treasuryId: bond.treasuryId,
        kpiId: bond.kpiId,
        name: bond.name,
        symbol: bond.symbol,
        decimals: bond.decimals,
        currency: bond.currency,
        nominalValue: bond.nominalValue,
        startingDate: bond.startingDate.toISOString(),
        maturityDate: bond.maturityDate.toISOString(),
        maxSupply: bond.maxSupply,
        isin: bond.isin,
        isPaused: false,
      })
    })

    it("should handle pagination correctly", async () => {
      for (let i = 1; i <= 3; i++) {
        await internalBondRepository.save({
          contractId: `0.0.${6824000 + i}`,
          treasuryId: `0.0.${6824000 + i}`,
          kpiId: `0.0.${6824000 + i}`,
          name: `Green Bond ${i}`,
          symbol: `GBND${i}`,
          decimals: 18,
          currency: "USD",
          nominalValue: "1000",
        nominalValueDecimals: 2,
          startingDate: new Date("2025-01-01"),
          maturityDate: new Date("2030-01-01"),
          maxSupply: "1000000",
          isin: `US${i.toString().padStart(10, "0")}`,
        })
      }

      const response = await request(app.getHttpServer())
        .get("/api/v1/ats/bonds")
        .query({ page: 2, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.total).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(1)
    })

    it("should order bonds by name", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      await internalBondRepository.save({
        contractId: "0.0.6825001",
        treasuryId: "0.0.6825001",
        kpiId: "0.0.6825001",
        name: "Zebra Bond",
        symbol: "ZBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1111111111",
      })

      await internalBondRepository.save({
        contractId: "0.0.6825002",
        treasuryId: "0.0.6825002",
        kpiId: "0.0.6825002",
        name: "Alpha Bond",
        symbol: "ABND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US2222222222",
      })

      const response = await request(app.getHttpServer())
        .get("/api/v1/ats/bonds")
        .query({ orderBy: "name", order: "ASC" })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].name).toBe("Alpha Bond")
      expect(response.body.items[1].name).toBe("Zebra Bond")
    })

    it("should validate pagination parameters", async () => {
      await request(app.getHttpServer()).get("/api/v1/ats/bonds").query({ page: -1 }).expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer()).get("/api/v1/ats/bonds").query({ limit: 0 }).expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get("/api/v1/ats/bonds")
        .query({ order: "INVALID" })
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
