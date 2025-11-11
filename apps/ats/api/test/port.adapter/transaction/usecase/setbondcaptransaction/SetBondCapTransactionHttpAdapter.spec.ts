// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { SetBondCapTransactionRequest } from "@port/transaction/usecase/setbondcaptransaction/model/SetBondCapTransactionRequest"

describe("SetBondCapTransaction API Integration", () => {
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
    app.setGlobalPrefix("api/v1/ats")
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

  describe("POST /bonds/:bondContractId/cap", () => {
    it("should set bond cap with valid data", async () => {
      const bondContractId = "0.0.67890"
      const setBondCapRequest: SetBondCapTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        newMaxSupply: "2000000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
        .send(setBondCapRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]
      const maxSupplies = ["1000000", "3000000"]

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i]
        const newMaxSupply = maxSupplies[i]

        const setBondCapRequest: SetBondCapTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          newMaxSupply: newMaxSupply,
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
          .send(setBondCapRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const setBondCapRequest: SetBondCapTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          newMaxSupply: "1000000",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
          .send(setBondCapRequest)
          .expect(400)
      }
    })

    it("should return 400 for invalid newMaxSupply (not a number string)", async () => {
      const bondContractId = "0.0.67890"
      const setBondCapRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        newMaxSupply: "not-a-number",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
        .send(setBondCapRequest)
        .expect(400)
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const setBondCapRequest = {
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
        .send(setBondCapRequest)
        .expect(400)
    })

    it("should accept large cap values", async () => {
      const bondContractId = "0.0.67890"
      const setBondCapRequest: SetBondCapTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        newMaxSupply: "999999999999999999999999",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
        .send(setBondCapRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should accept zero as cap value", async () => {
      const bondContractId = "0.0.67890"
      const setBondCapRequest: SetBondCapTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        newMaxSupply: "0",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/cap`)
        .send(setBondCapRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })
  })
})
