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
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("GetPrimaryMarketBonds API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>

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
    offeringRepository = app.get(getRepositoryToken(OfferingPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets/:marketContractId/bonds", () => {
    it("should return empty list when primary market has no offerings", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })

    it("should return unique bondIds for offerings in a primary market", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryId: "0.0.9999999",
        paymentTokenId: "0.0.9999999",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      await offeringRepository.save({
        offeringId: "2",
        market,
        bondId: "0.0.222",
        operatorId: "0.0.4660",
        treasuryId: "0.0.8888888",
        paymentTokenId: "0.0.8888888",
        lotSize: "2000",
        minQuantity: "200",
        maxQuantity: "20000",
        targetQuantity: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)

      const bondIds = response.body.items.map((item: any) => item.bondId)
      expect(bondIds).toContain("0.0.111")
      expect(bondIds).toContain("0.0.222")
    })

    it("should return unique bondIds when same bond has multiple offerings", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      // Create 3 offerings for the same bond
      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryId: "0.0.9999999",
        paymentTokenId: "0.0.9999999",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      await offeringRepository.save({
        offeringId: "2",
        market,
        bondId: "0.0.111", // Same bondId
        operatorId: "0.0.4660",
        treasuryId: "0.0.9999999",
        paymentTokenId: "0.0.9999999",
        lotSize: "2000",
        minQuantity: "200",
        maxQuantity: "20000",
        targetQuantity: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-02-01"),
        endDate: new Date("2024-02-01"),
        deadlineRule: 0,
      })

      await offeringRepository.save({
        offeringId: "3",
        market,
        bondId: "0.0.111", // Same bondId again
        operatorId: "0.0.4660",
        treasuryId: "0.0.9999999",
        paymentTokenId: "0.0.9999999",
        lotSize: "3000",
        minQuantity: "300",
        maxQuantity: "30000",
        targetQuantity: "15000",
        targetQuantityRule: 0,
        startDate: new Date("2023-03-01"),
        endDate: new Date("2024-03-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      // Should return only 1 unique bondId
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].bondId).toBe("0.0.111")
      expect(response.body.total).toBe(1)
    })

    it("should return 404 when primary market does not exist", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should handle pagination parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      // Create 5 offerings with different bondIds
      for (let i = 1; i <= 5; i++) {
        await offeringRepository.save({
          offeringId: String(i),
          market,
          bondId: `0.0.${100 + i}`,
          operatorId: "0.0.4660",
          treasuryId: "0.0.9999999",
          paymentTokenId: "0.0.9999999",
          lotSize: "1000",
          minQuantity: "100",
          maxQuantity: "10000",
          targetQuantity: "5000",
          targetQuantityRule: 0,
          startDate: new Date("2023-01-01"),
          endDate: new Date("2024-01-01"),
          deadlineRule: 0,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      // Should return 3 unique bondIds from the first 3 offerings
      expect(response.body.items.length).toBe(3)
      expect(response.body.limit).toBe(3)
      expect(response.body.page).toBe(1)
      expect(response.body.total).toBe(5)
      expect(response.body.totalPages).toBe(2)
    })

    it("should only return bonds from the specified primary market", async () => {
      const market1 = await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.22222",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringId: "1",
        market: market1,
        bondId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryId: "0.0.9999999",
        paymentTokenId: "0.0.9999999",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      await offeringRepository.save({
        offeringId: "2",
        market: market2,
        bondId: "0.0.222",
        operatorId: "0.0.4660",
        treasuryId: "0.0.8888888",
        paymentTokenId: "0.0.8888888",
        lotSize: "2000",
        minQuantity: "200",
        maxQuantity: "20000",
        targetQuantity: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market1.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].bondId).toBe("0.0.111")
      expect(response.body.total).toBe(1)
    })

    it("should return bondId with correct structure", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryId: "0.0.9999999",
        paymentTokenId: "0.0.9999999",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0]).toHaveProperty("bondId")
      expect(typeof response.body.items[0].bondId).toBe("string")
      // Should only have bondId, nothing else
      expect(Object.keys(response.body.items[0])).toEqual(["bondId"])
    })
  })
})
