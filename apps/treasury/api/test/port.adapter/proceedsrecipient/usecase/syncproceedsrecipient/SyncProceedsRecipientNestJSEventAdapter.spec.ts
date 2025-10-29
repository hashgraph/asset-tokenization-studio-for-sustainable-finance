// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ProceedsRecipientFundedDLTEvent } from "@port/proceedsrecipient/usecase/syncproceedsrecipient/model/ProceedsRecipientFundedDLTEvent"
import { ProceedsRecipientPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientPersistence"
import { ProceedsRecipientAllocationPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientAllocationPersistence"
import { ProceedsRecipientCreatedEvent } from "@domain/proceedsrecipient/event/ProceedsRecipientCreatedEvent"
import { ProceedsRecipientAllocationAddedEvent } from "@domain/proceedsrecipient/event/ProceedsRecipientAllocationAddedEvent"

describe("SyncProceedsRecipient Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalProceedsRecipientRepository: Repository<ProceedsRecipientPersistence>
  let internalProceedsRecipientAllocationRepository: Repository<ProceedsRecipientAllocationPersistence>

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
    internalProceedsRecipientRepository = app.get(getRepositoryToken(ProceedsRecipientPersistence))
    internalProceedsRecipientAllocationRepository = app.get(getRepositoryToken(ProceedsRecipientAllocationPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalProceedsRecipientAllocationRepository.deleteAll()
    await internalProceedsRecipientRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
  })

  it("should create proceeds recipient and add allocation on first funding", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.333",
      treasuryId: treasury.id,
      decimals: 8,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    const publishedEvents: any[] = []
    const proceedsRecipientContractId = "0.0.12345"
    const amount = "1000000"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(proceedsRecipientContractId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    const event = new ProceedsRecipientFundedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      amount,
    )

    await eventBus.publishSync(event, ProceedsRecipientFundedDLTEvent.name)

    const proceedsRecipients = await internalProceedsRecipientRepository.find()
    expect(proceedsRecipients).toHaveLength(1)
    expect(proceedsRecipients[0]).toEqual({
      id: expect.any(String),
      contractId: proceedsRecipientContractId,
      treasuryId: treasury.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    const allocations = await internalProceedsRecipientAllocationRepository.find()
    expect(allocations).toHaveLength(1)
    expect(allocations[0]).toEqual({
      id: expect.any(String),
      proceedsRecipientId: proceedsRecipients[0].id,
      paymentTokenId: paymentToken.id,
      amount: amount,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvents).toHaveLength(2)
    expect(publishedEvents[0].constructor.name).toEqual(ProceedsRecipientCreatedEvent.name)
    expect(publishedEvents[0]).toEqual({
      proceedsRecipientId: proceedsRecipients[0].id,
      contractId: proceedsRecipientContractId,
      treasuryId: treasury.id,
      timestamp: expect.any(Number),
    })
    expect(publishedEvents[1].constructor.name).toEqual(ProceedsRecipientAllocationAddedEvent.name)
    expect(publishedEvents[1]).toEqual({
      proceedsRecipientId: proceedsRecipients[0].id,
      paymentTokenId: paymentToken.id,
      amount: amount,
      timestamp: expect.any(Number),
    })
  })

  it("should add allocation to existing proceeds recipient on subsequent funding", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.333",
      treasuryId: treasury.id,
      decimals: 8,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    const proceedsRecipientContractId = "0.0.12345"
    const existingProceedsRecipient = await internalProceedsRecipientRepository.save({
      contractId: proceedsRecipientContractId,
      treasuryId: treasury.id,
    })

    await internalProceedsRecipientAllocationRepository.save({
      proceedsRecipientId: existingProceedsRecipient.id,
      paymentTokenId: paymentToken.id,
      amount: "500000",
    })

    const publishedEvents: any[] = []
    const amount = "750000"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(proceedsRecipientContractId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    const event = new ProceedsRecipientFundedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      amount,
    )

    await eventBus.publishSync(event, ProceedsRecipientFundedDLTEvent.name)

    const proceedsRecipients = await internalProceedsRecipientRepository.find()
    expect(proceedsRecipients).toHaveLength(1)
    expect(proceedsRecipients[0].id).toEqual(existingProceedsRecipient.id)

    const allocations = await internalProceedsRecipientAllocationRepository.find()
    expect(allocations).toHaveLength(2)
    expect(allocations[1]).toEqual({
      id: expect.any(String),
      proceedsRecipientId: existingProceedsRecipient.id,
      paymentTokenId: paymentToken.id,
      amount: amount,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvents).toHaveLength(1)
    expect(publishedEvents[0].constructor.name).toEqual(ProceedsRecipientAllocationAddedEvent.name)
    expect(publishedEvents[0]).toEqual({
      proceedsRecipientId: existingProceedsRecipient.id,
      paymentTokenId: paymentToken.id,
      amount: amount,
      timestamp: expect.any(Number),
    })
  })

  it("should handle multiple allocations for the same proceeds recipient", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.333",
      treasuryId: treasury.id,
      decimals: 8,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    const proceedsRecipientContractId = "0.0.12345"
    const amounts = ["100000", "200000", "300000"]

    for (const amount of amounts) {
      jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(proceedsRecipientContractId)

      const event = new ProceedsRecipientFundedDLTEvent(
        treasury.contractId,
        `testTransactionHash-${amount}`,
        "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
        amount,
      )

      await eventBus.publishSync(event, ProceedsRecipientFundedDLTEvent.name)
    }

    const proceedsRecipients = await internalProceedsRecipientRepository.find()
    expect(proceedsRecipients).toHaveLength(1)

    const allocations = await internalProceedsRecipientAllocationRepository.find()
    expect(allocations).toHaveLength(3)
    expect(allocations.map((a) => a.amount)).toEqual(amounts)
    expect(allocations.every((a) => a.proceedsRecipientId === proceedsRecipients[0].id)).toBe(true)
  })

  it("should handle different proceeds recipients for the same treasury", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.333",
      treasuryId: treasury.id,
      decimals: 8,
    })

    treasury.paymentToken = paymentToken
    await internalTreasuryRepository.save(treasury)

    const recipient1 = "0.0.11111"
    const recipient2 = "0.0.22222"

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipient1)
    const event1 = new ProceedsRecipientFundedDLTEvent(
      treasury.contractId,
      "testTransactionHash1",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "100000",
    )
    await eventBus.publishSync(event1, ProceedsRecipientFundedDLTEvent.name)

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(recipient2)
    const event2 = new ProceedsRecipientFundedDLTEvent(
      treasury.contractId,
      "testTransactionHash2",
      "0x14F0A3F22efec3057d684781DC36094433299DE6",
      "200000",
    )
    await eventBus.publishSync(event2, ProceedsRecipientFundedDLTEvent.name)

    const proceedsRecipients = await internalProceedsRecipientRepository.find()
    expect(proceedsRecipients).toHaveLength(2)
    expect(proceedsRecipients.map((pr) => pr.contractId).sort()).toEqual([recipient1, recipient2].sort())

    const allocations = await internalProceedsRecipientAllocationRepository.find()
    expect(allocations).toHaveLength(2)
  })
})
