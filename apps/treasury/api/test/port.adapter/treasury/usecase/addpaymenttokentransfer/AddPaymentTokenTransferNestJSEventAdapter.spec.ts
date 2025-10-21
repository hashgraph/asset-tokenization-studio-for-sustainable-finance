// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TransferDLTEvent } from "@port/shared/model/TransferDLTEvent"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { PaymentTokenTransferPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenTransferPersistence"
import { PaymentTokenTransferAddedEvent } from "@domain/treasury/event/PaymentTokenTransferAddedEvent"
import { TransferType } from "@domain/shared/model/TransferType"
import { AddEnvironmentalAssetTransferNestJSEventAdapter } from "@port/environmentalasset/usecase/addenvironmentalassettransfer/AddEnvironmentalAssetTransferNestJSEventAdapter"
import { SyncEnvironmentalAssetTokenNestJSEventAdapter } from "@port/environmentalasset/usecase/syncenvironmentalassettoken/SyncEnvironmentalAssetTokenNestJSEventAdapter"

describe("AddPaymentTokenTransfer Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalPaymentTokenTransferRepository: Repository<PaymentTokenTransferPersistence>

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
    internalPaymentTokenRepository = app.get(getRepositoryToken(PaymentTokenPersistence))
    internalPaymentTokenTransferRepository = app.get(getRepositoryToken(PaymentTokenTransferPersistence))

    // Mock other handlers that also listen to TransferDLTEvent to avoid interference
    const addEnvironmentalAssetTransferHandler = app.get(AddEnvironmentalAssetTransferNestJSEventAdapter)
    jest.spyOn(addEnvironmentalAssetTransferHandler, "handle").mockResolvedValue(undefined)

    const syncEnvironmentalAssetTokenHandler = app.get(SyncEnvironmentalAssetTokenNestJSEventAdapter)
    jest.spyOn(syncEnvironmentalAssetTokenHandler, "handle").mockResolvedValue(undefined)
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
    await internalPaymentTokenTransferRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
  })

  it("should add INFLOW payment token transfer", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.111",
      treasuryId: treasury.id,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    let publishedEvent
    const transferAccountId = "0.0.999"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(transferAccountId)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(treasury.contractId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new TransferDLTEvent(
      paymentToken.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
      "1000000",
    )
    await eventBus.publishSync(event, TransferDLTEvent.name)

    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(1)
    expect(transfers[0]).toEqual({
      id: expect.any(String),
      accountId: transferAccountId,
      paymentTokenId: paymentToken.id,
      amount: event.value,
      type: TransferType.INFLOW,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent.constructor.name).toEqual(PaymentTokenTransferAddedEvent.name)
    expect(publishedEvent).toEqual({
      paymentTokenId: paymentToken.id,
      accountId: transferAccountId,
      amount: event.value,
      type: TransferType.INFLOW,
      timestamp: expect.any(Number),
    })
  })

  it("should not add transfer if treasury does not receive tokens", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.111",
      treasuryId: treasury.id,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    const recipientAccountId = "0.0.999"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(treasury.contractId)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipientAccountId)

    // Treasury is sending, not receiving
    const event = new TransferDLTEvent(
      paymentToken.contractId,
      "testTransactionHash",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "1000000",
    )
    await eventBus.publishSync(event, TransferDLTEvent.name)

    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(0)
  })

  it("should not add transfer if payment token does not belong to treasury", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.111",
      treasuryId: treasury.id,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    const transferAccountId = "0.0.999"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(transferAccountId)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(treasury.contractId)

    // Different payment token
    const event = new TransferDLTEvent(
      "0.0.333",
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
      "1000000",
    )
    await eventBus.publishSync(event, TransferDLTEvent.name)

    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(0)
  })
})
