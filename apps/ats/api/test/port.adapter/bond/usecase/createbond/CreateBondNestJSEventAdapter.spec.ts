// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondSuiteDeployedDLTEvent } from "@port/bond/usecase/createbond/model/BondSuiteDeployedDLTEvent"
import { BondFoundError } from "@domain/bond/errors/BondFoundError"

describe("CreateBondNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>

  const createValidBondData = (overrides: any = {}): any => ({
    security: {
      arePartitionsProtected: false,
      isMultiPartition: false,
      resolver: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
      resolverProxyConfiguration: {
        key: "test-key",
        version: "1.0.0",
      },
      rbacs: [],
      isControllable: true,
      isWhiteList: true,
      maxSupply: "1000000",
      erc20MetadataInfo: {
        name: "Green Energy Bond",
        symbol: "GEB",
        isin: "US1234567890",
        decimals: 2,
      },
      clearingActive: true,
      internalKycActivated: true,
      externalPauses: [],
      externalControlLists: [],
      externalKycLists: [],
      erc20VotesActivated: false,
      compliance: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
      identityRegistry: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
      ...overrides.security,
    },
    bondDetails: {
      currency: "0x555344",
      nominalValue: "100",
      nominalValueDecimals: 2,
      startingDate: "1640995200",
      maturityDate: "1672531200",
      ...overrides.bondDetails,
    },
    proceedRecipients: overrides.proceedRecipients || ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
    proceedRecipientsData: overrides.proceedRecipientsData || ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
  })

  const createValidRegulationData = (): any => ({
    regulationType: 1,
    regulationSubType: 0,
    additionalSecurityData: {
      countriesControlListType: true,
      listOfCountries: "US,CA",
      info: "Green bond for renewable energy projects",
    },
  })

  const createValidTreasuryData = (): any => ({
    resolver: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    resolverProxyConfiguration: {
      key: "0x0000000000000000000000000000000000000000000000000000000000000002",
      version: "1",
    },
    rbacs: [],
    paymentToken: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    environmentalAssets: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
  })

  const createValidKpiData = (): any => ({
    admin: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    rbacs: [],
  })
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    bondRepository = app.get(getRepositoryToken(BondPersistence))

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0xb3533f32594b689f19a94c608490451478f7197b": "0.0.6974684",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684",
        "0x3fd3fdc1eae44f055f73469f4fe05915395c7ff8": "0.0.6974684",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.1234567",
        "0x7cbc6ccef6e569e961341f68afd7547f4c1b2c1b": "0.0.6974345",
        "0x057e65d260bda4d653bf7726b4f92ad08db0f78f": "0.0.6974384",
        "0x1fc2fdc1eae44f055f73469f4fe05915395c7aa1": "0.0.7974345",
        "0x2fd3fdc1eae44f055f73469f4fe05915395c7aa2": "0.0.7974346",
        "0x1fc2fdc1eae44f055f73469f4fe05915395c7bb1": "0.0.8974384",
        "0x2fd3fdc1eae44f055f73469f4fe05915395c7bb2": "0.0.8974385",
      }
      return Promise.resolve(addressMap[address.toLowerCase()] || addressMap[address] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("CreateBondNestJSEventAdapter", () => {
    it("should create a new bond when BondSuiteDeployedDLTEvent is published", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()
      const treasuryData = createValidTreasuryData()
      const kpiData = createValidKpiData()

      const event = new BondSuiteDeployedDLTEvent(
        "0.0.67890",
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x3fd3fdc1eae44f055f73469f4fe05915395c7ff8",
        bondData,
        regulationData,
        treasuryData,
        kpiData,
      )

      await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

      const savedBond = await bondRepository.findOne({ where: { contractId: "0.0.6974684" } })

      expect(savedBond).toBeDefined()
      expect(savedBond).not.toBeNull()
      expect(savedBond!.contractId).toBe("0.0.6974684")
      expect(savedBond!.treasuryId).toBe("0.0.6974684")
      expect(savedBond!.kpiId).toBe("0.0.6974684")
      expect(savedBond!.name).toBe(bondData.security.erc20MetadataInfo.name)
      expect(savedBond!.symbol).toBe(bondData.security.erc20MetadataInfo.symbol)
      expect(savedBond!.isin).toBe(bondData.security.erc20MetadataInfo.isin)
      expect(savedBond!.decimals).toBe(bondData.security.erc20MetadataInfo.decimals)
      expect(savedBond!.currency).toBe("USD")
      expect(savedBond!.nominalValue).toBe(bondData.bondDetails.nominalValue)
      expect(savedBond!.nominalValueDecimals).toBe(bondData.bondDetails.nominalValueDecimals)
      expect(savedBond!.maxSupply).toBe(bondData.security.maxSupply)
      expect(savedBond!.startingDate).toEqual(new Date(Number(bondData.bondDetails.startingDate) * 1000))
      expect(savedBond!.maturityDate).toEqual(new Date(Number(bondData.bondDetails.maturityDate) * 1000))
    })

    it("should throw BondFoundError when bond with same address already exists", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      const existingBond = {
        contractId: "0.0.6974684",
        treasuryId: "0.0.6974684",
        kpiId: "0.0.6974684",
        name: "Existing Bond",
        symbol: "EB",
        isin: "US9876543210",
        decimals: 2,
        currency: "USD",
        nominalValue: "50",
        nominalValueDecimals: 2,
        startingDate: new Date("2023-01-01"),
        maturityDate: new Date("2028-01-01"),
        maxSupply: "500000",
      }

      await bondRepository.save(existingBond)

      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()
      const treasuryData = createValidTreasuryData()
      const kpiData = createValidKpiData()

      const event = new BondSuiteDeployedDLTEvent(
        "0.0.67890",
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x3fd3fdc1eae44f055f73469f4fe05915395c7ff8",
        bondData,
        regulationData,
        treasuryData,
        kpiData,
      )

      await expect(eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)).rejects.toThrow(
        BondFoundError.contractIdError("0.0.6974684"),
      )
    })

    it("should create bonds with different addresses successfully", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()
      const treasuryData = createValidTreasuryData()
      const kpiData = createValidKpiData()

      const bondAddresses = [
        {
          bond: "0x7cbc6ccef6e569e961341f68afd7547f4c1b2c1b",
          hederaId: "0.0.6974345",
          treasury: "0x1fc2fdc1eae44f055f73469f4fe05915395c7aa1",
          kpi: "0x2fd3fdc1eae44f055f73469f4fe05915395c7aa2",
        },
        {
          bond: "0x057e65d260bda4d653bf7726b4f92ad08db0f78f",
          hederaId: "0.0.6974384",
          treasury: "0x1fc2fdc1eae44f055f73469f4fe05915395c7bb1",
          kpi: "0x2fd3fdc1eae44f055f73469f4fe05915395c7bb2",
        },
      ]

      for (const addresses of bondAddresses) {
        const event = new BondSuiteDeployedDLTEvent(
          "0.0.67890",
          "0x1234567890abcdef",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          addresses.bond,
          addresses.treasury,
          addresses.kpi,
          bondData,
          regulationData,
          treasuryData,
          kpiData,
        )

        await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

        const savedBond = await bondRepository.findOne({
          where: { contractId: addresses.hederaId },
        })

        expect(savedBond).toBeDefined()
        expect(savedBond).not.toBeNull()
        expect(savedBond!.contractId).toBe(addresses.hederaId)
      }
      const allBonds = await bondRepository.find()
      expect(allBonds).toHaveLength(2)
    })

    it("should publish CreatedBondEvent after successful bond creation", async () => {
      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()
      const treasuryData = createValidTreasuryData()
      const kpiData = createValidKpiData()

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new BondSuiteDeployedDLTEvent(
        "0.0.67890",
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x3fd3fdc1eae44f055f73469f4fe05915395c7ff8",
        bondData,
        regulationData,
        treasuryData,
        kpiData,
      )

      await eventBus.publishSync(event, BondSuiteDeployedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: "0.0.6974684",
          treasuryId: "0.0.6974684",
          kpiId: "0.0.6974684",
          name: bondData.security.erc20MetadataInfo.name,
          symbol: bondData.security.erc20MetadataInfo.symbol,
          isin: bondData.security.erc20MetadataInfo.isin,
          decimals: bondData.security.erc20MetadataInfo.decimals,
          currency: "USD",
          nominalValue: bondData.bondDetails.nominalValue,
          nominalValueDecimals: bondData.bondDetails.nominalValueDecimals,
          startingDate: new Date(Number(bondData.bondDetails.startingDate) * 1000),
          maturityDate: new Date(Number(bondData.bondDetails.maturityDate) * 1000),
          maxSupply: bondData.security.maxSupply,
          timestamp: expect.any(Number),
        }),
      )
    })
  })
})
