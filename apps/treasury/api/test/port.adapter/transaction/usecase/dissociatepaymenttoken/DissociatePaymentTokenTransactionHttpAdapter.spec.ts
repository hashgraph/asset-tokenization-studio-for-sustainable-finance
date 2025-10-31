// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("DissociatePaymentTokenTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()

    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
  })

  afterAll(async () => {
    await container.stop()
  })

  describe("POST /treasuries/:treasuryContractId/payment-tokens/:paymentTokenContractId/dissociate", () => {
    it("should dissociate payment token with valid treasuryContractId and paymentTokenContractId", async () => {
      const treasuryContractId = "0.0.123456"
      const paymentTokenContractId = "0.0.789012"

      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds and paymentTokenContractIds", async () => {
      const testCases = [
        {
          treasuryContractId: "0.0.123456",
          paymentTokenContractId: "0.0.789012",
        },
        {
          treasuryContractId: "0.0.654321",
          paymentTokenContractId: "0.0.210987",
        },
        {
          treasuryContractId: "0.0.999999",
          paymentTokenContractId: "0.0.111111",
        },
      ]

      for (const { treasuryContractId, paymentTokenContractId } of testCases) {
        const dissociateRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
          .send(dissociateRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const paymentTokenContractId = "0.0.789012"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const dissociateRequest = {
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
          .send(dissociateRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
        expect(typeof response.body.unsignedTx).toBe("string")
      }
    })

    it("should reject invalid treasuryContractId format", async () => {
      const invalidTreasuryContractId = "invalid-treasury-contract-id"
      const paymentTokenContractId = "0.0.789012"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${invalidTreasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(500)
    })

    it("should reject invalid paymentTokenContractId format", async () => {
      const treasuryContractId = "0.0.123456"
      const invalidPaymentTokenContractId = "invalid-payment-token-contract-id"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${invalidPaymentTokenContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should return 400 for invalid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const paymentTokenContractId = "0.0.789012"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const dissociateRequest = {
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
          .send(dissociateRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields in body", async () => {
      const treasuryContractId = "0.0.123456"
      const paymentTokenContractId = "0.0.789012"
      const invalidRequests = [{}, { format: "hedera" }, { accountId: "0.0.123456789" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should handle requests without accountId", async () => {
      const treasuryContractId = "0.0.123456"
      const paymentTokenContractId = "0.0.789012"

      const dissociateRequest = {
        format: "ethereum",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle missing treasuryContractId in path", async () => {
      const paymentTokenContractId = "0.0.789012"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/treasuries//payment-tokens/${paymentTokenContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(404)
    })

    it("should handle missing paymentTokenContractId in path", async () => {
      const treasuryContractId = "0.0.123456"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens//dissociate`)
        .send(dissociateRequest)
        .expect(404)
    })

    it("should generate unsigned transaction for non-existent paymentTokenContractId", async () => {
      const treasuryContractId = "0.0.123456"
      const nonExistentPaymentTokenContractId = "0.0.999999"

      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${nonExistentPaymentTokenContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
  })
})
