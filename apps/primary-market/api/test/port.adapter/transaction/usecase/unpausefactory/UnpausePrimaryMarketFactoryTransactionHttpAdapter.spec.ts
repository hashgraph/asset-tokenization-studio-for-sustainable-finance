// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { UnpausePrimaryMarketFactoryTransactionRequest } from "@port/transaction/usecase/unpauseprimarymarketfactorytransaction/model/UnpausePrimaryMarketFactoryTransactionRequest"

describe("UnpausePrimaryMarketFactoryTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer

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
    app.setGlobalPrefix("api/v1/primary-market")
    app.useLogger(false)
    await app.init()
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /factories/:marketContractId/unpause", () => {
    it("should unpause factory with valid data", async () => {
      const marketContractId = "0.0.7247643"
      const unpauseFactoryRequest: UnpausePrimaryMarketFactoryTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-market/factories/${marketContractId}/unpause`)
        .send(unpauseFactoryRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.7247643"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const unpauseFactoryRequest: UnpausePrimaryMarketFactoryTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/primary-market/factories/${marketContractId}/unpause`)
          .send(unpauseFactoryRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const marketContractId = "0.0.7247643"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const unpauseFactoryRequest: UnpausePrimaryMarketFactoryTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/primary-market/factories/${marketContractId}/unpause`)
          .send(unpauseFactoryRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.7247643"
      const unpauseFactoryRequest = {}

      await request(app.getHttpServer())
        .post(`/api/v1/primary-market/factories/${marketContractId}/unpause`)
        .send(unpauseFactoryRequest)
        .expect(400)
    })
  })
})
