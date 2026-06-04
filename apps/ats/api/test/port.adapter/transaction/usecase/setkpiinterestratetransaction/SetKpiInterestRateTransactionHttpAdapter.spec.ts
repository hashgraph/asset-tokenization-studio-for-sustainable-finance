// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("SetKpiInterestRateTransaction API Integration", () => {
  let app: INestApplication

  const BOND_CONTRACT_ID = "0.0.67890"
  const ACCOUNT_ID = "0.0.5466269"

  const validInterestRate = {
    maxRate: "600",
    baseRate: "400",
    minRate: "200",
    startPeriod: "0",
    startRate: "400",
    missedPenalty: "50",
    reportPeriod: "31536000",
    rateDecimals: 2,
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

  describe("POST /bonds/:bondContractId/kpi/interest-rate-transactions", () => {
    it("should return 201 with unsignedTx for valid hedera request", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, interestRate: validInterestRate })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should return 201 with unsignedTx for valid ethereum request", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "ethereum", accountId: ACCOUNT_ID, interestRate: validInterestRate })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 201 when startPeriod is non-zero", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({
          format: "hedera",
          accountId: ACCOUNT_ID,
          interestRate: { ...validInterestRate, startPeriod: "1735689600" },
        })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 400 for missing format", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ accountId: ACCOUNT_ID, interestRate: validInterestRate })
        .expect(400)
    })

    it("should return 400 for missing accountId", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "hedera", interestRate: validInterestRate })
        .expect(400)
    })

    it("should return 400 for missing interestRate", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID })
        .expect(400)
    })

    it("should return 400 for missing interestRate.maxRate", async () => {
      const { maxRate: _, ...withoutMaxRate } = validInterestRate
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, interestRate: withoutMaxRate })
        .expect(400)
    })

    it("should return 400 for missing interestRate.rateDecimals", async () => {
      const { rateDecimals: _, ...withoutDecimals } = validInterestRate
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, interestRate: withoutDecimals })
        .expect(400)
    })

    it("should return 400 for invalid format", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({ format: "invalid", accountId: ACCOUNT_ID, interestRate: validInterestRate })
        .expect(400)
    })

    it("should return 400 for empty request body", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/interest-rate-transactions`)
        .send({})
        .expect(400)
    })

    it("should return 500 for invalid bondContractId", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/invalid-id/kpi/interest-rate-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, interestRate: validInterestRate })
        .expect(500)
    })
  })
})
