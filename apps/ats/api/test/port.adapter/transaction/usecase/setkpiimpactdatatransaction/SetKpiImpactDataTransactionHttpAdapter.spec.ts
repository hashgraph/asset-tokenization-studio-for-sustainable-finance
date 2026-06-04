// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("SetKpiImpactDataTransaction API Integration", () => {
  let app: INestApplication

  const BOND_CONTRACT_ID = "0.0.67890"
  const ACCOUNT_ID = "0.0.5466269"

  const validImpactData = {
    maxDeviationCap: "120",
    baseLine: "100",
    maxDeviationFloor: "80",
    impactDataDecimals: 2,
    adjustmentPrecision: "10000",
  }

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
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /bonds/:bondContractId/kpi/impact-data-transactions", () => {
    it("should return 201 with unsignedTx for valid hedera request", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, impactData: validImpactData })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should return 201 with unsignedTx for valid ethereum request", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "ethereum", accountId: ACCOUNT_ID, impactData: validImpactData })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 201 with different valid numeric values", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({
          format: "hedera",
          accountId: ACCOUNT_ID,
          impactData: {
            maxDeviationCap: "1500",
            baseLine: "1000",
            maxDeviationFloor: "500",
            impactDataDecimals: 0,
            adjustmentPrecision: "100000",
          },
        })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 400 for missing format", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ accountId: ACCOUNT_ID, impactData: validImpactData })
        .expect(400)
    })

    it("should return 400 for missing accountId", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "hedera", impactData: validImpactData })
        .expect(400)
    })

    it("should return 400 for missing impactData", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID })
        .expect(400)
    })

    it("should return 400 for missing impactData.baseLine", async () => {
      const { baseLine: _, ...withoutBaseLine } = validImpactData
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, impactData: withoutBaseLine })
        .expect(400)
    })

    it("should return 400 for missing impactData.impactDataDecimals", async () => {
      const { impactDataDecimals: _, ...withoutDecimals } = validImpactData
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, impactData: withoutDecimals })
        .expect(400)
    })

    it("should return 400 for invalid format", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({ format: "invalid", accountId: ACCOUNT_ID, impactData: validImpactData })
        .expect(400)
    })

    it("should return 400 for empty request body", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/impact-data-transactions`)
        .send({})
        .expect(400)
    })

    it("should return 500 for invalid bondContractId", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/invalid-id/kpi/impact-data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, impactData: validImpactData })
        .expect(500)
    })
  })
})
