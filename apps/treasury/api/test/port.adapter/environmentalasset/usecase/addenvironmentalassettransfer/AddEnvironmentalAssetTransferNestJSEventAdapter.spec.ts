// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TransferDLTEvent } from "@port/shared/model/TransferDLTEvent"
import { EnvironmentalAssetTransferPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTransferPersistence"
import { EnvironmentalAssetTransferAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTransferAddedEvent"
import { TransferType } from "@domain/shared/model/TransferType"
import { SyncEnvironmentalAssetTokenNestJSEventAdapter } from "@port/environmentalasset/usecase/syncenvironmentalassettoken/SyncEnvironmentalAssetTokenNestJSEventAdapter"
import { AddPaymentTokenTransferNestJSEventAdapter } from "@port/treasury/usecase/addpaymenttokentransfer/AddPaymentTokenTransferNestJSEventAdapter"

describe("AddEnvironmentalAssetTransfer Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalEnvironmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  let internalEnvironmentalAssetTransferRepository: Repository<EnvironmentalAssetTransferPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    internalEnvironmentalAssetRepository = app.get(getRepositoryToken(EnvironmentalAssetPersistence))
    internalEnvironmentalAssetTransferRepository = app.get(getRepositoryToken(EnvironmentalAssetTransferPersistence))

    // Mock all other handlers listening to TransferDLTEvent to avoid interference
    const syncHandler = app.get(SyncEnvironmentalAssetTokenNestJSEventAdapter)
    jest.spyOn(syncHandler, "handle").mockResolvedValue(undefined)

    const paymentTokenTransferHandler = app.get(AddPaymentTokenTransferNestJSEventAdapter)
    jest.spyOn(paymentTokenTransferHandler, "handle").mockResolvedValue(undefined)
  })
  afterEach(async () => {
    await internalEnvironmentalAssetTransferRepository.deleteAll()
    await internalEnvironmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
  })

  it("should add INFLOW environmental asset transfer", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const environmentalAsset = await internalEnvironmentalAssetRepository.save({
      contractId: "0.0.7777",
      treasuryId: treasury.id,
    })

    let publishedEvent
    const transferAccountId = "0.0.12345"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(transferAccountId)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(treasury.contractId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    const event = new TransferDLTEvent(
      environmentalAsset.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22efec3057d684781DC36094433299DE6",
      undefined,
      4598,
    )
    await eventBus.publishSync(event, TransferDLTEvent.name)

    const transfers = await internalEnvironmentalAssetTransferRepository.find()
    expect(transfers).toHaveLength(1)
    expect(transfers[0]).toEqual({
      id: expect.any(String),
      accountId: transferAccountId,
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
      type: TransferType.INFLOW,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent.constructor.name).toEqual(EnvironmentalAssetTransferAddedEvent.name)
    expect(publishedEvent).toEqual({
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
      accountId: transferAccountId,
      type: <string>TransferType.INFLOW,
      timestamp: expect.any(Number),
    })
  })

  it("should add OUTFLOW environmental asset transfer", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const environmentalAsset = await internalEnvironmentalAssetRepository.save({
      contractId: "0.0.7777",
      treasuryId: treasury.id,
    })

    let publishedEvent
    const transferAccountId = "0.0.12345"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(treasury.contractId)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(transferAccountId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    const event = new TransferDLTEvent(
      environmentalAsset.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22efec3057d684781DC36094433299DE6",
      undefined,
      4598,
    )
    await eventBus.publishSync(event, TransferDLTEvent.name)

    const transfers = await internalEnvironmentalAssetTransferRepository.find()
    expect(transfers).toHaveLength(1)
    expect(transfers[0]).toEqual({
      id: expect.any(String),
      accountId: transferAccountId,
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
      type: TransferType.OUTFLOW,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent.constructor.name).toEqual(EnvironmentalAssetTransferAddedEvent.name)
    expect(publishedEvent).toEqual({
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
      accountId: transferAccountId,
      type: <string>TransferType.OUTFLOW,
      timestamp: expect.any(Number),
    })
  })

  it("should do nothing if the event is not related to any environmental asset and treasury", async () => {
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce("0.0.12345")
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce("0.0.67890")
    const event = new TransferDLTEvent(
      "0.0.0223344",
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22efec3057d684781DC36094433299DE6",
      undefined,
      4598,
    )
    await eventBus.publishSync(event, TransferDLTEvent.name)

    const transfers = await internalEnvironmentalAssetTransferRepository.find()
    expect(transfers).toHaveLength(0)
  })
})
