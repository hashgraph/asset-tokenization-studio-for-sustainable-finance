// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PauseFactoryTransactionRequest } from "@port/transaction/usecase/pausefactorytransaction/model/PauseFactoryTransactionRequest"

describe("PauseFactoryTransaction API Integration", () => {
  let app: INestApplication
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

  describe("POST /factories/:factoryId/pause", () => {
    it("should pause factory with valid data", async () => {
      const factoryId = "0.0.7247643"
      const pauseFactoryRequest: PauseFactoryTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/factories/${factoryId}/pause`)
        .send(pauseFactoryRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const factoryId = "0.0.7247643"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const pauseFactoryRequest: PauseFactoryTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/factories/${factoryId}/pause`)
          .send(pauseFactoryRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const factoryId = "0.0.7247643"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const pauseFactoryRequest: PauseFactoryTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/factories/${factoryId}/pause`)
          .send(pauseFactoryRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const factoryId = "0.0.7247643"
      const pauseFactoryRequest = {}

      await request(app.getHttpServer())
        .post(`/api/v1/ats/factories/${factoryId}/pause`)
        .send(pauseFactoryRequest)
        .expect(400)
    })
  })
})
