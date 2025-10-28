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
import { PaymentTokenUpdatedDLTEvent } from "@port/treasury/usecase/updatepaymenttoken/model/PaymentTokenUpdatedDLTEvent"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { PaymentTokenUpdatedEvent } from "@domain/treasury/event/PaymentTokenUpdatedEvent"

describe("UpdatePaymentToken Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const mockHederaPort = {
      getTokenBalance: jest.fn().mockResolvedValue("0"),
      getTokenDecimals: jest.fn().mockResolvedValue(8),
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [
        ...PROVIDERS.filter((provider) => !(typeof provider === "object" && provider.provide === "HederaPort")),
        {
          provide: "HederaPort",
          useValue: mockHederaPort,
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    internalPaymentTokenRepository = app.get(getRepositoryToken(PaymentTokenPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
  })

  it("should update payment token and mark old one with removal date", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const oldPaymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.111",
      treasuryId: treasury.id,
      decimals: 8,
    })

    treasury.paymentToken = oldPaymentToken
    await internalTreasuryRepository.save(treasury)

    let publishedEvent
    const newPaymentTokenContractId = "0.0.333"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(newPaymentTokenContractId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new PaymentTokenUpdatedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
    )
    await eventBus.publishSync(event, PaymentTokenUpdatedDLTEvent.name)

    // Verify old payment token has removal date
    const oldToken = await internalPaymentTokenRepository.findOne({ where: { id: oldPaymentToken.id } })
    expect(oldToken).toBeDefined()
    expect(oldToken.removalDate).toBeInstanceOf(Date)

    // Verify new payment token was created
    const tokens = await internalPaymentTokenRepository.find()
    expect(tokens).toHaveLength(2)
    const newToken = tokens.find((t) => t.contractId === newPaymentTokenContractId)
    expect(newToken).toBeDefined()
    expect(newToken.treasuryId).toBe(treasury.id)
    expect(newToken.removalDate).toBeNull()

    // Verify treasury was updated with new payment token
    const updatedTreasury = await internalTreasuryRepository.findOne({
      where: { id: treasury.id },
      relations: ["paymentToken"],
    })
    expect(updatedTreasury.paymentToken.id).toBe(newToken.id)
    expect(updatedTreasury.paymentToken.contractId).toBe(newPaymentTokenContractId)

    expect(publishedEvent.constructor.name).toEqual(PaymentTokenUpdatedEvent.name)
    expect(publishedEvent).toEqual({
      treasuryContractId: treasury.contractId,
      bondContractId: treasury.bondContractId,
      paymentTokenContractId: newPaymentTokenContractId,
      timestamp: expect.any(Number),
    })
  })

  it("should update payment token when treasury has no previous payment token", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    let publishedEvent
    const newPaymentTokenContractId = "0.0.333"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(newPaymentTokenContractId)
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new PaymentTokenUpdatedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
    )
    await eventBus.publishSync(event, PaymentTokenUpdatedDLTEvent.name)

    // Verify new payment token was created
    const tokens = await internalPaymentTokenRepository.find()
    expect(tokens).toHaveLength(1)
    expect(tokens[0].contractId).toBe(newPaymentTokenContractId)
    expect(tokens[0].treasuryId).toBe(treasury.id)
    expect(tokens[0].removalDate).toBeNull()

    // Verify treasury was updated with new payment token
    const updatedTreasury = await internalTreasuryRepository.findOne({
      where: { id: treasury.id },
      relations: ["paymentToken"],
    })
    expect(updatedTreasury).toBeDefined()
    expect(updatedTreasury!.paymentToken).toBeDefined()
    expect(updatedTreasury!.paymentToken.id).toBe(tokens[0].id)
    expect(updatedTreasury!.paymentToken.contractId).toBe(newPaymentTokenContractId)

    expect(publishedEvent.constructor.name).toEqual(PaymentTokenUpdatedEvent.name)
    expect(publishedEvent).toEqual({
      treasuryContractId: treasury.contractId,
      bondContractId: treasury.bondContractId,
      paymentTokenContractId: newPaymentTokenContractId,
      timestamp: expect.any(Number),
    })
  })

  it("should throw error if treasury does not exist", async () => {
    const nonExistentTreasuryContractId = "0.0.999"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce("0.0.333")

    const event = new PaymentTokenUpdatedDLTEvent(
      nonExistentTreasuryContractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22ef1c3057d684781DC36094433299DE6",
    )

    await expect(eventBus.publishSync(event, PaymentTokenUpdatedDLTEvent.name)).rejects.toThrow()

    const tokens = await internalPaymentTokenRepository.find()
    expect(tokens).toHaveLength(0)
  })

  it("should rollback all changes if transaction fails", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const oldPaymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.111",
      treasuryId: treasury.id,
      decimals: 8,
    })

    treasury.paymentToken = oldPaymentToken
    await internalTreasuryRepository.save(treasury)

    const newPaymentTokenContractId = "0.0.333"
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(newPaymentTokenContractId)

    // Get the domain service to mock its repository
    const paymentTokenRepository = app.get("PaymentTokenRepository")

    // Mock to fail on the first save (old token with removalDate)
    jest.spyOn(paymentTokenRepository, "save").mockRejectedValueOnce(new Error("Database error simulated"))

    const event = new PaymentTokenUpdatedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
      "0x14F0A3F22efec3057d684781DC36094433299DE6",
    )

    // The transaction should fail
    await expect(eventBus.publishSync(event, PaymentTokenUpdatedDLTEvent.name)).rejects.toThrow()

    // Verify rollback: old payment token should NOT have removalDate set
    const oldTokenAfterRollback = await internalPaymentTokenRepository.findOne({ where: { id: oldPaymentToken.id } })
    expect(oldTokenAfterRollback).toBeDefined()
    expect(oldTokenAfterRollback!.removalDate).toBeNull() // Rolled back!

    // Verify rollback: no new payment token should exist
    const tokens = await internalPaymentTokenRepository.find()
    expect(tokens).toHaveLength(1) // Only the original old token
    expect(tokens[0].contractId).toBe("0.0.111")

    // Verify rollback: treasury should still reference the old payment token
    const treasuryAfterRollback = await internalTreasuryRepository.findOne({
      where: { id: treasury.id },
      relations: ["paymentToken"],
    })
    expect(treasuryAfterRollback).toBeDefined()
    expect(treasuryAfterRollback!.paymentToken).toBeDefined()
    expect(treasuryAfterRollback!.paymentToken.id).toBe(oldPaymentToken.id)
    expect(treasuryAfterRollback!.paymentToken.contractId).toBe("0.0.111")
  })
})
