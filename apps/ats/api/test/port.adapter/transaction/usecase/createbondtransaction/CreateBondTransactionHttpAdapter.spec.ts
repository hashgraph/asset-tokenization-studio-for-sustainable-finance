// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { BuildTransactionResponse, SharedModule } from '@hashgraph/green-bonds-shared-core'
import { PostgresModule } from '@config/PostgresModule'
import { CONTROLLERS, PROVIDERS } from '@components'
import { PostgreSqlContainer } from '@test/shared/containers/PostgresqlContainer'

describe('CreateBondTransaction API Integration', () => {
  let app: INestApplication
  let container: PostgreSqlContainer

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
    app.setGlobalPrefix('api/v1/ats')
    app.useLogger(false)
    await app.init()
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('POST /bonds/factories/:factoryContractId/bond-transactions', () => {
    it('should create bond with valid request data', async () => {
      const factoryContractId = '0.0.67890'
      const createBondRequest = {
        format: 'hedera',
        accountId: '0.0.5466269',
        securityTokenToCreate: {
          name: 'Green Energy Bond',
          symbol: 'GEB',
          isin: 'US1234567890',
          decimals: 2,
          isWhiteList: true,
          erc20VotesActivated: false,
          isControllable: true,
          arePartitionsProtected: false,
          isMultiPartition: false,
          clearingActive: true,
          internalKycActivated: true,
          currency: '0x858368',
          numberOfUnits: '1000000',
          nominalValue: '100',
          startingDate: '1640995200000',
          maturityDate: '1672531200000',
          configId: '0x0000000000000000000000000000000000000000000000000000000000000002',
          configVersion: 1,
          resolver: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
          externalPausesIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
          externalControlListsIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
          externalKycListsIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
          diamondOwnerAccount: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
          complianceId: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
          identityRegistryId: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
          proceedRecipientIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
          proceedRecipientsData: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
        },
        factoryRegulationData: {
          regulationType: 1,
          regulationSubType: 1,
          isCountryControlListWhiteList: true,
          countries: 'US,CA',
          info: 'Green bond for renewable energy projects',
        },
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/factories/${factoryContractId}/bond-transactions`)
        .send(createBondRequest)
        .expect(201)

      expect(response.body).toHaveProperty('unsignedTx')
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe('string')
    })

    it('should handle different valid format values', async () => {
      const factoryContractId = '0.0.67890'
      const formats = ['hedera', 'ethereum']

      for (const format of formats) {
        const createBondRequest = {
          format: format,
          accountId: '0.0.5466269',
          securityTokenToCreate: {
            name: 'Green Energy Bond',
            symbol: 'GEB',
            isin: 'US1234567890',
            decimals: 2,
            isWhiteList: true,
            erc20VotesActivated: false,
            isControllable: true,
            arePartitionsProtected: false,
            isMultiPartition: false,
            clearingActive: true,
            internalKycActivated: true,
            currency: '0x858368',
            numberOfUnits: '1000000',
            nominalValue: '100',
            startingDate: '1640995200000',
            maturityDate: '1672531200000',
            configId: '0x0000000000000000000000000000000000000000000000000000000000000002',
            configVersion: 1,
            resolver: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
            externalPausesIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
            externalControlListsIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
            externalKycListsIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
            diamondOwnerAccount: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
            complianceId: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
            identityRegistryId: '0x48ca774f6942166bf37e178ccc1e861947ead8c7',
            proceedRecipientIds: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
            proceedRecipientsData: ['0x48ca774f6942166bf37e178ccc1e861947ead8c7'],
          },
          factoryRegulationData: {
            regulationType: 1,
            regulationSubType: 1,
            isCountryControlListWhiteList: true,
            countries: 'US,CA',
            info: 'Green bond for renewable energy projects',
          },
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/factories/${factoryContractId}/bond-transactions`)
          .send(createBondRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty('unsignedTx')
      }
    })

    it('should return 400 for invalid format values', async () => {
      const factoryContractId = '0.0.67890'
      const invalidFormats = ['json', 'hex', 'base64', 'xml', 'invalid']

      for (const format of invalidFormats) {
        const createBondRequest = {
          format,
          accountId: '0.0.12345',
          securityTokenToCreate: {
            name: 'Test Bond',
            symbol: 'TB',
            isin: 'US1234567890',
            decimals: 2,
            isWhiteList: true,
            erc20VotesActivated: false,
            isControllable: true,
            arePartitionsProtected: false,
            isMultiPartition: false,
            clearingActive: true,
            internalKycActivated: true,
            currency: 'USD',
            numberOfUnits: '1000',
            nominalValue: '100',
            startingDate: '2025-01-01',
            maturityDate: '2030-01-01',
            configId: 'config-123',
            configVersion: 1,
            resolver: '0xabcdef1234567890',
            externalPausesIds: [],
            externalControlListsIds: [],
            externalKycListsIds: [],
            diamondOwnerAccount: '0.0.54321',
            complianceId: 'compliance-001',
            identityRegistryId: 'identity-001',
            proceedRecipientIds: [],
            proceedRecipientsData: [],
          },
          factoryRegulationData: {
            regulationType: 1,
            regulationSubType: 1,
            isCountryControlListWhiteList: true,
            countries: 'US',
            info: 'Test bond',
          },
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/factories/${factoryContractId}/bond-transactions`)
          .send(createBondRequest)
          .expect(400)
      }
    })

    it('should return 400 for missing required fields', async () => {
      const factoryContractId = '0.0.67890'
      const invalidRequests = [{}, { format: 'hedera' }, { name: 'Test Bond' }, { format: 'hedera', name: 'Test Bond' }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/factories/${factoryContractId}/bond-transactions`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it('should reject invalid decimals value', async () => {
      const factoryContractId = '0.0.67890'
      const createBondRequest = {
        format: 'hedera',
        accountId: '0.0.12345',
        securityTokenToCreate: {
          name: 'Test Bond',
          symbol: 'TB',
          isin: 'US1234567890',
          decimals: -1, // Invalid value
          isWhiteList: true,
          erc20VotesActivated: false,
          isControllable: true,
          arePartitionsProtected: false,
          isMultiPartition: false,
          clearingActive: true,
          internalKycActivated: true,
          currency: 'USD',
          numberOfUnits: '1000',
          nominalValue: '100',
          startingDate: '2025-01-01',
          maturityDate: '2030-01-01',
          configId: 'config-123',
          configVersion: 1,
          resolver: '0xabcdef1234567890',
          externalPausesIds: [],
          externalControlListsIds: [],
          externalKycListsIds: [],
          diamondOwnerAccount: '0.0.54321',
          complianceId: 'compliance-001',
          identityRegistryId: 'identity-001',
          proceedRecipientIds: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: {
          regulationType: 1,
          regulationSubType: 1,
          isCountryControlListWhiteList: true,
          countries: 'US',
          info: 'Test bond',
        },
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/factories/${factoryContractId}/bond-transactions`)
        .send(createBondRequest)
        .expect(400)
    })

    it('should reject invalid coupon rate value', async () => {
      const factoryContractId = '0.0.67890'
      const createBondRequest = {
        format: 'hedera',
        accountId: '0.0.12345',
        securityTokenToCreate: {
          name: 'Test Bond',
          symbol: 'TB',
          isin: 'US1234567890',
          decimals: 2,
          isWhiteList: true,
          erc20VotesActivated: false,
          isControllable: true,
          arePartitionsProtected: false,
          isMultiPartition: false,
          clearingActive: true,
          internalKycActivated: true,
          currency: 'USD',
          numberOfUnits: '1000',
          nominalValue: '100',
          startingDate: '2025-01-01',
          maturityDate: '2030-01-01',
          configId: 'config-123',
          configVersion: 1,
          resolver: '0xabcdef1234567890',
          externalPausesIds: [],
          externalControlListsIds: [],
          externalKycListsIds: [],
          diamondOwnerAccount: '0.0.54321',
          complianceId: 'compliance-001',
          identityRegistryId: 'identity-001',
          proceedRecipientIds: [],
          proceedRecipientsData: [],
        },
        factoryRegulationData: {
          regulationType: 1,
          regulationSubType: 1,
          isCountryControlListWhiteList: true,
          countries: 'US',
          info: 'Test bond',
        },
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/factories/${factoryContractId}/bond-transactions`)
        .send(createBondRequest)
        .expect(400)
    })
  })
})
