// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { RedeemBondTransactionRequest } from "@port/transaction/usecase/redeembondtransaction/model/RedeemBondTransactionRequest"

describe("RedeemBondTransaction API Integration", () => {
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

  describe("POST /bonds/:bondContractId/holders/redeem", () => {
    it("should redeem bond transaction with valid data", async () => {
      const bondContractId = "0.0.67890"
      const redeemBondRequest: RedeemBondTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should redeem bond transaction with partition", async () => {
      const bondContractId = "0.0.67890"
      const redeemBondRequest: RedeemBondTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should redeem bond transaction with data field", async () => {
      const bondContractId = "0.0.67890"
      const redeemBondRequest: RedeemBondTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        data: "0x1234567890abcdef",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i]

        const redeemBondRequest: RedeemBondTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
          .send(redeemBondRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const redeemBondRequest: RedeemBondTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
          .send(redeemBondRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const redeemBondRequest: RedeemBondTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${invalidBondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(500)
    })

    it("should return 400 for missing required field amount", async () => {
      const bondContractId = "0.0.67890"
      const redeemBondRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(400)
    })

    it("should return 400 for invalid amount (non-numeric string)", async () => {
      const bondContractId = "0.0.67890"
      const redeemBondRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "invalid-amount",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(400)
    })

    it("should redeem bonds with different amounts successfully", async () => {
      const bondContractId = "0.0.67890"
      const amounts = ["100", "500", "1000", "10000"]

      for (const amount of amounts) {
        const redeemBondRequest: RedeemBondTransactionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          amount,
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
          .send(redeemBondRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should accept request without accountId", async () => {
      const bondContractId = "0.0.67890"
      const redeemBondRequest: Partial<RedeemBondTransactionRequest> = {
        format: "ethereum",
        amount: "1000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/redeem`)
        .send(redeemBondRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })
  })
})
