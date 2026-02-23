// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("CreateBondTransaction API Integration", () => {
  let app: INestApplication
  beforeEach(async () => {
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue("0.0.67890")

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    // app.useLogger(false) // TEMPORARILY ENABLED FOR DEBUGGING
    await app.init()
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /bonds", () => {
    it("should create bond with valid request data", async () => {
      const createBondRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        factoryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        securityTokenToCreate: {
          name: "Green Energy Bond",
          symbol: "GEB",
          isin: "US1234567890",
          decimals: 2,
          isWhiteList: true,
          erc20VotesActivated: false,
          isControllable: true,
          arePartitionsProtected: false,
          isMultiPartition: false,
          clearingActive: true,
          internalKycActivated: true,
          currency: "0x858368",
          numberOfUnits: "1000000",
          nominalValue: "100",
          nominalValueDecimals: 2,
          startingDate: new Date(1640995200000),
          maturityDate: new Date(1672531200000),
          configVersion: 1,
          resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          externalPausesAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          externalControlListsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          externalKycListsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          diamondOwnerAccount: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          complianceAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          identityRegistryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          proceedRecipientAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          proceedRecipientsData: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
        },
        factoryRegulationData: {
          regulationType: 1,
          regulationSubType: 1,
          isCountryControlListWhiteList: true,
          countries: "US,CA",
          info: "Green bond for renewable energy projects",
        },
        treasuryData: {
          resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          configVersion: 1,
          paymentTokenAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          ownerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          environmentalAssetsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
        },
        kpiData: {
          interestRate: {
            maxRate: "500",
            baseRate: "300",
            minRate: "100",
            startPeriod: "1735689600",
            startRate: "300",
            missedPenalty: "50",
            reportPeriod: "2592000",
            rateDecimals: 2,
          },
          impactData: {
            maxDeviationCap: "1000",
            baseLine: "50000",
            maxDeviationFloor: "500",
            impactDataDecimals: 2,
            adjustmentPrecision: "100",
          },
        },
      }

      const response = await request(app.getHttpServer()).post(`/api/v1/ats/bonds`).send(createBondRequest)

      if (response.status !== 201) {
        console.error("ERROR RESPONSE:", JSON.stringify(response.body, null, 2))
        console.error("STATUS:", response.status)
      }

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const createBondRequest = {
          format: format,
          accountId: "0.0.5466269",
          factoryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          securityTokenToCreate: {
            name: "Green Energy Bond",
            symbol: "GEB",
            isin: "US1234567890",
            decimals: 2,
            isWhiteList: true,
            erc20VotesActivated: false,
            isControllable: true,
            arePartitionsProtected: false,
            isMultiPartition: false,
            clearingActive: true,
            internalKycActivated: true,
            currency: "0x858368",
            numberOfUnits: "1000000",
            nominalValue: "100",
            nominalValueDecimals: 2,
            startingDate: new Date(1640995200000),
            maturityDate: new Date(1672531200000),
            configVersion: 1,
            resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            externalPausesAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
            externalControlListsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
            externalKycListsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
            diamondOwnerAccount: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            complianceAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            identityRegistryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            proceedRecipientAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
            proceedRecipientsData: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          },
          factoryRegulationData: {
            regulationType: 1,
            regulationSubType: 1,
            isCountryControlListWhiteList: true,
            countries: "US,CA",
            info: "Green bond for renewable energy projects",
          },
          treasuryData: {
            resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            configVersion: 1,
            paymentTokenAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            ownerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            environmentalAssetsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          },
          kpiData: {
            interestRate: {
              maxRate: "500",
              baseRate: "300",
              minRate: "100",
              startPeriod: "1735689600",
              startRate: "300",
              missedPenalty: "50",
              reportPeriod: "2592000",
              rateDecimals: 2,
            },
            impactData: {
              maxDeviationCap: "1000",
              baseLine: "50000",
              maxDeviationFloor: "500",
              impactDataDecimals: 2,
              adjustmentPrecision: "100",
            },
          },
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds`)
          .send(createBondRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for invalid format values", async () => {
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const createBondRequest = {
          format,
          accountId: "0.0.12345",
          factoryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          securityTokenToCreate: {
            name: "Test Bond",
            symbol: "TB",
            isin: "US1234567890",
            decimals: 2,
            isWhiteList: true,
            erc20VotesActivated: false,
            isControllable: true,
            arePartitionsProtected: false,
            isMultiPartition: false,
            clearingActive: true,
            internalKycActivated: true,
            currency: "USD",
            numberOfUnits: "1000",
            nominalValue: "100",
            nominalValueDecimals: 2,
            startingDate: "2025-01-01",
            maturityDate: "2030-01-01",
            configVersion: 1,
            resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            externalPausesAddresses: [],
            externalControlListsAddresses: [],
            externalKycListsAddresses: [],
            diamondOwnerAccount: "0.0.54321",
            complianceAddress: "compliance-001",
            identityRegistryAddress: "identity-001",
            proceedRecipientAddresses: [],
            proceedRecipientsData: [],
          },
          factoryRegulationData: {
            regulationType: 1,
            regulationSubType: 1,
            isCountryControlListWhiteList: true,
            countries: "US",
            info: "Test bond",
          },
          treasuryData: {
            resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            configVersion: 1,
            paymentTokenAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            ownerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
            environmentalAssetsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
          },
          kpiData: {
            interestRate: {
              maxRate: "500",
              baseRate: "300",
              minRate: "100",
              startPeriod: "1735689600",
              startRate: "300",
              missedPenalty: "50",
              reportPeriod: "2592000",
              rateDecimals: 2,
            },
            impactData: {
              maxDeviationCap: "1000",
              baseLine: "50000",
              maxDeviationFloor: "500",
              impactDataDecimals: 2,
              adjustmentPrecision: "100",
            },
          },
        }

        await request(app.getHttpServer()).post(`/api/v1/ats/bonds`).send(createBondRequest).expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const invalidRequests = [{}, { format: "hedera" }, { name: "Test Bond" }, { format: "hedera", name: "Test Bond" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer()).post(`/api/v1/ats/bonds`).send(invalidRequest).expect(400)
      }
    })

    it("should reject invalid decimals value", async () => {
      const createBondRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        factoryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        securityTokenToCreate: {
          name: "Test Bond",
          symbol: "TB",
          isin: "US1234567890",
          decimals: -1, // Invalid value
          isWhiteList: true,
          erc20VotesActivated: false,
          isControllable: true,
          arePartitionsProtected: false,
          isMultiPartition: false,
          clearingActive: true,
          internalKycActivated: true,
          currency: "USD",
          numberOfUnits: "1000",
          nominalValue: "100",
          nominalValueDecimals: 2,
          startingDate: "2025-01-01",
          maturityDate: "2030-01-01",
          configVersion: 1,
          resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          externalPausesAddresses: [],
          externalControlListsAddresses: [],
          externalKycListsAddresses: [],
          diamondOwnerAccount: "0.0.54321",
          complianceAddress: "compliance-001",
          identityRegistryAddress: "identity-001",
          proceedRecipientAddresses: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: {
          regulationType: 1,
          regulationSubType: 1,
          isCountryControlListWhiteList: true,
          countries: "US",
          info: "Test bond",
        },
        treasuryData: {
          resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          configVersion: 1,
          paymentTokenAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          ownerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          environmentalAssetsAddresses: ["0x48ca774f6942166bf37e178ccc1e861947ead8c7"],
        },
        kpiData: {
          interestRate: {
            maxRate: "500",
            baseRate: "300",
            minRate: "100",
            startPeriod: "1735689600",
            startRate: "300",
            missedPenalty: "50",
            reportPeriod: "2592000",
            rateDecimals: 2,
          },
          impactData: {
            maxDeviationCap: "1000",
            baseLine: "50000",
            maxDeviationFloor: "500",
            impactDataDecimals: 2,
            adjustmentPrecision: "100",
          },
        },
      }

      await request(app.getHttpServer()).post(`/api/v1/ats/bonds`).send(createBondRequest).expect(400)
    })
  })
})
