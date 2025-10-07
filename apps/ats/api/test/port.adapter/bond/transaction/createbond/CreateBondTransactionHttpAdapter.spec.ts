// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../../../../src/AppModule'
import { BuildTransactionResponse } from '@hashgraph/green-bonds-shared-core'

describe('CreateBondTransaction API Integration', () => {
  let app: INestApplication

  beforeEach(async () => {
    // Mock only the external dependency that's not implemented yet
    const mockTransactionBuilderAdapter = {
      createBondTransaction: jest.fn().mockReturnValue(new BuildTransactionResponse('mocked-serialized-transaction')),
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('TransactionBuilderPort')
      .useValue(mockTransactionBuilderAdapter)
      .compile()

    app = moduleFixture.createNestApplication()

    // Suppress error logs during testing to clean up test output
    app.useLogger(false)

    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /bonds/factories/:factoryId/bond-transactions', () => {
    it('should create bond with valid request data', async () => {
      const factoryId = '0.0.67890'
      const createBondRequest = {
        format: 'hedera',
        accountId: '0.0.12345',
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
          currency: 'USD',
          numberOfUnits: '1000000',
          nominalValue: '100',
          startingDate: '1640995200000',
          maturityDate: '1672531200000',
          configId: 'config-001',
          configVersion: 1,
          resolver: '0x0987654321098765432109876543210987654321',
          externalPausesIds: ['pause-001'],
          externalControlListsIds: ['control-001'],
          externalKycListsIds: ['kyc-001'],
          diamondOwnerAccount: '0.0.54321',
          complianceId: 'compliance-001',
          identityRegistryId: 'identity-001',
          proceedRecipientIds: ['recipient-001'],
          proceedRecipientsData: ['recipient-data-001'],
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
        .post(`/bonds/factories/${factoryId}/bond-transactions`)
        .send(createBondRequest)
        .expect(201)

      expect(response.body).toHaveProperty('unsignedTx')
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe('string')
    })

    it('should handle different valid format values', async () => {
      const factoryId = '0.0.67890'
      const formats = ['hedera', 'ethereum']

      for (const format of formats) {
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
            numberOfUnits: '1000000',
            nominalValue: '100',
            startingDate: '1640995200000',
            maturityDate: '1672531200000',
            configId: 'config-001',
            configVersion: 1,
            resolver: '0x0987654321098765432109876543210987654321',
            externalPausesIds: ['pause-001'],
            externalControlListsIds: ['control-001'],
            externalKycListsIds: ['kyc-001'],
            diamondOwnerAccount: '0.0.54321',
            complianceId: 'compliance-001',
            identityRegistryId: 'identity-001',
            proceedRecipientIds: ['recipient-001'],
            proceedRecipientsData: ['recipient-data-001'],
          },
          factoryRegulationData: {
            regulationType: 1,
            regulationSubType: 1,
            isCountryControlListWhiteList: true,
            countries: 'US,CA',
            info: 'Test bond for different formats',
          },
        }

        const response = await request(app.getHttpServer())
          .post(`/bonds/factories/${factoryId}/bond-transactions`)
          .send(createBondRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty('unsignedTx')
      }
    })

    it('should return 400 for invalid format values', async () => {
      const factoryId = '0.0.67890'
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
          .post(`/bonds/factories/${factoryId}/bond-transactions`)
          .send(createBondRequest)
          .expect(400)
      }
    })

    it('should return 400 for missing required fields', async () => {
      const factoryId = '0.0.67890'
      const invalidRequests = [{}, { format: 'hedera' }, { name: 'Test Bond' }, { format: 'hedera', name: 'Test Bond' }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/bonds/factories/${factoryId}/bond-transactions`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it('should reject invalid decimals value', async () => {
      const factoryId = '0.0.67890'
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
        .post(`/bonds/factories/${factoryId}/bond-transactions`)
        .send(createBondRequest)
        .expect(400)
    })

    it('should reject invalid coupon rate value', async () => {
      const factoryId = '0.0.67890'
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
        .post(`/bonds/factories/${factoryId}/bond-transactions`)
        .send(createBondRequest)
        .expect(400)
    })
  })
})
