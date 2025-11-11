// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { BlockchainEventListenerModule } from "@hashgraph/green-bonds-blockchain-listener"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EventFilterPersistence } from "@hashgraph/green-bonds-blockchain-listener"
import { TreasuryCreatedEvent } from "@domain/treasury/event/TreasuryCreatedEvent"

describe("CreateTreasuryFilters Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalEventFilterRepository: Repository<EventFilterPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, BlockchainEventListenerModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalEventFilterRepository = app.get(getRepositoryToken(EventFilterPersistence))

    const hederaPort = app.get("HederaPort")
    jest.spyOn(hederaPort, "getBlock").mockRejectedValue(undefined)
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEventFilterRepository.deleteAll()
  })

  it("should add Treasury events to events filters", async () => {
    const treasuryContractId = "0.0.111"
    const treasuryContractEvmAddress = "0x000000000000000000000000000000000000006f"

    const event = new TreasuryCreatedEvent(treasuryContractId)
    await eventBus.publishSync(event, TreasuryCreatedEvent.name)

    const events = await internalEventFilterRepository.find()
    expect(events).toHaveLength(17)
    expect(events[0]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "RoleGranted",
      eventSignature: "RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[1]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "RoleRevoked",
      eventSignature: "RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[2]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "RoleRenounced",
      eventSignature: "RoleRenounced(address indexed account, bytes32 indexed role)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[3]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "RolesApplied",
      eventSignature: "RolesApplied(bytes32[] roles, bool[] actives, address account)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[4]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "TokenPaused",
      eventSignature: "TokenPaused(address indexed operator)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[5]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "TokenUnpaused",
      eventSignature: "TokenUnpaused(address indexed operator)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[6]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "EnvironmentalAssetAdded",
      eventSignature: "EnvironmentalAssetAdded(address indexed operator, address environmentalAsset)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[7]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "EnvironmentalAssetRemoved",
      eventSignature:
        "EnvironmentalAssetRemoved(address indexed operator, address environmentalAsset, int256 dissociationError)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[8]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "PaymentTokenUpdated",
      eventSignature:
        "PaymentTokenUpdated(address indexed operator, address newPaymentToken, address oldPaymentToken, " +
        "int256 dissociationError)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[9]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "TokenDissociated",
      eventSignature: "TokenDissociated(address token)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[10]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "PaymentTokenTransferred",
      eventSignature: "PaymentTokenTransferred(address to, uint256 amount)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[11]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "EnvironmentalAssetTokenTransferred",
      eventSignature: "EnvironmentalAssetTokenTransferred(address environmentalAsset, address to, uint256 tokenId)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[12]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "ProceedsRecipientFunded",
      eventSignature: "ProceedsRecipientFunded(address proceedsRecipient, uint256 amount)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[13]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "DistributionExecuted",
      eventSignature:
        "DistributionExecuted(uint256 distributionID, uint256 pageIndex, uint256 pageLength, (address[] " +
        "failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[14]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "DistributionByAddressesExecuted",
      eventSignature:
        "DistributionByAddressesExecuted(uint256 distributionID, address[] holders, (address[] failedAddresses, " +
        "address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[15]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "RedemptionExecuted",
      eventSignature:
        "RedemptionExecuted(uint256 pageIndex, uint256 pageLength, (address[] failedAddresses, address[] " +
        "succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
    expect(events[16]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractEvmAddress,
      eventName: "RedemptionByAddressesExecuted",
      eventSignature:
        "RedemptionByAddressesExecuted(address[] holders, (address[] failedAddresses, address[] succeededAddresses, " +
        "address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
  })
})
