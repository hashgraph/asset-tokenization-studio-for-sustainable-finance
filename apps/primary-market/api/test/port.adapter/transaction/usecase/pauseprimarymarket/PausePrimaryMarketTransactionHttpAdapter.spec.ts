// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PausePrimaryMarketTransactionRequest } from "@port/transaction/usecase/pauseprimarymarket/model/PausePrimaryMarketTransactionRequest"

describe("PausePrimaryMarketTransaction API Integration", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/primary-market")
    app.useLogger(false)
    await app.init()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /primary-markets/:marketContractId/pause", () => {
    it("should pause primary market with valid data", async () => {
      const marketContractId = "0.0.67890"
      const pausePrimaryMarketRequest: PausePrimaryMarketTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-market/primary-markets/${marketContractId}/pause`)
        .send(pausePrimaryMarketRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const pausePrimaryMarketRequest: PausePrimaryMarketTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/primary-market/primary-markets/${marketContractId}/pause`)
          .send(pausePrimaryMarketRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const marketContractId = "0.0.67890"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const pausePrimaryMarketRequest: PausePrimaryMarketTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/primary-market/primary-markets/${marketContractId}/pause`)
          .send(pausePrimaryMarketRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const pausePrimaryMarketRequest = {}

      await request(app.getHttpServer())
        .post(`/api/v1/primary-market/primary-markets/${marketContractId}/pause`)
        .send(pausePrimaryMarketRequest)
        .expect(400)
    })
  })
})
