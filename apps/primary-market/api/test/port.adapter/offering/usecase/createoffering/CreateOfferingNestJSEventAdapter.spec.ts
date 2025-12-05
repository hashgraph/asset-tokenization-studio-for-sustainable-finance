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
import { getRepositoryToken } from "@nestjs/typeorm"
import { OfferingCreatedDLTEvent } from "@port/offering/usecase/createoffering/model/OfferingCreatedDLTEvent"

describe("CreateOfferingNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let offeringRepository: Repository<OfferingPersistence>
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    offeringRepository = app.get(getRepositoryToken(OfferingPersistence))
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("CreateOfferingNestJSEventAdapter", () => {
    it("should create a new offering when OfferingCreatedDLTEvent is published", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const event = new OfferingCreatedDLTEvent(
        "0.0.1234567", // contractId (market)
        "0x123456789", // transactionHash
        "1", // offeringId
        "0x0000000000000000000000000000000000001234", // operator (valid EVM address)
        {
          asset: "0x0000000000000000000000000000000000001235", // bond
          treasury: "0x0000000000000000000000000000000000001236",
          paymentToken: "0x0000000000000000000000000000000000001237",
          lotSize: "1000",
          minLots: "100",
          maxLots: "10000",
          targetLots: "5000",
          targetQuantityRule: 0,
          startDate: "1640995200",
          endDate: "1672531200",
          deadlineRule: 0,
          price: "100",
          priceDecimals: 6,
        },
      )

      await eventBus.publishSync(event, OfferingCreatedDLTEvent.name)

      const savedOffering = await offeringRepository.findOne({
        where: { id: 1, marketId: market.id },
        relations: ["market"],
      })

      expect(savedOffering).toBeDefined()
      expect(savedOffering).not.toBeNull()
      expect(savedOffering!.id).toBe(1)
      expect(savedOffering!.bondContractId).toBe("0.0.4661") // Converted from EVM address
      expect(savedOffering!.treasuryContractId).toBe("0.0.4662") // Converted from EVM address
      expect(savedOffering!.paymentTokenContractId).toBe("0.0.4663") // Converted from EVM address
      expect(savedOffering!.lotSize).toBe("1000")
      expect(savedOffering!.minLots).toBe("100")
      expect(savedOffering!.maxLots).toBe("10000")
      expect(savedOffering!.targetLots).toBe("5000")
      expect(savedOffering!.targetQuantityRule).toBe(0)
      expect(savedOffering!.startDate).toEqual(new Date(1640995200 * 1000))
      expect(savedOffering!.endDate).toEqual(new Date(1672531200 * 1000))
      expect(savedOffering!.deadlineRule).toBe(0)
      expect(savedOffering!.price).toBe("100")
      expect(savedOffering!.priceDecimals).toBe(6)
      expect(savedOffering!.market.contractId).toBe("0.0.1234567")
    })

    it("should throw error when offering with same id already exists", async () => {
      const primaryMarket = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const existingOffering = offeringRepository.create({
        id: 1,
        marketId: primaryMarket.id,
        market: primaryMarket,
        bondContractId: "0.0.9999999",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.9999999",
        paymentTokenContractId: "0.0.9999999",
        lotSize: "500",
        minLots: "50",
        maxLots: "5000",
        targetLots: "2500",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
        price: "100",
        priceDecimals: 6,
      })

      await offeringRepository.save(existingOffering)

      const event = new OfferingCreatedDLTEvent(
        "0.0.1234567", // contractId (market)
        "0x123456789", // transactionHash
        "1", // Same offeringId
        "0x0000000000000000000000000000000000001234", // operator (valid EVM address)
        {
          asset: "0x0000000000000000000000000000000000001235", // bond
          treasury: "0x0000000000000000000000000000000000001236",
          paymentToken: "0x0000000000000000000000000000000000001237",
          lotSize: "1000",
          minLots: "100",
          maxLots: "10000",
          targetLots: "5000",
          targetQuantityRule: 0,
          startDate: "1640995200",
          endDate: "1672531200",
          deadlineRule: 0,
          price: "100",
          priceDecimals: 6,
        },
      )

      await expect(eventBus.publishSync(event, OfferingCreatedDLTEvent.name)).rejects.toThrow()
    })

    it("should create multiple offerings for the same market successfully", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      const offeringIds = [1, 2, 3]

      for (const offeringId of offeringIds) {
        const event = new OfferingCreatedDLTEvent(
          "0.0.1234567", // contractId (market)
          "0x123456789", // transactionHash
          String(offeringId),
          "0x0000000000000000000000000000000000001234", // operator (valid EVM address)
          {
            asset: "0x0000000000000000000000000000000000001235", // bond
            treasury: "0x0000000000000000000000000000000000001236",
            paymentToken: "0x0000000000000000000000000000000000001237",
            lotSize: "1000",
            minLots: "100",
            maxLots: "10000",
            targetLots: "5000",
            targetQuantityRule: 0,
            startDate: "1640995200",
            endDate: "1672531200",
            deadlineRule: 0,
            price: "100",
            priceDecimals: 6,
          },
        )

        await eventBus.publishSync(event, OfferingCreatedDLTEvent.name)

        const savedOffering = await offeringRepository.findOne({
          where: { id: offeringId, marketId: market.id },
        })

        expect(savedOffering).toBeDefined()
        expect(savedOffering).not.toBeNull()
        expect(savedOffering!.id).toBe(offeringId)
      }

      const allOfferings = await offeringRepository.find()
      expect(allOfferings).toHaveLength(offeringIds.length)
    })

    it("should publish CreatedOfferingEvent after successful offering creation", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.1234567",
      })

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new OfferingCreatedDLTEvent(
        "0.0.1234567", // contractId (market)
        "0x123456789", // transactionHash
        "1",
        "0x0000000000000000000000000000000000001234", // operator (valid EVM address)
        {
          asset: "0x0000000000000000000000000000000000001235", // bond
          treasury: "0x0000000000000000000000000000000000001236",
          paymentToken: "0x0000000000000000000000000000000000001237",
          lotSize: "1000",
          minLots: "100",
          maxLots: "10000",
          targetLots: "5000",
          targetQuantityRule: 0,
          startDate: "1640995200",
          endDate: "1672531200",
          deadlineRule: 0,
          price: "100",
          priceDecimals: 6,
        },
      )

      await eventBus.publishSync(event, OfferingCreatedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          offeringId: 1,
          marketContractId: "0.0.1234567",
          bondContractId: "0.0.4661", // Converted from EVM address
          treasuryContractId: "0.0.4662", // Converted from EVM address
          paymentTokenContractId: "0.0.4663", // Converted from EVM address
          lotSize: "1000",
          minLots: "100",
          maxLots: "10000",
          targetLots: "5000",
          targetQuantityRule: 0,
          startDate: new Date(1640995200 * 1000),
          endDate: new Date(1672531200 * 1000),
          deadlineRule: 0,
          price: "100",
          priceDecimals: 6,
          timestamp: expect.any(Number),
        }),
      )
    })
  })
})
