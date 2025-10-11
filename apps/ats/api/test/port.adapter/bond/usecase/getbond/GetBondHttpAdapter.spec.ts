// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { CONTROLLERS, PROVIDERS } from '../../../../../src/Components'
import { SharedModule } from '@hashgraph/green-bonds-shared-core'
import { PostgreSqlContainer } from '../../../../shared/containers/PostgresqlContainer'
import { PostgresModule } from '@config/PostgresModule'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BondPersistence } from '@port/bond/persistence/model/BondPersistence'

describe('GetBondHttpAdapter API Integration', () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalBondRepository: Repository<BondPersistence>

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
    internalBondRepository = app.get(getRepositoryToken(BondPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('GET /:bondContractId', () => {
    it('should return 404 Http error when bond is not found', async () => {
      const bondContractId = '0.0.1234567'

      await request(app.getHttpServer()).get(`/api/v1/ats/bonds/${bondContractId}`).send().expect(HttpStatus.NOT_FOUND)
    })

    it('should return bond details', async () => {
      const startingDate = new Date('2025-01-01')
      const maturityDate = new Date('2030-01-01')

      const bond = await internalBondRepository.save({
        contractId: '0.0.6823801',
        treasuryId: '0.0.6823801',
        kpiId: '0.0.6823801',
        name: 'Green Bond',
        symbol: 'GBND',
        decimals: 18,
        currency: 'USD',
        nominalValue: '1000',
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: '1000000',
        isin: 'US1234567890',
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        id: bond.id,
        contractId: bond.contractId,
        treasuryId: bond.treasuryId,
        kpiId: bond.kpiId,
        name: bond.name,
        symbol: bond.symbol,
        decimals: bond.decimals,
        currency: bond.currency,
        nominalValue: bond.nominalValue,
        startingDate: bond.startingDate.toISOString(),
        maturityDate: bond.maturityDate.toISOString(),
        maxSupply: bond.maxSupply,
        isin: bond.isin,
      })
    })
  })
})
