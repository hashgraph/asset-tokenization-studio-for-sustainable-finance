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
import { OfferingStatus } from "@domain/offering/model/OfferingStatus"
import type { BlockchainAdapterPort } from "@port/blockchain/BlockchainAdapterPort"

describe("GetOfferings API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>

  const mockBlockchainAdapter: BlockchainAdapterPort = {
    getOfferingStatus: jest.fn().mockResolvedValue(OfferingStatus.OPEN),
  }

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [
        ...PROVIDERS.filter((provider) => {
          const providerName = typeof provider === "object" && "provide" in provider ? provider.provide : null
          return providerName !== "BlockchainAdapterPort"
        }),
        {
          provide: "BlockchainAdapterPort",
          useValue: mockBlockchainAdapter,
        },
      ],
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

  describe("GET /primary-markets/:marketContractId/offerings", () => {
    it("should return empty list when market has no offerings", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })

    it("should return all offerings for a market regardless of bond", async () => {
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
        startDate: new Date("2023-02-01"),
        endDate: new Date("2024-02-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)

      const offeringIds = response.body.items.map((item: any) => item.id)
      expect(offeringIds).toContain(1)
      expect(offeringIds).toContain(2)

      // Verify response structure
      expect(response.body.items[0]).toHaveProperty("id")
      expect(response.body.items[0]).toHaveProperty("bondContractId")
      expect(response.body.items[0]).toHaveProperty("operatorAccountId")
      expect(response.body.items[0]).toHaveProperty("lotSize")
      expect(response.body.items[0]).toHaveProperty("status")
      expect(response.body.items[0].status).toBe(OfferingStatus.OPEN)
    })

    it("should return 404 when primary market does not exist", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should handle pagination parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      // Create 5 offerings with different bonds
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
        .get(`/api/v1/primary-markets/${market.contractId}/offerings`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.items.length).toBe(3)
      expect(response.body.limit).toBe(3)
      expect(response.body.page).toBe(1)
      expect(response.body.total).toBe(5)
      expect(response.body.totalPages).toBe(2)
    })

    it("should only return offerings for the specified market", async () => {
      const market1 = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.67890",
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
        startDate: new Date("2023-02-01"),
        endDate: new Date("2024-02-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market1.contractId}/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].id).toBe(1)
      expect(response.body.items[0].bondContractId).toBe("0.0.111")
    })

    it("should return offerings with correct status from blockchain", async () => {
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
        .get(`/api/v1/primary-markets/${market.contractId}/offerings`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items[0].status).toBe(OfferingStatus.OPEN)
    })
  })
})
