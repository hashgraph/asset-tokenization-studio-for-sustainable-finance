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
import { SubscriptionSubmittedDLTEvent } from "@port/subscription/usecase/submitsubscription/model/SubscriptionSubmittedDLTEvent"
import { OfferingStatus } from "@domain/shared/model/OfferingStatus"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

describe("SubmitSubscriptionNestJSEventAdapter Integration", () => {
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

  describe("SubmitSubscriptionNestJSEventAdapter", () => {
    it("should create a new subscription when SubscriptionSubmittedDLTEvent is published", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        status: OfferingStatus.CREATED,
      })

      const event = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "1",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      await eventBus.publishSync(event, SubscriptionSubmittedDLTEvent.name)

      const savedSubscription = await subscriptionRepository.findOne({
        where: { subscriptionId: "2" },
        relations: ["offering", "investor"],
      })

      expect(savedSubscription).toBeDefined()
      expect(savedSubscription).not.toBeNull()
      expect(savedSubscription!.subscriptionId).toBe("2")
      expect(savedSubscription!.offering.offeringId).toBe("1")
      expect(savedSubscription!.investor.accountId).toBe("0.0.4660")
      expect(savedSubscription!.lotUnits).toBe("10")
      expect(savedSubscription!.status).toBe(SubscriptionStatus.SUBMITTED)
    })

    it("should create investor if it does not exist", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        status: OfferingStatus.CREATED,
      })

      const event = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "1",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      await eventBus.publishSync(event, SubscriptionSubmittedDLTEvent.name)

      const investors = await investorRepository.find()
      expect(investors).toHaveLength(1)
      expect(investors[0].accountId).toBe("0.0.4660")
    })

    it("should reuse existing investor when creating subscription", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        status: OfferingStatus.CREATED,
      })

      await investorRepository.save({
        accountId: "0.0.4660",
      })

      const event = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "1",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      await eventBus.publishSync(event, SubscriptionSubmittedDLTEvent.name)

      const investors = await investorRepository.find()
      expect(investors).toHaveLength(1)

      const subscriptions = await subscriptionRepository.find()
      expect(subscriptions).toHaveLength(1)
    })

    it("should throw error when subscription with same subscriptionId already exists", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering = await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        status: OfferingStatus.CREATED,
      })

      const investor = await investorRepository.save({
        accountId: "0.0.4660",
      })

      await subscriptionRepository.save({
        subscriptionId: "2",
        offering,
        investor,
        lotUnits: "5",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "1",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      await expect(eventBus.publishSync(event, SubscriptionSubmittedDLTEvent.name)).rejects.toThrow()
    })

    it("should throw error when offering does not exist", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const event = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "999",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      await expect(eventBus.publishSync(event, SubscriptionSubmittedDLTEvent.name)).rejects.toThrow()
    })

    it("should create multiple subscriptions for different investors", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        status: OfferingStatus.CREATED,
      })

      const event1 = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "1",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      const event2 = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0xabcdef123456789",
        "1",
        "3",
        "0x0000000000000000000000000000000000005678",
        "20",
      )

      await eventBus.publishSync(event1, SubscriptionSubmittedDLTEvent.name)
      await eventBus.publishSync(event2, SubscriptionSubmittedDLTEvent.name)

      const subscriptions = await subscriptionRepository.find()
      expect(subscriptions).toHaveLength(2)

      const investors = await investorRepository.find()
      expect(investors).toHaveLength(2)
    })

    it("should publish SubscriptionSubmittedEvent after successful subscription creation", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market,
        bondId: "0.0.9999999",
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
        status: OfferingStatus.CREATED,
      })

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new SubscriptionSubmittedDLTEvent(
        "0.0.1234567",
        "0x123456789abcdef",
        "1",
        "2",
        "0x0000000000000000000000000000000000001234",
        "10",
      )

      await eventBus.publishSync(event, SubscriptionSubmittedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          offeringId: "1",
          subscriptionId: "2",
          investorId: "0.0.4660",
          lotUnits: "10",
          status: SubscriptionStatus.SUBMITTED,
        }),
      )
    })
  })
})
