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
import { DistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionExecutedDLTEvent"
import { DistributionByAddressesExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionByAddressesExecutedDLTEvent"
import { DistributionPersistence } from "@port/persistence/distribution/model/DistributionPersistence"
import { DistributionHolderPersistence } from "@port/persistence/distribution/model/DistributionHolderPersistence"
import { DistributionCreatedEvent } from "@domain/distribution/event/DistributionCreatedEvent"
import { DistributionHolderAddedEvent } from "@domain/distribution/event/DistributionHolderAddedEvent"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"
import { PaymentResult } from "@port/distribution/usecase/syncdistribution/model/BaseDistributionExecutedDLTEvent"

describe("SyncDistribution Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalDistributionHolderRepository: Repository<DistributionHolderPersistence>

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
    internalDistributionRepository = app.get(getRepositoryToken(DistributionPersistence))
    internalDistributionHolderRepository = app.get(getRepositoryToken(DistributionHolderPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalDistributionHolderRepository.deleteAll()
    await internalDistributionRepository.deleteAll()
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

  it("should create distribution and add successful holders on DistributionExecuted event", async () => {
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

    const distributionId = 1
    const evmSuccessAddresses = ["0xevmAddress1", "0xevmAddress2", "0xevmAddress3"]
    const evmFailedAddresses = ["0xevmAddress4"]
    const paidAmounts = ["1000000", "2000000", "3000000"]

    const result: PaymentResult = {
      succeededAddresses: evmSuccessAddresses,
      failedAddresses: evmFailedAddresses,
      alreadyPaidAddresses: [],
      paidAmounts,
    }

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      distributionId,
      0,
      10,
      result,
    )

    await eventBus.publishSync(event, DistributionExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(1)
    expect(distributions[0]).toEqual({
      id: distributionId,
      treasuryId: treasury.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(4)

    const successHolders = holders.filter((h) => h.status === DistributionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(3)
    expect(successHolders[0]).toMatchObject({
      holderAccountId: "0.0.100",
      status: DistributionHolderStatus.SUCCESS,
      amount: paidAmounts[0],
      distributionId,
    })
    expect(successHolders[1]).toMatchObject({
      holderAccountId: "0.0.101",
      status: DistributionHolderStatus.SUCCESS,
      amount: paidAmounts[1],
      distributionId,
    })
    expect(successHolders[2]).toMatchObject({
      holderAccountId: "0.0.102",
      status: DistributionHolderStatus.SUCCESS,
      amount: paidAmounts[2],
      distributionId,
    })

    const failedHolders = holders.filter((h) => h.status === DistributionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(1)
    expect(failedHolders[0]).toMatchObject({
      holderAccountId: "0.0.200",
      status: DistributionHolderStatus.FAILED,
      distributionId,
    })
    expect(failedHolders[0].amount).toBeNull()

    expect(publishedEvents).toHaveLength(5)
    expect(publishedEvents[0].constructor.name).toEqual(DistributionCreatedEvent.name)
    expect(publishedEvents.slice(1).every((e) => e.constructor.name === DistributionHolderAddedEvent.name)).toBe(true)
  })

  it("should create distribution and add holders on DistributionByAddressesExecuted event", async () => {
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

    const distributionId = 2
    const holders = ["0xevmAddress5", "0xevmAddress6", "0xevmAddress7", "0xevmAddress8"]
    const evmSuccessAddresses = ["0xevmAddress5", "0xevmAddress6"]
    const evmFailedAddresses = ["0xevmAddress7", "0xevmAddress8"]
    const paidAmounts = ["5000000", "6000000"]

    const result: PaymentResult = {
      succeededAddresses: evmSuccessAddresses,
      failedAddresses: evmFailedAddresses,
      alreadyPaidAddresses: [],
      paidAmounts,
    }

    const event = new DistributionByAddressesExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash2",
      distributionId,
      holders,
      result,
    )

    await eventBus.publishSync(event, DistributionByAddressesExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(1)
    expect(distributions[0].id).toEqual(distributionId)

    const savedHolders = await internalDistributionHolderRepository.find()
    expect(savedHolders).toHaveLength(4)

    const successHolders = savedHolders.filter((h) => h.status === DistributionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(2)

    const failedHolders = savedHolders.filter((h) => h.status === DistributionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(2)
    failedHolders.forEach((holder) => expect(holder.amount).toBeNull())

    expect(publishedEvents).toHaveLength(5)
    expect(publishedEvents[0].constructor.name).toEqual(DistributionCreatedEvent.name)
  })

  it("should add holders to existing distribution", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    const distributionId = 3
    await internalDistributionRepository.save({
      id: distributionId,
      treasuryId: treasury.id,
    })

    const paymentToken = await internalPaymentTokenRepository.findOne({ where: { treasuryId: treasury.id } })

    await internalDistributionHolderRepository.save({
      holderAccountId: "0.0.100",
      status: DistributionHolderStatus.SUCCESS,
      amount: "1000000",
      distributionId: distributionId,
      paymentTokenId: paymentToken!.id,
    })

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress9": "0.0.101",
      }
      return addressMap[address] || address
    })

    const evmSuccessAddresses = ["0xevmAddress9"]
    const evmFailedAddresses: string[] = []
    const paidAmounts = ["2000000"]

    const result: PaymentResult = {
      succeededAddresses: evmSuccessAddresses,
      failedAddresses: evmFailedAddresses,
      alreadyPaidAddresses: [],
      paidAmounts,
    }

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash3",
      distributionId,
      0,
      10,
      result,
    )

    await eventBus.publishSync(event, DistributionExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(1)

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(2)

    expect(publishedEvents).toHaveLength(1)
    expect(publishedEvents[0].constructor.name).toEqual(DistributionHolderAddedEvent.name)
  })

  it("should filter out zero addresses from success and failed addresses", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress10": "0.0.100",
        "0xevmAddress11": "0.0.101",
        "0xevmAddress12": "0.0.200",
      }
      return addressMap[address] || address
    })

    const distributionId = 4
    const evmSuccessAddresses = ["0xevmAddress10", "0x0000000000000000000000000000000000000000", "0xevmAddress11"]
    const evmFailedAddresses = ["0x0000000000000000000000000000000000000000", "0xevmAddress12"]
    const paidAmounts = ["1000000", "0", "2000000"]

    const result: PaymentResult = {
      succeededAddresses: evmSuccessAddresses,
      failedAddresses: evmFailedAddresses,
      alreadyPaidAddresses: [],
      paidAmounts,
    }

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash4",
      distributionId,
      0,
      10,
      result,
    )

    await eventBus.publishSync(event, DistributionExecutedDLTEvent.name)

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(3)

    const successHolders = holders.filter((h) => h.status === DistributionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(2)
    expect(successHolders.map((h) => h.holderAccountId)).toEqual(["0.0.100", "0.0.101"])

    const failedHolders = holders.filter((h) => h.status === DistributionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(1)
    expect(failedHolders[0].holderAccountId).toEqual("0.0.200")
  })

  it("should handle distribution with only failed addresses", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress13": "0.0.200",
        "0xevmAddress14": "0.0.201",
        "0xevmAddress15": "0.0.202",
      }
      return addressMap[address] || address
    })

    const distributionId = 5
    const evmSuccessAddresses: string[] = []
    const evmFailedAddresses = ["0xevmAddress13", "0xevmAddress14", "0xevmAddress15"]
    const paidAmounts: string[] = []

    const result: PaymentResult = {
      succeededAddresses: evmSuccessAddresses,
      failedAddresses: evmFailedAddresses,
      alreadyPaidAddresses: [],
      paidAmounts,
    }

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash5",
      distributionId,
      0,
      10,
      result,
    )

    await eventBus.publishSync(event, DistributionExecutedDLTEvent.name)

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(3)
    expect(holders.every((h) => h.status === DistributionHolderStatus.FAILED)).toBe(true)
    expect(holders.every((h) => h.amount === null)).toBe(true)
  })

  it("should handle multiple distributions for the same treasury", async () => {
    const treasury = await createTreasuryWithPaymentToken("0.0.222")

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation(async (address: string) => {
      const addressMap: Record<string, string> = {
        "0xevmAddress20": "0.0.100",
        "0xevmAddress21": "0.0.200",
      }
      return addressMap[address] || address
    })

    const distribution1Id = 10
    const result1: PaymentResult = {
      succeededAddresses: ["0xevmAddress20"],
      failedAddresses: [],
      alreadyPaidAddresses: [],
      paidAmounts: ["1000000"],
    }

    const event1 = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash10",
      distribution1Id,
      0,
      10,
      result1,
    )

    const distribution2Id = 11
    const result2: PaymentResult = {
      succeededAddresses: ["0xevmAddress21"],
      failedAddresses: [],
      alreadyPaidAddresses: [],
      paidAmounts: ["2000000"],
    }

    const event2 = new DistributionByAddressesExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash11",
      distribution2Id,
      ["0xevmAddress21"],
      result2,
    )

    await eventBus.publishSync(event1, DistributionExecutedDLTEvent.name)
    await eventBus.publishSync(event2, DistributionByAddressesExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(2)

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(2)
    expect(holders[0].distributionId).toEqual(distribution1Id)
    expect(holders[1].distributionId).toEqual(distribution2Id)
  })
})
