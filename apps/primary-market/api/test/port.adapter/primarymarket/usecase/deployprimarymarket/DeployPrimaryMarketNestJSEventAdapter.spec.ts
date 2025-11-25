// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { PrimaryMarketDeployedDLTEvent } from "@port/primarymarket/usecase/deployprimarymarket/model/PrimaryMarketDeployedDLTEvent"
import { PrimaryMarketFoundError } from "@domain/primarymarket/errors/PrimaryMarketFoundError"

describe("DeployPrimaryMarketNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>

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

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x0000000000000000000000000000000000001234": "0.0.1234567",
        "0x0000000000000000000000000000000000001235": "0.0.1234568",
        "0x0000000000000000000000000000000000001236": "0.0.1234569",
        "0x0000000000000000000000000000000000001237": "0.0.1234570",
        "0x0000000000000000000000000000000000001238": "0.0.1234571",
        "0x0000000000000000000000000000000000001239": "0.0.1234572",
        "0x000000000000000000000000000000000000123a": "0.0.1234573",
      }
      return Promise.resolve(addressMap[address.toLowerCase()] || addressMap[address] || "0.0.9999999")
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("Subscription").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("DeployPrimaryMarketNestJSEventAdapter", () => {
    it("should create a new primary market when PrimaryMarketDeployedDLTEvent is published", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      const event = new PrimaryMarketDeployedDLTEvent(
        "0.0.7654321",
        "0x123456789abcdef",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000001235",
        "0x0000000000000000000000000000000000001236",
        {
          key: "0x0000000000000000000000000000000000000000000000000000000000002711",
          version: "1",
        },
        [
          {
            role: "0x0000000000000000000000000000000000000000000000000000000000000000",
            members: ["0x0000000000000000000000000000000000001237"],
          },
        ],
      )

      await eventBus.publishSync(event, PrimaryMarketDeployedDLTEvent.name)

      const savedPrimaryMarket = await primaryMarketRepository.findOne({
        where: { contractId: "0.0.1234568" },
      })

      expect(savedPrimaryMarket).toBeDefined()
      expect(savedPrimaryMarket).not.toBeNull()
      expect(savedPrimaryMarket!.contractId).toBe("0.0.1234568")
      expect(savedPrimaryMarket!.isPaused).toBe(false)
    })

    it("should throw PrimaryMarketFoundError when primary market with same address already exists", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      await primaryMarketRepository.save({
        contractId: "0.0.1234568",
        isPaused: false,
      })

      const event = new PrimaryMarketDeployedDLTEvent(
        "0.0.7654321",
        "0x123456789abcdef",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000001235",
        "0x0000000000000000000000000000000000001236",
        {
          key: "0x0000000000000000000000000000000000000000000000000000000000002711",
          version: "1",
        },
        [
          {
            role: "0x0000000000000000000000000000000000000000000000000000000000000000",
            members: ["0x0000000000000000000000000000000000001237"],
          },
        ],
      )

      await expect(eventBus.publishSync(event, PrimaryMarketDeployedDLTEvent.name)).rejects.toThrow(
        PrimaryMarketFoundError.contractIdError("0.0.1234568"),
      )
    })

    it("should create multiple primary markets successfully", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      const addresses = [
        "0x0000000000000000000000000000000000001238",
        "0x0000000000000000000000000000000000001239",
        "0x000000000000000000000000000000000000123a",
      ]

      for (const address of addresses) {
        const event = new PrimaryMarketDeployedDLTEvent(
          "0.0.7654321",
          "0x123456789abcdef",
          "0x0000000000000000000000000000000000001234",
          address,
          "0x0000000000000000000000000000000000001236",
          {
            key: "0x0000000000000000000000000000000000000000000000000000000000002711",
            version: "1",
          },
          [
            {
              role: "0x0000000000000000000000000000000000000000000000000000000000000000",
              members: ["0x0000000000000000000000000000000000001237"],
            },
          ],
        )

        await eventBus.publishSync(event, PrimaryMarketDeployedDLTEvent.name)
      }

      const allPrimaryMarkets = await primaryMarketRepository.find()
      expect(allPrimaryMarkets).toHaveLength(addresses.length)
    })

    it("should publish PrimaryMarketDeployedEvent after successful creation", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new PrimaryMarketDeployedDLTEvent(
        "0.0.7654321",
        "0x123456789abcdef",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000001235",
        "0x0000000000000000000000000000000000001236",
        {
          key: "0x0000000000000000000000000000000000000000000000000000000000002711",
          version: "1",
        },
        [
          {
            role: "0x0000000000000000000000000000000000000000000000000000000000000000",
            members: ["0x0000000000000000000000000000000000001237"],
          },
        ],
      )

      await eventBus.publishSync(event, PrimaryMarketDeployedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: "0.0.1234568",
          timestamp: expect.any(Number),
        }),
      )
    })
  })
})
