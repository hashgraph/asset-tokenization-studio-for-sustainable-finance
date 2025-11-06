// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { SubscriptionPersistence } from "@port/persistence/subscription/model/SubscriptionPersistence"
import { InvestorPersistence } from "@port/persistence/investor/model/InvestorPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { OfferingExecutedDLTEvent } from "@port/offering/usecase/executeoffering/model/OfferingExecutedDLTEvent"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

describe("ExecuteOfferingNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let offeringRepository: Repository<OfferingPersistence>
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let subscriptionRepository: Repository<SubscriptionPersistence>
  let investorRepository: Repository<InvestorPersistence>

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
    offeringRepository = app.get(getRepositoryToken(OfferingPersistence))
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
    subscriptionRepository = app.get(getRepositoryToken(SubscriptionPersistence))
    investorRepository = app.get(getRepositoryToken(InvestorPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Subscription").execute()
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("Investor").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("ExecuteOfferingNestJSEventAdapter", () => {
    it("should update subscription statuses to EXECUTED and FAILED when OfferingExecutedDLTEvent is published", async () => {
      const primaryMarket = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering = await offeringRepository.save({
        offeringId: "1",
        market: primaryMarket,
        bondContractId: "0.0.9999999",
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

      const investor1 = await investorRepository.save({
        accountId: "0.0.1111",
      })

      const investor2 = await investorRepository.save({
        accountId: "0.0.2222",
      })

      const investor3 = await investorRepository.save({
        accountId: "0.0.3333",
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

      await subscriptionRepository.save({
        subscriptionId: "3",
        offering: offering,
        investor: investor3,
        lotUnits: "500",
        status: SubscriptionStatus.SUBMITTED,
      })

      const event = new OfferingExecutedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        "1",
        "0x0000000000000000000000000000000000001234",
        ["1", "2"],
        ["3"],
      )

      await eventBus.publishSync(event, OfferingExecutedDLTEvent.name)

      const subscription1 = await subscriptionRepository.findOne({ where: { subscriptionId: "1" } })
      const subscription2 = await subscriptionRepository.findOne({ where: { subscriptionId: "2" } })
      const subscription3 = await subscriptionRepository.findOne({ where: { subscriptionId: "3" } })

      expect(subscription1!.status).toBe(SubscriptionStatus.EXECUTED)
      expect(subscription2!.status).toBe(SubscriptionStatus.EXECUTED)
      expect(subscription3!.status).toBe(SubscriptionStatus.FAILED)
    })

    it("should throw error when offering does not exist", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const event = new OfferingExecutedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        "999",
        "0x0000000000000000000000000000000000001234",
        [],
        [],
      )

      await expect(eventBus.publishSync(event, OfferingExecutedDLTEvent.name)).rejects.toThrow()
    })

    it("should throw error when subscription does not exist", async () => {
      const primaryMarket = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market: primaryMarket,
        bondContractId: "0.0.9999999",
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

      const event = new OfferingExecutedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        "1",
        "0x0000000000000000000000000000000000001234",
        ["999"],
        [],
      )

      await expect(eventBus.publishSync(event, OfferingExecutedDLTEvent.name)).rejects.toThrow()
    })

    it("should throw error when operator is not authorized", async () => {
      const primaryMarket = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market: primaryMarket,
        bondContractId: "0.0.9999999",
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

      const event = new OfferingExecutedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        "1",
        "0x0000000000000000000000000000000000009999",
        [],
        [],
      )

      await expect(eventBus.publishSync(event, OfferingExecutedDLTEvent.name)).rejects.toThrow()
    })

    it("should handle empty subscription arrays", async () => {
      const primaryMarket = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      await offeringRepository.save({
        offeringId: "1",
        market: primaryMarket,
        bondContractId: "0.0.9999999",
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

      const event = new OfferingExecutedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        "1",
        "0x0000000000000000000000000000000000001234",
        [],
        [],
      )

      await expect(eventBus.publishSync(event, OfferingExecutedDLTEvent.name)).resolves.not.toThrow()
    })

    it("should update multiple subscriptions successfully with mixed results", async () => {
      const primaryMarket = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offering = await offeringRepository.save({
        offeringId: "1",
        market: primaryMarket,
        bondContractId: "0.0.9999999",
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

      const investors = await Promise.all([
        investorRepository.save({ accountId: "0.0.1111" }),
        investorRepository.save({ accountId: "0.0.2222" }),
        investorRepository.save({ accountId: "0.0.3333" }),
        investorRepository.save({ accountId: "0.0.4444" }),
        investorRepository.save({ accountId: "0.0.5555" }),
      ])

      await Promise.all(
        investors.map((investor, index) =>
          subscriptionRepository.save({
            subscriptionId: `${index + 1}`,
            offering: offering,
            investor: investor,
            lotUnits: `${(index + 1) * 1000}`,
            status: SubscriptionStatus.SUBMITTED,
          }),
        ),
      )

      const event = new OfferingExecutedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        "1",
        "0x0000000000000000000000000000000000001234",
        ["1", "2", "3"], // 3 successful
        ["4", "5"], // 2 failed
      )

      await eventBus.publishSync(event, OfferingExecutedDLTEvent.name)

      const subscriptions = await subscriptionRepository.find({ order: { subscriptionId: "ASC" } })

      expect(subscriptions[0].status).toBe(SubscriptionStatus.EXECUTED)
      expect(subscriptions[1].status).toBe(SubscriptionStatus.EXECUTED)
      expect(subscriptions[2].status).toBe(SubscriptionStatus.EXECUTED)
      expect(subscriptions[3].status).toBe(SubscriptionStatus.FAILED)
      expect(subscriptions[4].status).toBe(SubscriptionStatus.FAILED)
    })
  })
})
