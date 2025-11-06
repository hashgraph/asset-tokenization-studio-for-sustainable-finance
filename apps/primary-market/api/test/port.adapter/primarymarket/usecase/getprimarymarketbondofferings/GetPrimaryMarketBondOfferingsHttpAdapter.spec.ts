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

describe("GetPrimaryMarketBondOfferings API Integration", () => {
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

  describe("GET /primary-markets/:marketContractId/bonds/:bondContractId/offerings", () => {
    it("should return empty list when bond has no offerings in the market", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds/0.0.999/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })

    it("should return all offerings for a specific bond in a market", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondContractId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
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
        bondContractId: "0.0.111", // Same bond
        operatorId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.8888888",
        lotSize: "2000",
        minQuantity: "200",
        maxQuantity: "20000",
        targetQuantity: "10000",
        targetQuantityRule: 0,
        startDate: new Date("2023-02-01"),
        endDate: new Date("2024-02-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/bonds/0.0.111/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)

      const offeringIds = response.body.items.map((item: any) => item.offeringId)
      expect(offeringIds).toContain("1")
      expect(offeringIds).toContain("2")

      // Verify response structure
      expect(response.body.items[0]).toHaveProperty("offeringId")
      expect(response.body.items[0]).toHaveProperty("bondContractId")
      expect(response.body.items[0]).toHaveProperty("operatorId")
      expect(response.body.items[0]).toHaveProperty("lotSize")
    })

    it("should return 404 when primary market does not exist", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/bonds/0.0.111/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should handle pagination parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      // Create 5 offerings for the same bond
      for (let i = 1; i <= 5; i++) {
        await offeringRepository.save({
          offeringId: String(i),
          market,
          bondContractId: "0.0.111",
          operatorId: "0.0.4660",
          treasuryContractId: "0.0.9999999",
          paymentTokenContractId: "0.0.9999999",
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
        .get(`/api/v1/primary-markets/${market.contractId}/bonds/0.0.111/offerings`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.items.length).toBe(3)
      expect(response.body.limit).toBe(3)
      expect(response.body.page).toBe(1)
      expect(response.body.total).toBe(5)
      expect(response.body.totalPages).toBe(2)
    })

    it("should only return offerings for the specified bond", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      // Create offerings for different bonds
      await offeringRepository.save({
        offeringId: "1",
        market,
        bondContractId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
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
        bondContractId: "0.0.222", // Different bond
        operatorId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.8888888",
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
        .get(`/api/v1/primary-markets/${market.contractId}/bonds/0.0.111/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].bondContractId).toBe("0.0.111")
      expect(response.body.items[0].offeringId).toBe("1")
    })

    it("should only return offerings from the specified primary market", async () => {
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
        bondContractId: "0.0.111",
        operatorId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
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
        bondContractId: "0.0.111", // Same bond but different market
        operatorId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.8888888",
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
        .get(`/api/v1/primary-markets/${market1.contractId}/bonds/0.0.111/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].offeringId).toBe("1")
    })
  })
})
