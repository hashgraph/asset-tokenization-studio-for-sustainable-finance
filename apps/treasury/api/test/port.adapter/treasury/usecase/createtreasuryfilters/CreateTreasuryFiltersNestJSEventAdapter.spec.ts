// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
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
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalEventFilterRepository = app.get(getRepositoryToken(EventFilterPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEventFilterRepository.deleteAll()
  })

  it("should add Treasury events to events filters", async () => {
    const treasuryContractId = "0.0.111"

    const event = new TreasuryCreatedEvent(
      treasuryContractId
    )
    await eventBus.publishSync(event, TreasuryCreatedEvent.name)

    const events = await internalEventFilterRepository.find()
    expect(events).toHaveLength(17)
    expect(transfers[0]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "RoleGranted",
      eventSignature: "RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[1]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "RoleRevoked",
      eventSignature: "RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[2]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "RoleRenounced",
      eventSignature: "RoleRenounced(address indexed account, bytes32 indexed role)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[3]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "RolesApplied",
      eventSignature: "RolesApplied(bytes32[] roles, bool[] actives, address account)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[4]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "TokenPaused",
      eventSignature: "TokenPaused(address indexed operator)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[5]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "TokenUnpaused",
      eventSignature: "TokenUnpaused(address indexed operator)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[6]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "EnvironmentalAssetAdded",
      eventSignature: "EnvironmentalAssetAdded(address indexed operator, address environmentalAsset)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[7]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "EnvironmentalAssetRemoved",
      eventSignature: "EnvironmentalAssetRemoved(address indexed operator, address environmentalAsset, int256 dissociationError)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[8]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "PaymentTokenUpdated",
      eventSignature: "PaymentTokenUpdated(address indexed operator, address newPaymentToken, address oldPaymentToken, int256 dissociationError)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[9]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "TokenDissociated",
      eventSignature: "TokenDissociated(address token)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[10]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "PaymentTokenTransferred",
      eventSignature: "PaymentTokenTransferred(address to, uint256 amount)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[11]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "EnvironmentalAssetTokenTransferred",
      eventSignature: "EnvironmentalAssetTokenTransferred(address environmentalAsset, address to, uint256 tokenId)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[12]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "ProceedsRecipientFunded",
      eventSignature: "ProceedsRecipientFunded(address proceedsRecipient, uint256 amount)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[13]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "DistributionExecuted",
      eventSignature: "DistributionExecuted(uint256 distributionID, uint256 pageIndex, uint256 pageLength, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[14]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "DistributionByAddressesExecuted",
      eventSignature: "DistributionByAddressesExecuted(uint256 distributionID, address[] holders, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[15]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "RedemptionExecuted",
      eventSignature: "RedemptionExecuted(uint256 pageIndex, uint256 pageLength, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(transfers[16]).toEqual({
      id: expect.any(String),
      contractAddress: treasuryContractId,
      eventName: "RedemptionByAddressesExecuted",
      eventSignature: "RedemptionByAddressesExecuted(address[] holders, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })
})
