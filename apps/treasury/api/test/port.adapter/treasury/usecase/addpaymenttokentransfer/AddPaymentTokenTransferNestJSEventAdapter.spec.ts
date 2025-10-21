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
import { PaymentTokenTransferredDLTEvent } from "@port/treasury/usecase/addpaymenttokentransfer/model/PaymentTokenTransferredDLTEvent"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { PaymentTokenTransferPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenTransferPersistence"
import { PaymentTokenTransferAddedEvent } from "@domain/treasury/event/PaymentTokenTransferAddedEvent"
import { TransferType } from "@domain/shared/model/TransferType"

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
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
    await internalPaymentTokenTransferRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
  })

  it("should create payment token transfer with correct data", async () => {
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
    const recipientAccountId = "0.0.999"
    const amount = BigInt(1000000)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipientAccountId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new PaymentTokenTransferredDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      amount,
    )
    await eventBus.publishSync(event, PaymentTokenTransferredDLTEvent.name)

    // Verify transfer was created
    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(1)
    expect(transfers[0].accountId).toBe(recipientAccountId)
    expect(transfers[0].amount).toBe(amount.toString())
    expect(transfers[0].paymentTokenId).toBe(paymentToken.id)
    expect(transfers[0].type).toBe(TransferType.OUTFLOW)

    // Verify event was published
    expect(publishedEvent.constructor.name).toEqual(PaymentTokenTransferAddedEvent.name)
    expect(publishedEvent).toEqual({
      treasuryContractId: treasury.contractId,
      recipientAccountId: recipientAccountId,
      amount: amount.toString(),
      transferId: transfers[0].id,
      timestamp: expect.any(Number),
    })
  })

  it("should create multiple transfers for the same treasury", async () => {
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

    const recipient1 = "0.0.888"
    const recipient2 = "0.0.999"
    const amount1 = BigInt(500000)
    const amount2 = BigInt(750000)

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipient1)

    const event1 = new PaymentTokenTransferredDLTEvent(
      treasury.contractId,
      "testTransactionHash1",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      amount1,
    )
    await eventBus.publishSync(event1, PaymentTokenTransferredDLTEvent.name)

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipient2)

    const event2 = new PaymentTokenTransferredDLTEvent(
      treasury.contractId,
      "testTransactionHash2",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
      amount2,
    )
    await eventBus.publishSync(event2, PaymentTokenTransferredDLTEvent.name)

    // Verify both transfers were created
    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(2)

    const transfer1 = transfers.find((t) => t.accountId === recipient1)
    expect(transfer1).toBeDefined()
    expect(transfer1.amount).toBe(amount1.toString())
    expect(transfer1.type).toBe(TransferType.OUTFLOW)

    const transfer2 = transfers.find((t) => t.accountId === recipient2)
    expect(transfer2).toBeDefined()
    expect(transfer2.amount).toBe(amount2.toString())
    expect(transfer2.type).toBe(TransferType.OUTFLOW)
  })

  it("should throw error if treasury does not exist", async () => {
    const nonExistentTreasuryContractId = "0.0.999"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce("0.0.888")

    const event = new PaymentTokenTransferredDLTEvent(
      nonExistentTreasuryContractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      BigInt(1000000),
    )

    await expect(eventBus.publishSync(event, PaymentTokenTransferredDLTEvent.name)).rejects.toThrow(
      /Treasury not found/,
    )

    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(0)
  })

  it("should throw error if treasury does not have payment token configured", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce("0.0.888")

    const event = new PaymentTokenTransferredDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      BigInt(1000000),
    )

    await expect(eventBus.publishSync(event, PaymentTokenTransferredDLTEvent.name)).rejects.toThrow(
      /does not have a payment token configured/,
    )

    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(0)
  })

  it("should handle large amounts correctly", async () => {
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
    const largeAmount = BigInt("999999999999999999")
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipientAccountId)

    const event = new PaymentTokenTransferredDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      largeAmount,
    )
    await eventBus.publishSync(event, PaymentTokenTransferredDLTEvent.name)

    const transfers = await internalPaymentTokenTransferRepository.find()
    expect(transfers).toHaveLength(1)
    expect(transfers[0].amount).toBe(largeAmount.toString())
  })
})
