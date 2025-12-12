// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "@components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondClearingRedeemPersistence } from "@port/clearing/persistence/model/BondClearingRedeemPersistence"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("GetClearingRedeemHttpAdapter API Integration", () => {
  let app: INestApplication
  let internalClearingRedeemRepository: Repository<BondClearingRedeemPersistence>
  let bondRepository: Repository<BondPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    internalClearingRedeemRepository = app.get(getRepositoryToken(BondClearingRedeemPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    await bondRepository.query('DELETE FROM "Bonds"')
  })
  afterEach(async () => {
    if (bondRepository) {
      await bondRepository.query('DELETE FROM "Bonds"')
    }
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders/:holderAccountId/clearings/:clearingId/redeem", () => {
    it("should return 404 Http error when clearing is not found", async () => {
      const bondContractId = "0.0.1234567"
      const holderAccountId = "0.0.7654321"
      const clearingId = 999

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/redeem`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return clearing redeem details", async () => {
      const expirationDate = new Date("2025-12-31")
      const createdAt = new Date("2025-01-01")
      const updatedAt = new Date("2025-01-02")

      await bondRepository.save({
        contractId: "0.0.6823801",
        treasuryId: "0.0.1000001",
        kpiId: "0.0.1000002",
        name: "Test Bond",
        symbol: "TBOND",
        isin: "US1234567890",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000000000000000000",
        nominalValueDecimals: 18,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000000000000000000",
        isPaused: false,
      })

      const clearing = await internalClearingRedeemRepository.save({
        id: 1,
        bondContractId: "0.0.6823801",
        holderAccountId: "0.0.1111111",
        partition: "default",
        amount: "1000000000000000000",
        expirationDate: expirationDate,
        status: ClearingStatus.PENDING,
        data: "0x",
        operatorData: "0x",
        operatorAccountId: "0.0.3333333",
        createdAt: createdAt,
        updatedAt: updatedAt,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${clearing.bondContractId}/holders/${clearing.holderAccountId}/clearings/${clearing.id}/redeem`,
        )
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        id: clearing.id,
        bondContractId: clearing.bondContractId,
        holderAccountId: clearing.holderAccountId,
        partition: clearing.partition,
        amount: clearing.amount,
        expirationDate: clearing.expirationDate.toISOString(),
        status: clearing.status,
        data: clearing.data,
        operatorData: clearing.operatorData,
        operator: clearing.operatorAccountId,
        createdAt: clearing.createdAt.toISOString(),
        updatedAt: clearing.updatedAt.toISOString(),
      })
    })
  })
})
