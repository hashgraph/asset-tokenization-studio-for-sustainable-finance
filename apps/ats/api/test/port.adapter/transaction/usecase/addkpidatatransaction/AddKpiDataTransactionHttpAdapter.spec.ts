// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("AddKpiDataTransaction API Integration", () => {
  let app: INestApplication

  const BOND_CONTRACT_ID = "0.0.67890"
  const ACCOUNT_ID = "0.0.5466269"
  const PROJECT_ADDRESS = "0xcdc1c3a95ec40007cf92e3db67617063a177f54c"
  const DATE = "1748908800"
  const VALUE = "105"

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

  describe("POST /bonds/:bondContractId/kpi/data-transactions", () => {
    it("should return 201 with unsignedTx for valid hedera request", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, date: DATE, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should return 201 with unsignedTx for valid ethereum request", async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "ethereum", accountId: ACCOUNT_ID, date: DATE, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 201 for different numeric KPI values", async () => {
      const kpiValues = ["1", "100", "999999999999999999"]

      for (const value of kpiValues) {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
          .send({ format: "hedera", accountId: ACCOUNT_ID, date: DATE, value, projectAddress: PROJECT_ADDRESS })
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing format", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ accountId: ACCOUNT_ID, date: DATE, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(400)
    })

    it("should return 400 for missing accountId", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "hedera", date: DATE, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(400)
    })

    it("should return 400 for missing date", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(400)
    })

    it("should return 400 for missing value", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, date: DATE, projectAddress: PROJECT_ADDRESS })
        .expect(400)
    })

    it("should return 400 for missing projectAddress", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, date: DATE, value: VALUE })
        .expect(400)
    })

    it("should return 400 for invalid format", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({ format: "invalid", accountId: ACCOUNT_ID, date: DATE, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(400)
    })

    it("should return 400 for empty request body", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${BOND_CONTRACT_ID}/kpi/data-transactions`)
        .send({})
        .expect(400)
    })

    it("should return 500 for invalid bondContractId", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/invalid-id/kpi/data-transactions`)
        .send({ format: "hedera", accountId: ACCOUNT_ID, date: DATE, value: VALUE, projectAddress: PROJECT_ADDRESS })
        .expect(500)
    })
  })
})
