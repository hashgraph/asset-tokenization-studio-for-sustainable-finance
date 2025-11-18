// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondClearingTransferPersistence } from "@port/bond/persistence/model/BondClearingTransferPersistence"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"

describe("GetClearingTransferHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalClearingTransferRepository: Repository<BondClearingTransferPersistence>

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
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    internalClearingTransferRepository = app.get(getRepositoryToken(BondClearingTransferPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders/:holderAccountId/clearings/:clearingId/transfer", () => {
    it("should return 404 Http error when clearing is not found", async () => {
      const bondContractId = "0.0.1234567"
      const holderAccountId = "0.0.7654321"
      const clearingId = 999

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/transfer`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return clearing transfer details", async () => {
      const expirationDate = new Date("2025-12-31")
      const createdAt = new Date("2025-01-01")
      const updatedAt = new Date("2025-01-02")

      const clearing = await internalClearingTransferRepository.save({
        id: 1,
        bondContractId: "0.0.6823801",
        holderAccountId: "0.0.1111111",
        partition: "default",
        amount: "1000000000000000000",
        expirationDate: expirationDate,
        status: ClearingStatus.PENDING,
        toAccountId: "0.0.2222222",
        data: "0x",
        operatorData: "0x",
        operatorAccountId: "0.0.3333333",
        createdAt: createdAt,
        updatedAt: updatedAt,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${clearing.bondContractId}/holders/${clearing.holderAccountId}/clearings/${clearing.id}/transfer`,
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
        toAddress: clearing.toAccountId,
        data: clearing.data,
        operatorData: clearing.operatorData,
        operator: clearing.operatorAccountId,
        createdAt: clearing.createdAt.toISOString(),
        updatedAt: clearing.updatedAt.toISOString(),
      })
    })
  })
})
