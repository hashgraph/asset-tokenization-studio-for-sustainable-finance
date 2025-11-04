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
import { InvestorPersistence } from "@port/persistence/investor/model/InvestorPersistence"
import { SubscriptionPersistence } from "@port/persistence/subscription/model/SubscriptionPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { SubscriptionCancelledDLTEvent } from "@port/subscription/usecase/cancelsubscription/model/SubscriptionCancelledDLTEvent"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

describe("CancelSubscriptionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>
  let investorRepository: Repository<InvestorPersistence>
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
    await app.init()
    eventBus = app.get("EventBus")
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
    offeringRepository = app.get(getRepositoryToken(OfferingPersistence))
    investorRepository = app.get(getRepositoryToken(InvestorPersistence))
    subscriptionRepository = app.get(getRepositoryToken(SubscriptionPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Subscription").execute()
    await dataSource.createQueryBuilder().delete().from("Investor").execute()
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("CancelSubscriptionNestJSEventAdapter", () => {
    it("should delete subscription when SubscriptionCancelledDLTEvent is published", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering = await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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

      const investor = await investorRepository.save({
        accountId: "0.0.1111",
      })

      await subscriptionRepository.save({
        subscriptionId: "1",
        offering: offering,
        investor: investor,
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      const deletedSubscription = await subscriptionRepository.findOne({
        where: { subscriptionId: "1" },
        relations: ["offering"],
      })

      expect(deletedSubscription).toBeNull()
    })

    it("should throw error when subscription does not exist", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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

      const investor = await investorRepository.save({
        accountId: "0.0.1111",
      })

      await subscriptionRepository.save({
        subscriptionId: "1",
        offering: offering,
        investor: investor,
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await expect(eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)).rejects.toThrow()
    })

    it("should delete only the specific subscription when multiple exist for same offering", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering = await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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

      const investor1 = await investorRepository.save({
        accountId: "0.0.1111",
      })

      const investor2 = await investorRepository.save({
        accountId: "0.0.2222",
      })

      await subscriptionRepository.save({
        subscriptionId: "1",
        offering: offering,
        investor: investor1,
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        subscriptionId: "2",
        offering: offering,
        investor: investor2,
        lotUnits: "2000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      const deletedSubscription = await subscriptionRepository.findOne({
        where: { subscriptionId: "1" },
        relations: ["offering"],
      })

      const remainingSubscription = await subscriptionRepository.findOne({
        where: { subscriptionId: "2" },
        relations: ["offering"],
      })

      expect(deletedSubscription).toBeNull()
      expect(remainingSubscription).toBeDefined()
      expect(remainingSubscription).not.toBeNull()
      expect(remainingSubscription!.subscriptionId).toBe("2")
    })

    it("should correctly delete subscription when same subscriptionId exists in different offerings", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering1 = await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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

      const offering2 = await offeringRepository.save({
        offeringId: "2",
        market,
        bondId: "0.0.8888888",
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

      const investor = await investorRepository.save({
        accountId: "0.0.1111",
      })

      await subscriptionRepository.save({
        subscriptionId: "1",
        offering: offering1,
        investor: investor,
        lotUnits: "1000",
        status: SubscriptionStatus.SUBMITTED,
      })

      await subscriptionRepository.save({
        subscriptionId: "1",
        offering: offering2,
        investor: investor,
        lotUnits: "2000",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionCancelledDLTEvent("0.0.1234567", "0x123456789abcdef", "1", "1")

      await eventBus.publishSync(event, SubscriptionCancelledDLTEvent.name)

      const deletedSubscription = await subscriptionRepository.findOne({
        where: { subscriptionId: "1", offering: { offeringId: "1" } },
        relations: ["offering"],
      })

      const remainingSubscription = await subscriptionRepository.findOne({
        where: { subscriptionId: "1", offering: { offeringId: "2" } },
        relations: ["offering"],
      })

      expect(deletedSubscription).toBeNull()
      expect(remainingSubscription).toBeDefined()
      expect(remainingSubscription).not.toBeNull()
      expect(remainingSubscription!.subscriptionId).toBe("1")
      expect(remainingSubscription!.offering.offeringId).toBe("2")
    })
  })
})
