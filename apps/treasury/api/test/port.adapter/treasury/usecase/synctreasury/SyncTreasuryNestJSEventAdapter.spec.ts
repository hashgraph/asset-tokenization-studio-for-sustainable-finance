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
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondSuiteDeployedDLTEvent } from "@port/treasury/usecase/synctreasury/model/BondSuiteDeployedDLTEvent"
import { TreasuryDataEventModel } from "@port/treasury/usecase/synctreasury/model/TreasuryDataEventModel"
import { TreasuryCreatedEvent } from "@domain/treasury/event/TreasuryCreatedEvent"
import { PaymentTokenAddedEvent } from "@domain/paymenttoken/event/PaymentTokenAddedEvent"
import { EnvironmentalAssetAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetAddedEvent"
import { HederaPort } from "@port/blockchain/HederaPort"

describe("SyncTreasury Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let hederaPort: HederaPort
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalEnvironmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    hederaPort = app.get("HederaPort")
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    internalPaymentTokenRepository = app.get(getRepositoryToken(PaymentTokenPersistence))
    internalEnvironmentalAssetRepository = app.get(getRepositoryToken(EnvironmentalAssetPersistence))
  })
  afterEach(async () => {
    await internalEnvironmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
  })

  it("should create treasury, payment token and environmental assets on BondSuiteDeployed event", async () => {
    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    jest.spyOn(hederaPort, "getTokenDecimals").mockResolvedValue(6)

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => address)

    const treasuryData: TreasuryDataEventModel = {
      paymentToken: "0.0.1000",
      environmentalAssets: ["0.0.2000", "0.0.2001", "0.0.2002"],
    }

    const event = new BondSuiteDeployedDLTEvent("0.0.9999", "testTransactionHash", "0.0.100", "0.0.200", treasuryData)

    await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

    // Verify Treasury was created
    const treasuries = await internalTreasuryRepository.find()
    expect(treasuries).toHaveLength(1)
    expect(treasuries[0]).toMatchObject({
      contractId: "0.0.200",
      bondContractId: "0.0.100",
      paused: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })

    // Verify PaymentToken was created with decimals from blockchain
    const paymentTokens = await internalPaymentTokenRepository.find()
    expect(paymentTokens).toHaveLength(1)
    expect(paymentTokens[0]).toMatchObject({
      contractId: "0.0.1000",
      treasuryId: treasuries[0].id,
      decimals: 6,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })

    // Verify EnvironmentalAssets were created
    const environmentalAssets = await internalEnvironmentalAssetRepository.find()
    expect(environmentalAssets).toHaveLength(3)
    expect(environmentalAssets[0]).toMatchObject({
      contractId: "0.0.2000",
      treasuryId: treasuries[0].id,
    })
    expect(environmentalAssets[1]).toMatchObject({
      contractId: "0.0.2001",
      treasuryId: treasuries[0].id,
    })
    expect(environmentalAssets[2]).toMatchObject({
      contractId: "0.0.2002",
      treasuryId: treasuries[0].id,
    })

    // Verify events were published
    expect(publishedEvents).toHaveLength(5) // 1 TreasuryCreated + 1 PaymentTokenAdded + 3 EnvironmentalAssetAdded
    expect(publishedEvents[0]).toBeInstanceOf(TreasuryCreatedEvent)
    expect(publishedEvents[0].treasuryContractId).toBe("0.0.200")
    expect(publishedEvents[1]).toBeInstanceOf(PaymentTokenAddedEvent)
    expect(publishedEvents[1].treasuryContractId).toBe("0.0.200")
    expect(publishedEvents[1].bondContractId).toBe("0.0.100")
    expect(publishedEvents[1].paymentTokenContractId).toBe("0.0.1000")
    expect(publishedEvents.slice(2).every((e) => e instanceof EnvironmentalAssetAddedEvent)).toBe(true)
  })

  it("should be idempotent - not create duplicates if event is received again", async () => {
    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => address)

    jest.spyOn(hederaPort, "getTokenDecimals").mockResolvedValue(6)

    const treasuryData: TreasuryDataEventModel = {
      paymentToken: "0.0.1000",
      environmentalAssets: ["0.0.2000"],
    }

    const event = new BondSuiteDeployedDLTEvent("0.0.9999", "testTransactionHash", "0.0.100", "0.0.200", treasuryData)

    // Publish event first time
    await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

    expect(publishedEvents).toHaveLength(3) // TreasuryCreated + PaymentTokenAdded + EnvironmentalAssetAdded
    publishedEvents.length = 0 // Clear events

    // Publish same event again
    await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

    // Verify no duplicates were created
    const treasuries = await internalTreasuryRepository.find()
    expect(treasuries).toHaveLength(1)

    const paymentTokens = await internalPaymentTokenRepository.find()
    expect(paymentTokens).toHaveLength(1)

    const environmentalAssets = await internalEnvironmentalAssetRepository.find()
    expect(environmentalAssets).toHaveLength(1)

    // Verify no events were published on second call
    expect(publishedEvents).toHaveLength(0)
  })

  it("should add new environmental assets to existing treasury", async () => {
    // Pre-create treasury and payment token
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.500",
      bondContractId: "0.0.600",
      paused: false,
    })

    await internalPaymentTokenRepository.save({
      contractId: "0.0.4000",
      treasuryId: treasury.id,
      decimals: 6,
    })

    await internalEnvironmentalAssetRepository.save({
      contractId: "0.0.5000",
      treasuryId: treasury.id,
    })

    const publishedEvents: any[] = []
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => address)

    jest.spyOn(eventBus, "publish").mockImplementation((event) => {
      publishedEvents.push(event)
    })

    jest.spyOn(hederaPort, "getTokenDecimals").mockResolvedValue(6)

    const treasuryData: TreasuryDataEventModel = {
      paymentToken: "0.0.4000",
      environmentalAssets: ["0.0.5000", "0.0.5001", "0.0.5002"], // 1 existing + 2 new
    }

    const event = new BondSuiteDeployedDLTEvent("0.0.9999", "testTransactionHash", "0.0.600", "0.0.500", treasuryData)

    await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

    // Verify only new assets were added
    const environmentalAssets = await internalEnvironmentalAssetRepository.find()
    expect(environmentalAssets).toHaveLength(3)

    // Only 2 new EnvironmentalAssetAdded events (the first one already existed)
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => address)

    expect(publishedEvents).toHaveLength(2)
    expect(publishedEvents.every((e) => e instanceof EnvironmentalAssetAddedEvent)).toBe(true)
  })

  it("should correctly map bondAddress and treasuryAddress", async () => {
    jest.spyOn(eventBus, "publish").mockImplementation(() => {})
    jest.spyOn(hederaPort, "getTokenDecimals").mockResolvedValue(6)

    const treasuryData: TreasuryDataEventModel = {
      paymentToken: "0.0.7000",
      environmentalAssets: ["0.0.8000"],
    }

    const bondAddress = "0.0.BOND123"
    const treasuryAddress = "0.0.TREASURY456"

    const event = new BondSuiteDeployedDLTEvent("0.0.9999", "testHash", bondAddress, treasuryAddress, treasuryData)

    await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

    const treasuries = await internalTreasuryRepository.find()
    expect(treasuries).toHaveLength(1)
    expect(treasuries[0].contractId).toBe(treasuryAddress)
    expect(treasuries[0].bondContractId).toBe(bondAddress)
  })
})
