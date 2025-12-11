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

describe("GetClearingsRedeemHttpAdapter API Integration", () => {
  let app: INestApplication
  let internalClearingRedeemRepository: Repository<BondClearingRedeemPersistence>
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
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders/:holderAccountId/clearings/redeem", () => {
    it("should return empty paginated result when holder has no redeem clearings", async () => {
      const bondContractId = "0.0.1234567"
      const holderAccountId = "0.0.7654321"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/redeem`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      })
    })

    it("should return paginated list of redeem clearings", async () => {
      const expirationDate = new Date("2025-12-31")
      const createdAt = new Date("2025-01-01")
      const updatedAt = new Date("2025-01-02")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bondContractId = `0.0.${timestamp}`
      const holderAccountId = `0.0.${timestamp + 1}`

      await internalClearingRedeemRepository.save({
        id: 1,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
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

      await internalClearingRedeemRepository.save({
        id: 2,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "2000000000000000000",
        expirationDate: expirationDate,
        status: ClearingStatus.APPROVED,
        data: "0x",
        operatorData: "0x",
        operatorAccountId: "0.0.3333333",
        createdAt: createdAt,
        updatedAt: updatedAt,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/redeem`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.items[0]).toMatchObject({
        id: 1,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "1000000000000000000",
        status: ClearingStatus.PENDING,
      })
    })

    it("should respect pagination parameters", async () => {
      const expirationDate = new Date("2025-12-31")
      const createdAt = new Date("2025-01-01")
      const updatedAt = new Date("2025-01-02")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bondContractId = `0.0.${timestamp}`
      const holderAccountId = `0.0.${timestamp + 1}`

      for (let i = 1; i <= 5; i++) {
        await internalClearingRedeemRepository.save({
          id: i,
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "default",
          amount: `${i}000000000000000000`,
          expirationDate: expirationDate,
          status: ClearingStatus.PENDING,
          data: "0x",
          operatorData: "0x",
          operatorAccountId: "0.0.3333333",
          createdAt: createdAt,
          updatedAt: updatedAt,
        })
      }

      // Request page 1 with limit 2
      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/redeem?page=1&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(2)

      // Request page 2 with limit 2
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/redeem?page=2&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response2.body.items).toHaveLength(2)
      expect(response2.body.page).toBe(2)

      // Verify that different pages return different clearing IDs
      const page1Ids = response.body.items.map((c: any) => c.id).sort()
      const page2Ids = response2.body.items.map((c: any) => c.id).sort()
      expect(page1Ids).not.toEqual(page2Ids)
    })
  })
})
