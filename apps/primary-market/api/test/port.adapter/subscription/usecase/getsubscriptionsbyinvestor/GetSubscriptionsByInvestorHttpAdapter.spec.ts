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

describe("GetSubscriptionsByInvestor API Integration", () => {
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

  describe("GET /primary-markets/investors/:investorAccountId/subscriptions", () => {
    it("should return empty list when investor has no subscriptions", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
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

    it("should return all subscriptions for an investor", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        market,
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
        priceDecimals: 2,
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.id === 1)
      const item2 = response.body.items.find((item: any) => item.id === 2)

      expect(item1).toMatchObject({
        id: 1,
        offeringId: 1,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })
      expect(item1).toHaveProperty("createdAt")

      expect(item2).toMatchObject({
        id: 2,
        offeringId: 1,
        investorAccountId: "0.0.1111",
        lotUnits: "10",
        status: SubscriptionStatus.EXECUTED,
      })
      expect(item2).toHaveProperty("createdAt")
    })

    it("should handle pagination parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        market,
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
        priceDecimals: 2,
      })

      for (let i = 1; i <= 5; i++) {
        await subscriptionRepository.save({
          id: i,
          offeringId: offering.id,
          marketId: offering.marketId,
          investorAccountId: "0.0.1111",
          lotUnits: String(i * 5),
          status: SubscriptionStatus.SUBMITTED,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should return second page of results", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        market,
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
        priceDecimals: 2,
      })

      for (let i = 1; i <= 5; i++) {
        await subscriptionRepository.save({
          id: i,
          offeringId: offering.id,
          marketId: offering.marketId,
          investorAccountId: "0.0.1111",
          lotUnits: String(i * 5),
          status: SubscriptionStatus.SUBMITTED,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 2, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(2)
    })

    it("should return empty list when investor does not exist", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.99999/subscriptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(0)
      expect(response.body.items).toHaveLength(0)
    })

    it("should return subscriptions with different statuses", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        market,
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
        priceDecimals: 2,
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
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(4)

      const submittedItem = response.body.items.find((item: any) => item.status === SubscriptionStatus.SUBMITTED)
      const executedItem = response.body.items.find((item: any) => item.status === SubscriptionStatus.EXECUTED)
      const failedItem = response.body.items.find((item: any) => item.status === SubscriptionStatus.FAILED)
      const cancelledItem = response.body.items.find((item: any) => item.status === SubscriptionStatus.CANCELLED)

      expect(submittedItem).toBeDefined()
      expect(executedItem).toBeDefined()
      expect(failedItem).toBeDefined()
      expect(cancelledItem).toBeDefined()
    })

    it("should only return subscriptions for the specified investor", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering = await offeringRepository.save({
        id: 1,
        market,
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
        priceDecimals: 2,
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

      await subscriptionRepository.save({
        id: 3,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.2222",
        lotUnits: "15",
        status: SubscriptionStatus.SUBMITTED,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)
      expect(response.body.items.every((item: any) => item.investorAccountId === "0.0.1111")).toBe(true)
    })

    it("should return subscriptions from multiple offerings for the same investor", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const offering1 = await offeringRepository.save({
        id: 1,
        market,
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
        priceDecimals: 2,
      })

      const offering2 = await offeringRepository.save({
        id: 2,
        market,
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
        priceDecimals: 2,
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
        id: 2,
        offeringId: offering2.id,
        marketId: offering2.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "10",
        status: SubscriptionStatus.EXECUTED,
      })

      await subscriptionRepository.save({
        id: 3,
        offeringId: offering1.id,
        marketId: offering1.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "15",
        status: SubscriptionStatus.SUBMITTED,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(3)
      expect(response.body.items).toHaveLength(3)

      const offeringIds = response.body.items.map((item: any) => item.offeringId)
      expect(offeringIds).toContain(1)
      expect(offeringIds).toContain(2)
    })

    it("should return subscriptions from multiple markets for the same investor", async () => {
      const market1 = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.67890",
      })

      const offering1 = await offeringRepository.save({
        id: 1,
        market: market1,
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
        priceDecimals: 2,
      })

      const offering2 = await offeringRepository.save({
        id: 1,
        market: market2,
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
        priceDecimals: 2,
      })

      await subscriptionRepository.save({
        id: 1,
        offering: offering1,
        investorAccountId: "0.0.1111",
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        id: 2,
        offering: offering2,
        investorAccountId: "0.0.1111",
        lotUnits: "10",
        status: SubscriptionStatus.EXECUTED,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/investors/0.0.1111/subscriptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)
      expect(response.body.items.every((item: any) => item.investorAccountId === "0.0.1111")).toBe(true)
    })
  })
})
