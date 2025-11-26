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
import { SubscriptionSubmittedDLTEvent } from "@port/subscription/usecase/submitsubscription/model/SubscriptionSubmittedDLTEvent"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

describe("SubmitSubscriptionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
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
    await app.init()
    eventBus = app.get("EventBus")
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

  describe("SubmitSubscriptionNestJSEventAdapter", () => {
    it("should create a new subscription when SubscriptionSubmittedDLTEvent is published", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        id: 1,
        marketId: market.id,
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
        where: { id: 2, offeringId: 1, marketId: market.id },
        relations: ["offering", "offering.market"],
      })

      expect(savedSubscription).toBeDefined()
      expect(savedSubscription).not.toBeNull()
      expect(savedSubscription!.id).toBe(2)
      expect(savedSubscription!.offering.id).toBe(1)
      expect(savedSubscription!.investorAccountId).toBe("0.0.4660")
      expect(savedSubscription!.lotUnits).toBe("10")
      expect(savedSubscription!.status).toBe(SubscriptionStatus.SUBMITTED)
    })

    it("should throw error when subscription with same id already exists", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering = await offeringRepository.save({
        id: 1,
        marketId: market.id,
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
        id: 2,
        offeringId: offering.id,
        marketId: market.id,
        offering,
        investorAccountId: "0.0.4660",
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
        id: 1,
        marketId: market.id,
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
    })

    it("should publish SubscriptionSubmittedEvent after successful subscription creation", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        id: 1,
        marketId: market.id,
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
          offeringId: 1,
          marketContractId: "0.0.1234567",
          subscriptionId: 2,
          investorAccountId: "0.0.4660",
          lotUnits: "10",
          status: SubscriptionStatus.SUBMITTED,
        }),
      )
    })
  })
})
