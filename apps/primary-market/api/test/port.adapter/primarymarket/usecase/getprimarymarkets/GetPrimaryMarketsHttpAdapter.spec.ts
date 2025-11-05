// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("GetPrimaryMarkets API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>

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
    app.setGlobalPrefix("api/v1/")
    app.useLogger(false)
    await app.init()

    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets", () => {
    it("should return empty list when no primary markets exist", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body.total).toBe(0)
      expect(response.body).toHaveProperty("page")
      expect(response.body.page).toBe(1)
      expect(response.body).toHaveProperty("limit")
      expect(response.body.limit).toBe(10)
      expect(response.body).toHaveProperty("totalPages")
      expect(response.body.totalPages).toBe(0)
    })

    it("should return all primary markets", async () => {
      const market1 = await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.22222",
        isPaused: true,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.contractId === "0.0.11111")
      const item2 = response.body.items.find((item: any) => item.contractId === "0.0.22222")

      expect(item1).toMatchObject({
        id: market1.id,
        contractId: "0.0.11111",
        isPaused: false,
      })
      expect(item1).toHaveProperty("createdAt")

      expect(item2).toMatchObject({
        id: market2.id,
        contractId: "0.0.22222",
        isPaused: true,
      })
      expect(item2).toHaveProperty("createdAt")
    })

    it("should handle pagination parameters", async () => {
      for (let i = 1; i <= 5; i++) {
        await primaryMarketRepository.save({
          contractId: `0.0.${10000 + i}`,
          isPaused: i % 2 === 0,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should return second page of results", async () => {
      for (let i = 1; i <= 5; i++) {
        await primaryMarketRepository.save({
          contractId: `0.0.${10000 + i}`,
          isPaused: i % 2 === 0,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 2, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(2)
    })

    it("should return markets with different isPaused states", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      await primaryMarketRepository.save({
        contractId: "0.0.22222",
        isPaused: true,
      })

      await primaryMarketRepository.save({
        contractId: "0.0.33333",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(3)

      const pausedMarkets = response.body.items.filter((item: any) => item.isPaused === true)
      const unpausedMarkets = response.body.items.filter((item: any) => item.isPaused === false)

      expect(pausedMarkets).toHaveLength(1)
      expect(unpausedMarkets).toHaveLength(2)
    })

    it("should return all markets regardless of order", async () => {
      const markets = []
      for (let i = 1; i <= 3; i++) {
        const market = await primaryMarketRepository.save({
          contractId: `0.0.${10000 + i}`,
          isPaused: false,
        })
        markets.push(market)
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(3)

      const contractIds = response.body.items.map((item: any) => item.contractId)
      expect(contractIds).toContain("0.0.10001")
      expect(contractIds).toContain("0.0.10002")
      expect(contractIds).toContain("0.0.10003")
    })

    it("should handle default pagination when no query params provided", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets`).expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
      expect(response.body.items).toHaveLength(1)
    })

    it("should return correct total count with pagination", async () => {
      for (let i = 1; i <= 10; i++) {
        await primaryMarketRepository.save({
          contractId: `0.0.${10000 + i}`,
          isPaused: i % 2 === 0,
        })
      }

      const page1Response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      const page2Response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 2, limit: 3 })
        .expect(200)

      expect(page1Response.body.total).toBe(10)
      expect(page2Response.body.total).toBe(10)
      expect(page1Response.body.totalPages).toBe(4)
      expect(page2Response.body.totalPages).toBe(4)
    })

    it("should return empty array for page beyond total pages", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 10, limit: 10 })
        .expect(200)

      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(10)
      expect(response.body.totalPages).toBe(1)
    })

    it("should return all expected fields for each primary market", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)

      const market = response.body.items[0]
      expect(market).toHaveProperty("id")
      expect(market).toHaveProperty("createdAt")
      expect(market).toHaveProperty("contractId")
      expect(market).toHaveProperty("isPaused")
      expect(typeof market.id).toBe("string")
      expect(typeof market.createdAt).toBe("string")
      expect(typeof market.contractId).toBe("string")
      expect(typeof market.isPaused).toBe("boolean")
    })
  })
})
