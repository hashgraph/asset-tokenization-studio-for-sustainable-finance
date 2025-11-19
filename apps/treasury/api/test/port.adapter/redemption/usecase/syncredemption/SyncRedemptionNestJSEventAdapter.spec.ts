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
import { PaymentResultItemEventModel } from "@port/shared/model/PaymentResultEventModel"
import { RedemptionExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/RedemptionExecutedDLTEvent"
import { RedemptionHolderRepository } from "@domain/redemption/repositories/RedemptionHolderRepository"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"
import { RedemptionHolderAddedEvent } from "@domain/redemption/event/RedemptionHolderAddedEvent"
import { RedemptionByAddressesExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/RedemptionByAddressesExecutedDLTEvent"
import { PaymentTokenNotConfiguredError } from "@domain/treasury/errors/PaymentTokenNotConfiguredError"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { RedemptionHolderPersistence } from "@port/persistence/redemption/model/RedemptionHolderPersistence"

describe("SyncRedemption Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalRedemptionHolderRepository: Repository<RedemptionHolderPersistence>

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
    internalRedemptionHolderRepository = app.get(getRepositoryToken(RedemptionHolderPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalRedemptionHolderRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
  })

  const createTreasuryWithPaymentToken = async (contractId: string) => {
    const treasury = await internalTreasuryRepository.save({
      contractId,
      bondContractId: "0.0.500",
      paused: false,
    })

    const paymentToken = await internalPaymentTokenRepository.save({
      contractId: "0.0.999",
      symbol: "USDC",
      decimals: 6,
      treasuryId: treasury.id,
    })

    treasury.paymentToken = paymentToken
    return await internalTreasuryRepository.save(treasury)
  }

  it("should create redemption holderson RedemptionExecutedDLTEvent event", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress1": "0.0.100",
        "0xevmAddress2": "0.0.101",
        "0xevmAddress3": "0.0.102",
        "0xevmAddress4": "0.0.200",
      }
      return addressMap[address] || address
    })

    const evmSuccessAddresses = ["0xevmAddress1", "0xevmAddress2", "0xevmAddress3"]
    const evmFailedAddresses = ["0xevmAddress4"]
    const paidAmounts = ["1000000", "2000000", "3000000"]

    const result: PaymentResultItemEventModel[] = [
      { holder: evmSuccessAddresses[0], status: 0, amount: paidAmounts[0] },
      { holder: evmSuccessAddresses[1], status: 0, amount: paidAmounts[1] },
      { holder: evmSuccessAddresses[2], status: 0, amount: paidAmounts[2] },
      { holder: evmFailedAddresses[0], status: 1, amount: "0" },
    ]

    const event = new RedemptionExecutedDLTEvent(treasury.contractId, "testTransactionHash", 0, 10, result)

    await eventBus.publishSync(event, RedemptionExecutedDLTEvent.name)

    const holders = await internalRedemptionHolderRepository.find()
    expect(holders).toHaveLength(4)

    const successHolders = holders.filter((h) => h.status === RedemptionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(3)
    expect(successHolders[0]).toMatchObject({
      holderAccountId: "0.0.100",
      status: RedemptionHolderStatus.SUCCESS,
      amount: paidAmounts[0],
      treasuryId: treasury.id,
      paymentTokenId: treasury.paymentToken!.id,
    })
    expect(successHolders[1]).toMatchObject({
      holderAccountId: "0.0.101",
      status: RedemptionHolderStatus.SUCCESS,
      amount: paidAmounts[1],
      treasuryId: treasury.id,
      paymentTokenId: treasury.paymentToken!.id,
    })
    expect(successHolders[2]).toMatchObject({
      holderAccountId: "0.0.102",
      status: RedemptionHolderStatus.SUCCESS,
      amount: paidAmounts[2],
      treasuryId: treasury.id,
      paymentTokenId: treasury.paymentToken!.id,
    })

    const failedHolders = holders.filter((h) => h.status === RedemptionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(1)
    expect(failedHolders[0]).toMatchObject({
      holderAccountId: "0.0.200",
      status: RedemptionHolderStatus.FAILED,
      amount: null,
      treasuryId: treasury.id,
      paymentTokenId: treasury.paymentToken!.id,
    })
    expect(publishedEvents).toHaveLength(4)
    expect(publishedEvents.every((e) => e.constructor.name === RedemptionHolderAddedEvent.name)).toBe(true)
  })

  it("should add redemption holders on RedemptionByAddressesExecuted event", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress5": "0.0.300",
        "0xevmAddress6": "0.0.301",
        "0xevmAddress7": "0.0.400",
        "0xevmAddress8": "0.0.401",
      }
      return addressMap[address] || address
    })

    const holders = ["0xevmAddress5", "0xevmAddress6", "0xevmAddress7", "0xevmAddress8"]
    const evmSuccessAddresses = ["0xevmAddress5", "0xevmAddress6"]
    const evmFailedAddresses = ["0xevmAddress7", "0xevmAddress8"]
    const paidAmounts = ["5000000", "6000000"]

    const result: PaymentResultItemEventModel[] = [
      { holder: evmSuccessAddresses[0], status: 0, amount: paidAmounts[0] },
      { holder: evmSuccessAddresses[1], status: 0, amount: paidAmounts[1] },
      { holder: evmFailedAddresses[0], status: 1, amount: "0" },
      { holder: evmFailedAddresses[1], status: 1, amount: "0" },
    ]

    const event = new RedemptionByAddressesExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash2",
      holders,
      result,
    )

    await eventBus.publishSync(event, RedemptionByAddressesExecutedDLTEvent.name)

    const savedHolders = await internalRedemptionHolderRepository.find()
    expect(savedHolders).toHaveLength(4)

    const successHolders = savedHolders.filter((h) => h.status === RedemptionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(2)

    const failedHolders = savedHolders.filter((h) => h.status === RedemptionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(2)
    failedHolders.forEach((holder) => expect(holder.amount).toBeNull())

    expect(publishedEvents).toHaveLength(4)
    expect(publishedEvents.every((e) => e.constructor.name === RedemptionHolderAddedEvent.name)).toBe(true)
  })

  // Caso de address zero eliminado: ya no aplican direcciones cero en eventos

  it("should handle redemption with only failed addresses", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress13": "0.0.200",
        "0xevmAddress14": "0.0.201",
        "0xevmAddress15": "0.0.202",
      }
      return addressMap[address] || address
    })

    const evmFailedAddresses = ["0xevmAddress13", "0xevmAddress14", "0xevmAddress15"]

    const result: PaymentResultItemEventModel[] = [
      { holder: evmFailedAddresses[0], status: 1, amount: "0" },
      { holder: evmFailedAddresses[1], status: 1, amount: "0" },
      { holder: evmFailedAddresses[2], status: 1, amount: "0" },
    ]

    const event = new RedemptionExecutedDLTEvent(treasury.contractId, "testTransactionHash5", 0, 10, result)

    await eventBus.publishSync(event, RedemptionExecutedDLTEvent.name)

    const holders = await internalRedemptionHolderRepository.find()
    expect(holders).toHaveLength(3)
    expect(holders.every((h) => h.status === RedemptionHolderStatus.FAILED)).toBe(true)
    expect(holders.every((h) => h.amount === null)).toBe(true)
  })

  it("should throw error if treasury does not have payment token", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.1111",
      bondContractId: "0.0.500",
      paused: false,
    })
    const expectedException = PaymentTokenNotConfiguredError.forTreasury(treasury.contractId)

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress13": "0.0.200",
        "0xevmAddress14": "0.0.201",
        "0xevmAddress15": "0.0.202",
      }
      return addressMap[address] || address
    })

    const evmFailedAddresses = ["0xevmAddress13", "0xevmAddress14", "0xevmAddress15"]

    const result: PaymentResultItemEventModel[] = [
      { holder: evmFailedAddresses[0], status: 1, amount: "0" },
      { holder: evmFailedAddresses[1], status: 1, amount: "0" },
      { holder: evmFailedAddresses[2], status: 1, amount: "0" },
    ]

    const event = new RedemptionExecutedDLTEvent(treasury.contractId, "testTransactionHash5", 0, 10, result)

    await expect(eventBus.publishSync(event, RedemptionExecutedDLTEvent.name)).rejects.toThrow(expectedException)
  })

  it("should throw error if treasury does not exist", async () => {
    const treasuryContractId = "0.0.2222"
    const expectedException = TreasuryNotFoundError.contractIdError(treasuryContractId)

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress13": "0.0.200",
        "0xevmAddress14": "0.0.201",
        "0xevmAddress15": "0.0.202",
      }
      return addressMap[address] || address
    })

    const evmFailedAddresses = ["0xevmAddress13", "0xevmAddress14", "0xevmAddress15"]

    const result: PaymentResultItemEventModel[] = [
      { holder: evmFailedAddresses[0], status: 1, amount: "0" },
      { holder: evmFailedAddresses[1], status: 1, amount: "0" },
      { holder: evmFailedAddresses[2], status: 1, amount: "0" },
    ]

    const event = new RedemptionExecutedDLTEvent(treasuryContractId, "testTransactionHash5", 0, 10, result)

    await expect(eventBus.publishSync(event, RedemptionExecutedDLTEvent.name)).rejects.toThrow(expectedException)
  })
})
