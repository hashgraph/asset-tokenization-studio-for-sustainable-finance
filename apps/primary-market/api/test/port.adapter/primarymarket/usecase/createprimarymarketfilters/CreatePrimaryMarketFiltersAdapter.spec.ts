// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { CommandBus, ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { PrimaryMarketDeployedEvent } from "@domain/primarymarket/events/PrimaryMarketDeployedEvent"

describe("CreatePrimaryMarketFiltersAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let commandBus: CommandBus

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    commandBus = app.get("CommandBus")

    jest.spyOn(ConverterUtils, "getEvmAddressFromHederaAddress").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0.0.1234567": "0x00000000000000000000000000000000001299d7",
        "0.0.9999999": "0x000000000000000000000000000000000098967f",
      }
      return Promise.resolve(addressMap[address] || "0x0000000000000000000000000000000000000000")
    })
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await app.close()
  })

  describe("CreatePrimaryMarketFiltersAdapter", () => {
    it("should add event filters when PrimaryMarketDeployedEvent is published", async () => {
      let capturedCommand: any

      jest.spyOn(commandBus, "execute").mockImplementation((command) => {
        if (command.constructor.name === "AddEventFiltersCommand") {
          capturedCommand = command
        }
        return Promise.resolve()
      })

      const event = new PrimaryMarketDeployedEvent("0.0.1234567")

      await eventBus.publishSync(event, PrimaryMarketDeployedEvent.name)

      expect(capturedCommand).toBeDefined()
      expect(capturedCommand!.contractAddress).toBe("0x00000000000000000000000000000000001299d7")
      expect(capturedCommand!.eventSignatures).toEqual(
        expect.arrayContaining([
          "OfferingCreated(uint256 indexed offeringId,address indexed operator,(address asset,uint8 targetQuantityRule,uint8 deadlineRule,uint8 priceDecimals,address treasury,address paymentToken,uint256 lotSize,uint256 minLots,uint256 maxLots,uint256 targetLots,uint256 startDate,uint256 endDate,uint256 price) offering)",
          "RoleGranted(address indexed operator,address indexed account,bytes32 indexed role)",
          "RoleRenounced(address indexed account, bytes32 indexed role)",
          "RolesApplied(bytes32[] roles, bool[] actives, address account)",
          "TokenPaused(address indexed operator)",
          "TokenUnpaused(address indexed operator)",
          "SubscriptionSubmitted(uint256 indexed offeringId,uint256 indexed subscriptionId,address indexed investor,uint256 lotUnits)",
          "SubscriptionCancelled(uint256 indexed offeringId,uint256 indexed subscriptionId)",
          "OfferingExecuted(uint256 indexed offeringId,address indexed operator,(uint256 subscriptionId,uint8 status)[] result)",
          "OfferingCancelled(uint256 indexed offeringId,address indexed operator,(uint256 subscriptionId,uint8 status)[] result)",
        ]),
      )
    })

    it("should add all required event filters", async () => {
      let capturedCommand: any

      jest.spyOn(commandBus, "execute").mockImplementation((command) => {
        if (command.constructor.name === "AddEventFiltersCommand") {
          capturedCommand = command
        }
        return Promise.resolve()
      })

      const event = new PrimaryMarketDeployedEvent("0.0.1234567")

      await eventBus.publishSync(event, PrimaryMarketDeployedEvent.name)

      expect(capturedCommand).toBeDefined()
      expect(capturedCommand!.eventSignatures).toHaveLength(10)
      expect(capturedCommand!.eventSignatures).toEqual([
        "OfferingCreated(uint256 indexed offeringId,address indexed operator,(address asset,uint8 targetQuantityRule,uint8 deadlineRule,uint8 priceDecimals,address treasury,address paymentToken,uint256 lotSize,uint256 minLots,uint256 maxLots,uint256 targetLots,uint256 startDate,uint256 endDate,uint256 price) offering)",
        "RoleGranted(address indexed operator,address indexed account,bytes32 indexed role)",
        "RoleRenounced(address indexed account, bytes32 indexed role)",
        "RolesApplied(bytes32[] roles, bool[] actives, address account)",
        "TokenPaused(address indexed operator)",
        "TokenUnpaused(address indexed operator)",
        "SubscriptionSubmitted(uint256 indexed offeringId,uint256 indexed subscriptionId,address indexed investor,uint256 lotUnits)",
        "SubscriptionCancelled(uint256 indexed offeringId,uint256 indexed subscriptionId)",
        "OfferingExecuted(uint256 indexed offeringId,address indexed operator,(uint256 subscriptionId,uint8 status)[] result)",
        "OfferingCancelled(uint256 indexed offeringId,address indexed operator,(uint256 subscriptionId,uint8 status)[] result)",
      ])
    })

    it("should convert Hedera address to EVM address correctly", async () => {
      let capturedCommand: any

      jest.spyOn(commandBus, "execute").mockImplementation((command) => {
        if (command.constructor.name === "AddEventFiltersCommand") {
          capturedCommand = command
        }
        return Promise.resolve()
      })

      const event = new PrimaryMarketDeployedEvent("0.0.9999999")

      await eventBus.publishSync(event, PrimaryMarketDeployedEvent.name)

      expect(capturedCommand).toBeDefined()
      expect(capturedCommand!.contractAddress).toBe("0x000000000000000000000000000000000098967f")
    })
  })
})
