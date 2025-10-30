// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { DistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionExecutedDLTEvent"
import { DistributionByAddressesExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionByAddressesExecutedDLTEvent"
import { DistributionPersistence } from "@port/persistence/distribution/model/DistributionPersistence"
import { DistributionHolderPersistence } from "@port/persistence/distribution/model/DistributionHolderPersistence"
import { DistributionCreatedEvent } from "@domain/distribution/event/DistributionCreatedEvent"
import { DistributionHolderAddedEvent } from "@domain/distribution/event/DistributionHolderAddedEvent"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"

describe("SyncDistribution Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
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
  })

  it("should create distribution and add successful holders on DistributionExecuted event", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    const distributionId = "1"
    const successAddresses = ["0.0.100", "0.0.101", "0.0.102"]
    const failedAddresses = ["0.0.200"]
    const paidAmounts = ["1000000", "2000000", "3000000"]

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      distributionId,
      successAddresses,
      failedAddresses,
      [],
      paidAmounts,
    )

    await eventBus.publishSync(event, DistributionExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(1)
    expect(distributions[0]).toEqual({
      id: parseInt(distributionId),
      treasuryId: treasury.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(4)

    const successHolders = holders.filter((h) => h.status === DistributionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(3)
    expect(successHolders[0]).toMatchObject({
      holderAccountId: successAddresses[0],
      status: DistributionHolderStatus.SUCCESS,
      amount: paidAmounts[0],
      distributionId: parseInt(distributionId),
    })
    expect(successHolders[1]).toMatchObject({
      holderAccountId: successAddresses[1],
      status: DistributionHolderStatus.SUCCESS,
      amount: paidAmounts[1],
      distributionId: parseInt(distributionId),
    })
    expect(successHolders[2]).toMatchObject({
      holderAccountId: successAddresses[2],
      status: DistributionHolderStatus.SUCCESS,
      amount: paidAmounts[2],
      distributionId: parseInt(distributionId),
    })

    const failedHolders = holders.filter((h) => h.status === DistributionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(1)
    expect(failedHolders[0]).toMatchObject({
      holderAccountId: failedAddresses[0],
      status: DistributionHolderStatus.FAILED,
      amount: "0",
      distributionId: parseInt(distributionId),
    })

    expect(publishedEvents).toHaveLength(5)
    expect(publishedEvents[0].constructor.name).toEqual(DistributionCreatedEvent.name)
    expect(publishedEvents.slice(1).every((e) => e.constructor.name === DistributionHolderAddedEvent.name)).toBe(true)
  })

  it("should create distribution and add holders on DistributionByAddressesExecuted event", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    const distributionId = "2"
    const successAddresses = ["0.0.300", "0.0.301"]
    const failedAddresses = ["0.0.400", "0.0.401"]
    const paidAmounts = ["5000000", "6000000"]

    const event = new DistributionByAddressesExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash2",
      distributionId,
      successAddresses,
      failedAddresses,
      [],
      paidAmounts,
    )

    await eventBus.publishSync(event, DistributionByAddressesExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(1)
    expect(distributions[0].id).toEqual(parseInt(distributionId))

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(4)

    const successHolders = holders.filter((h) => h.status === DistributionHolderStatus.SUCCESS)
    expect(successHolders).toHaveLength(2)

    const failedHolders = holders.filter((h) => h.status === DistributionHolderStatus.FAILED)
    expect(failedHolders).toHaveLength(2)

    expect(publishedEvents).toHaveLength(5)
    expect(publishedEvents[0].constructor.name).toEqual(DistributionCreatedEvent.name)
  })

  it("should add holders to existing distribution", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const distributionId = 3
    await internalDistributionRepository.save({
      id: distributionId,
      treasuryId: treasury.id,
    })

    await internalDistributionHolderRepository.save({
      holderAccountId: "0.0.100",
      status: DistributionHolderStatus.SUCCESS,
      amount: "1000000",
      distributionId: distributionId,
    })

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    const successAddresses = ["0.0.101"]
    const failedAddresses = []
    const paidAmounts = ["2000000"]

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash3",
      distributionId.toString(),
      successAddresses,
      failedAddresses,
      [],
      paidAmounts,
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
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const distributionId = "4"
    const successAddresses = ["0.0.100", "0x0000000000000000000000000000000000000000", "0.0.101"]
    const failedAddresses = ["0x0000000000000000000000000000000000000000", "0.0.200"]
    const paidAmounts = ["1000000", "0", "2000000"]

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash4",
      distributionId,
      successAddresses,
      failedAddresses,
      [],
      paidAmounts,
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
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const distributionId = "5"
    const successAddresses: string[] = []
    const failedAddresses = ["0.0.200", "0.0.201", "0.0.202"]
    const paidAmounts: string[] = []

    const event = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash5",
      distributionId,
      successAddresses,
      failedAddresses,
      [],
      paidAmounts,
    )

    await eventBus.publishSync(event, DistributionExecutedDLTEvent.name)

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(3)
    expect(holders.every((h) => h.status === DistributionHolderStatus.FAILED)).toBe(true)
    expect(holders.every((h) => h.amount === "0")).toBe(true)
  })

  it("should handle multiple distributions for the same treasury", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.222",
      bondContractId: "0.0.500",
      paused: false,
    })

    const distribution1Id = "10"
    const event1 = new DistributionExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash10",
      distribution1Id,
      ["0.0.100"],
      [],
      [],
      ["1000000"],
    )

    const distribution2Id = "11"
    const event2 = new DistributionByAddressesExecutedDLTEvent(
      treasury.contractId,
      "testTransactionHash11",
      distribution2Id,
      ["0.0.200"],
      [],
      [],
      ["2000000"],
    )

    await eventBus.publishSync(event1, DistributionExecutedDLTEvent.name)
    await eventBus.publishSync(event2, DistributionByAddressesExecutedDLTEvent.name)

    const distributions = await internalDistributionRepository.find()
    expect(distributions).toHaveLength(2)

    const holders = await internalDistributionHolderRepository.find()
    expect(holders).toHaveLength(2)
    expect(holders[0].distributionId).toEqual(parseInt(distribution1Id))
    expect(holders[1].distributionId).toEqual(parseInt(distribution2Id))
  })
})
