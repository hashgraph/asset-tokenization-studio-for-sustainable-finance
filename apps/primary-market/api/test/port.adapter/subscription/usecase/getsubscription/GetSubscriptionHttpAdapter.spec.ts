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
import { SubscriptionPersistence } from "@port/persistence/subscription/model/SubscriptionPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

describe("GetSubscription API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>

  let subscriptionRepository: Repository<SubscriptionPersistence>

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
    subscriptionRepository = app.get(getRepositoryToken(SubscriptionPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Subscription").execute()
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets/:marketContractId/offerings/:offeringId/subscriptions/:subscriptionId", () => {
    it("should return subscription with valid parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.9999999",
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
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/1`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: 1,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })
      expect(response.body).toHaveProperty("createdAt")
    })

    it("should return subscription with different status values", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.9999999",
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
      })

      const statuses = [
        SubscriptionStatus.SUBMITTED,
        SubscriptionStatus.EXECUTED,
        SubscriptionStatus.FAILED,
        SubscriptionStatus.CANCELLED,
      ]

      for (const [index, status] of statuses.entries()) {
        await subscriptionRepository.save({
          id: index + 1,
          offeringId: offering.id,
          marketId: offering.marketId,
          investorAccountId: "0.0.1111",
          lotUnits: "5",
          status: status,
        })

        const response = await request(app.getHttpServer())
          .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/${index + 1}`)
          .expect(200)

        expect(response.body.status).toBe(status)
      }
    })

    it("should return 404 when subscription does not exist", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.9999999",
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
      })

      await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/999`)
        .expect(404)
    })

    it("should return 404 when offering does not exist", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/999/subscriptions/1`)
        .expect(404)
    })

    it("should return 404 when market does not exist", async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/offerings/1/subscriptions/1`)
        .expect(404)
    })

    it("should return different subscriptions for different subscription IDs", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.9999999",
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
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        id: 2,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "10",
        status: SubscriptionStatus.EXECUTED,
      })

      const response1 = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/1`)
        .expect(200)

      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/2`)
        .expect(200)

      expect(response1.body.id).toBe(1)
      expect(response1.body.lotUnits).toBe("5")
      expect(response1.body.status).toBe(SubscriptionStatus.SUBMITTED)

      expect(response2.body.id).toBe(2)
      expect(response2.body.lotUnits).toBe("10")
      expect(response2.body.status).toBe(SubscriptionStatus.EXECUTED)
    })

    it("should return subscription from correct offering when subscription ID exists in multiple offerings", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering1 = await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.9999999",
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
      })

      const offering2 = await offeringRepository.save({
        id: 2,
        marketId: market.id,
        bondContractId: "0.0.8888888",
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
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering1.id,
        marketId: offering1.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering2.id,
        marketId: offering2.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "10",
        status: SubscriptionStatus.EXECUTED,
      })

      const response1 = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/1`)
        .expect(200)

      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/2/subscriptions/1`)
        .expect(200)

      expect(response1.body.id).toBe(1)
      expect(response1.body.lotUnits).toBe("5")
      expect(response1.body.status).toBe(SubscriptionStatus.SUBMITTED)

      expect(response2.body.id).toBe(1)
      expect(response2.body.lotUnits).toBe("10")
      expect(response2.body.status).toBe(SubscriptionStatus.EXECUTED)
    })

    it("should handle large subscription IDs", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        marketId: market.id,
        bondContractId: "0.0.9999999",
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
      })

      await subscriptionRepository.save({
        id: 999999999,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1/subscriptions/999999999`)
        .expect(200)

      expect(response.body.id).toBe(999999999)
    })
  })
})
