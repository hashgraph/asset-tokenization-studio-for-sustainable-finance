// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { AddProceedRecipientTransactionRequest } from "@port/transaction/usecase/addproceedrecipienttransaction/model/AddProceedRecipientTransactionRequest"

describe("AddProceedRecipientTransaction API Integration", () => {
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

  describe("POST /bonds/:bondContractId/proceeds-recipients", () => {
    it("should add proceed recipient with valid data", async () => {
      const bondContractId = "0.0.67890"
      const addProceedRecipientRequest: AddProceedRecipientTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        data: "0x1234567890abcdef",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should add proceed recipient without data field (defaults to 0x)", async () => {
      const bondContractId = "0.0.67890"
      const addProceedRecipientRequest: Partial<AddProceedRecipientTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
        proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]
      const proceedRecipientAddresses = [
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
      ]

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i]
        const proceedRecipientAddress = proceedRecipientAddresses[i]

        const addProceedRecipientRequest: AddProceedRecipientTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          proceedRecipientAddress: proceedRecipientAddress,
          data: "0x",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
          .send(addProceedRecipientRequest)
          .expect(201)
      }
    })

    it("should handle empty data string (0x)", async () => {
      const bondContractId = "0.0.67890"
      const addProceedRecipientRequest: AddProceedRecipientTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        data: "0x",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const addProceedRecipientRequest: AddProceedRecipientTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
          .send(addProceedRecipientRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const addProceedRecipientRequest: AddProceedRecipientTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        proceedRecipientAddress: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${invalidBondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(500)
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const addProceedRecipientRequest = {
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(400)
    })

    it("should return 400 for request without accountId", async () => {
      const bondContractId = "0.0.67890"
      const addProceedRecipientRequest: Partial<AddProceedRecipientTransactionRequest> = {
        format: "hedera",
        proceedRecipientAddress: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(400)
    })

    it("should return 400 for request without proceedRecipientAddress", async () => {
      const bondContractId = "0.0.67890"
      const addProceedRecipientRequest: Partial<AddProceedRecipientTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send(addProceedRecipientRequest)
        .expect(400)
    })
  })
})
