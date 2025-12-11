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
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
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
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.111",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "1000",
        minLots: "100",
        maxLots: "10000",
        targetLots: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      await offeringRepository.save({
        id: 2,
        marketId: market.id,
        bondContractId: "0.0.222",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.8888888",
        lotSize: "2000",
        minLots: "200",
        maxLots: "20000",
        targetLots: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)

      const bondIds = response.body.items.map((item: any) => item.bondContractId)
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
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.111",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "1000",
        minLots: "100",
        maxLots: "10000",
        targetLots: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      await offeringRepository.save({
        id: 2,
        marketId: market.id,
        bondContractId: "0.0.111", // Same bondId
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "2000",
        minLots: "200",
        maxLots: "20000",
        targetLots: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-02-01"),
        endDate: new Date("2024-02-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      await offeringRepository.save({
        id: 3,
        marketId: market.id,
        bondContractId: "0.0.111", // Same bondId again
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "3000",
        minLots: "300",
        maxLots: "30000",
        targetLots: "15000",
        targetQuantityRule: 0,
        startDate: new Date("2023-03-01"),
        endDate: new Date("2024-03-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      // Should return only 1 unique bondId
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].bondContractId).toBe("0.0.111")
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
          id: i,
          marketId: market.id,
          bondContractId: `0.0.${100 + i}`,
          operatorAccountId: "0.0.4660",
          treasuryContractId: "0.0.9999999",
          paymentTokenContractId: "0.0.9999999",
          lotSize: "1000",
          minLots: "100",
          maxLots: "10000",
          targetLots: "5000",
          targetQuantityRule: 0,
          startDate: new Date("2023-01-01"),
          endDate: new Date("2024-01-01"),
          deadlineRule: 0,
          price: "100",
          priceDecimals: 2,
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
        id: 1,
        marketId: market1.id,
        bondContractId: "0.0.111",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "1000",
        minLots: "100",
        maxLots: "10000",
        targetLots: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      await offeringRepository.save({
        id: 2,
        marketId: market2.id,
        bondContractId: "0.0.222",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.8888888",
        lotSize: "2000",
        minLots: "200",
        maxLots: "20000",
        targetLots: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market1.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].bondContractId).toBe("0.0.111")
      expect(response.body.total).toBe(1)
    })

    it("should return bondId with correct structure", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.111",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "1000",
        minLots: "100",
        maxLots: "10000",
        targetLots: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0]).toHaveProperty("bondContractId")
      expect(typeof response.body.items[0].bondContractId).toBe("string")
      // Should only have bondContractId, nothing else
      expect(Object.keys(response.body.items[0])).toEqual(["bondContractId"])
    })
  })
})
