// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondDeployedDLTEvent } from "@port/bond/usecase/createbond/model/BondDeployedDLTEvent"
import { BondFoundError } from "@domain/bond/errors/BondFoundError"

describe("CreateBondNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
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

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    bondRepository = app.get(getRepositoryToken(BondPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondRepository.clear()
    await app.close()
  })

  describe("CreateBondNestJSEventAdapter", () => {
    it("should create a new bond when BondDeployedDLTEvent is published", async () => {
      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()

      const event = new BondDeployedDLTEvent(
        "0.0.6974684",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        bondData,
        regulationData,
      )

      await eventBus.publishSync(event, BondDeployedDLTEvent.name)

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
      expect(savedBond!.maxSupply).toBe(bondData.security.maxSupply)
      expect(savedBond!.startingDate).toEqual(new Date(Number(bondData.bondDetails.startingDate) * 1000))
      expect(savedBond!.maturityDate).toEqual(new Date(Number(bondData.bondDetails.maturityDate) * 1000))
    })

    it("should throw BondFoundError when bond with same address already exists", async () => {
      const existingBond = {
        contractId: "0.0.6823801",
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6823801",
        name: "Existing Bond",
        symbol: "EB",
        isin: "US9876543210",
        decimals: 2,
        currency: "USD",
        nominalValue: "50",
        startingDate: new Date("2023-01-01"),
        maturityDate: new Date("2028-01-01"),
        maxSupply: "500000",
      }

      await bondRepository.save(existingBond)

      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()

      const event = new BondDeployedDLTEvent(
        "0.0.6974684",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        bondData,
        regulationData,
      )

      await expect(eventBus.publishSync(event, BondDeployedDLTEvent.name)).rejects.toThrow(
        BondFoundError.contractIdError(existingBond.contractId),
      )
    })

    it("should create bonds with different addresses successfully", async () => {
      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()

      const bondAddresses = [
        "0x7cbc6ccef6e569e961341f68afd7547f4c1b2c1b:0.0.6974345",
        "0x057e65d260bda4d653bf7726b4f92ad08db0f78f:0.0.6974384",
      ]

      for (const contractAddress of bondAddresses) {
        const hederaId = contractAddress.split(":")[1]
        const evmAddress = contractAddress.split(":")[0]

        const event = new BondDeployedDLTEvent(
          "0.0.6974684",
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          evmAddress,
          bondData,
          regulationData,
        )

        await eventBus.publishSync(event, BondDeployedDLTEvent.name)

        const savedBond = await bondRepository.findOne({
          where: { contractId: hederaId },
        })

        expect(savedBond).toBeDefined()
        expect(savedBond).not.toBeNull()
        expect(savedBond!.contractId).toBe(hederaId)
      }
      const allBonds = await bondRepository.find()
      expect(allBonds).toHaveLength(bondAddresses.length)
    })

    it("should publish CreatedBondEvent after successful bond creation", async () => {
      const bondData = createValidBondData()
      const regulationData = createValidRegulationData()

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new BondDeployedDLTEvent(
        "0.0.6974684",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        bondData,
        regulationData,
      )

      await eventBus.publishSync(event, BondDeployedDLTEvent.name)

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
          startingDate: new Date(Number(bondData.bondDetails.startingDate) * 1000),
          maturityDate: new Date(Number(bondData.bondDetails.maturityDate) * 1000),
          maxSupply: bondData.security.maxSupply,
          timestamp: expect.any(Number),
        }),
      )
    })
  })
})
