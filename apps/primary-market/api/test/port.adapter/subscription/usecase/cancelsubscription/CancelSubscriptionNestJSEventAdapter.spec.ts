// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { SubscriptionPersistence } from "@port/persistence/subscription/model/SubscriptionPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { SubscriptionCancelledDLTEvent } from "@port/subscription/usecase/cancelsubscription/model/SubscriptionCancelledDLTEvent"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

describe("CancelSubscriptionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>

  let subscriptionRepository: Repository<SubscriptionPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
    offeringRepository = app.get(getRepositoryToken(OfferingPersistence))
    subscriptionRepository = app.get(getRepositoryToken(SubscriptionPersistence))
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Subscription").execute()
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("CancelSubscriptionNestJSEventAdapter", () => {
    it("should cancel subscription when SubscriptionCancelledDLTEvent is published", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
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
        priceDecimals: 2,
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      const cancelledSubscription = await subscriptionRepository.findOne({
        where: { id: 1 },
        relations: ["offering"],
      })

      expect(cancelledSubscription).toBeDefined()
      expect(cancelledSubscription).not.toBeNull()
      expect(cancelledSubscription!.status).toBe(SubscriptionStatus.CANCELLED)
    })

    it("should throw error when subscription does not exist", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
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
        priceDecimals: 2,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "999")

      await expect(eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)).rejects.toThrow()
    })

    it("should throw error when offering does not exist", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "999", "1")

      await expect(eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)).rejects.toThrow()
    })

    it("should throw error when market does not exist", async () => {
      const event = new SubscriptionCancelledDLTEvent("0.0.9999999", "0x123456789abcdef", "1", "1")

      await expect(eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)).rejects.toThrow()
    })

    it("should throw error when market is paused", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
        isPaused: true,
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
        priceDecimals: 2,
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await expect(eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)).rejects.toThrow()
    })

    it("should cancel only the specific subscription when multiple exist for same offering", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
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
        priceDecimals: 2,
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        id: 2,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "2000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      const cancelledSubscription = await subscriptionRepository.findOne({
        where: { id: 1 },
        relations: ["offering"],
      })

      const remainingSubscription = await subscriptionRepository.findOne({
        where: { id: 2 },
        relations: ["offering"],
      })

      expect(cancelledSubscription).toBeDefined()
      expect(cancelledSubscription).not.toBeNull()
      expect(cancelledSubscription!.status).toBe(SubscriptionStatus.CANCELLED)
      expect(remainingSubscription).toBeDefined()
      expect(remainingSubscription).not.toBeNull()
      expect(remainingSubscription!.id).toBe(2)
      expect(remainingSubscription!.status).toBe(SubscriptionStatus.SUBMITTED)
    })

    it("should correctly cancel subscription when same subscriptionId exists in different offerings", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
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
        priceDecimals: 2,
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
        priceDecimals: 2,
      })

      await subscriptionRepository.save({
        id: 1,
        offering: offering1,
        investorAccountId: "0.0.1111",
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        id: 1,
        offering: offering2,
        investorAccountId: "0.0.1111",
        lotUnits: "2000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      const cancelledSubscription = await subscriptionRepository.findOne({
        where: { id: 1, offering: { id: 1 } },
        relations: ["offering"],
      })

      const remainingSubscription = await subscriptionRepository.findOne({
        where: { id: 1, offering: { id: 2 } },
        relations: ["offering"],
      })

      expect(cancelledSubscription).toBeDefined()
      expect(cancelledSubscription).not.toBeNull()
      expect(cancelledSubscription!.status).toBe(SubscriptionStatus.CANCELLED)
      expect(remainingSubscription).toBeDefined()
      expect(remainingSubscription).not.toBeNull()
      expect(remainingSubscription!.id).toBe(1)
      expect(remainingSubscription!.offering.id).toBe(2)
      expect(remainingSubscription!.status).toBe(SubscriptionStatus.SUBMITTED)
    })

    it("should publish SubscriptionCancelledEvent after successful subscription cancellation", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
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
        priceDecimals: 2,
      })

      await subscriptionRepository.save({
        id: 1,
        offeringId: offering.id,
        marketId: offering.marketId,
        investorAccountId: "0.0.1111",
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          offeringId: 1,
          marketContractId: "0.0.1234567",
          subscriptionId: 1,
        }),
      )
    })
  })
})
