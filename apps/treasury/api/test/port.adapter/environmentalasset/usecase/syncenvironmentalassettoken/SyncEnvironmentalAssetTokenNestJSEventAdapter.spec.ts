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
import { EnvironmentalAssetTokenPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTokenPersistence"
import { EnvironmentalAssetTokenAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTokenAddedEvent"
import { EnvironmentalAssetTokenRemovedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTokenRemovedEvent"
import { AddEnvironmentalAssetTransferNestJSEventAdapter } from "@port/environmentalasset/usecase/addenvironmentalassettransfer/AddEnvironmentalAssetTransferNestJSEventAdapter"

describe("SyncEnvironmentalAssetToken Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalEnvironmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  let internalEnvironmentalAssetTokenRepository: Repository<EnvironmentalAssetTokenPersistence>

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
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    internalEnvironmentalAssetRepository = app.get(getRepositoryToken(EnvironmentalAssetPersistence))
    internalEnvironmentalAssetTokenRepository = app.get(getRepositoryToken(EnvironmentalAssetTokenPersistence))

    // Mock the AddEnvironmentalAssetTransferNestJSEventAdapter handler to avoid interference
    const transferHandler = app.get(AddEnvironmentalAssetTransferNestJSEventAdapter)
    jest.spyOn(transferHandler, "handle").mockResolvedValue(undefined)
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEnvironmentalAssetTokenRepository.deleteAll()
    await internalEnvironmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
  })

  it("should add environmental asset token when INFLOW to treasury", async () => {
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
    const fromAccountId = "0.0.12345"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(fromAccountId)
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

    const tokens = await internalEnvironmentalAssetTokenRepository.find()
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatchObject({
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
      removalDate: null,
    })
    expect(tokens[0].id).toBeDefined()
    expect(tokens[0].createdAt).toBeInstanceOf(Date)
    expect(tokens[0].updatedAt).toBeInstanceOf(Date)

    expect(publishedEvent.constructor.name).toEqual(EnvironmentalAssetTokenAddedEvent.name)
    expect(publishedEvent).toEqual({
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
      timestamp: expect.any(Number),
    })
  })

  it("should remove environmental asset token when OUTFLOW from treasury", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const environmentalAsset = await internalEnvironmentalAssetRepository.save({
      contractId: "0.0.7777",
      treasuryId: treasury.id,
    })

    const existingToken = await internalEnvironmentalAssetTokenRepository.save({
      environmentalAssetId: environmentalAsset.id,
      tokenId: 4598,
    })

    let publishedEvent
    const toAccountId = "0.0.12345"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(treasury.contractId)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(toAccountId)
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

    // Verify soft delete worked: find() should return empty (soft deleted entities are excluded by default)
    const tokens = await internalEnvironmentalAssetTokenRepository.find()
    expect(tokens).toHaveLength(0)

    // Verify the token still exists in DB but with deletedAt set
    const tokenWithDeleted = await internalEnvironmentalAssetTokenRepository.findOne({
      where: { id: existingToken.id },
      withDeleted: true,
    })
    expect(tokenWithDeleted).toBeDefined()
    expect(tokenWithDeleted.id).toBe(existingToken.id)
    expect(tokenWithDeleted.deletedAt).toBeInstanceOf(Date)

    expect(publishedEvent.constructor.name).toEqual(EnvironmentalAssetTokenRemovedEvent.name)
    expect(publishedEvent).toEqual({
      environmentalAssetId: environmentalAsset.id,
      tokenId: event.tokenId,
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

    const tokens = await internalEnvironmentalAssetTokenRepository.find()
    expect(tokens).toHaveLength(0)
  })
})
