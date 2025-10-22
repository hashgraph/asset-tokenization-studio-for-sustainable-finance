// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { SetBondDocumentTransactionRequest } from "@port/transaction/usecase/setbonddocumenttransaction/model/SetBondDocumentTransactionRequest"

describe("CreateBondTransaction API Integration", () => {
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

  describe("POST /bonds/:bondContractId/documents/:documentId", () => {
    it("should add bond document with valid data", async () => {
      const bondContractId = "0.0.67890"
      const documentId = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      const setDocumentRequest: SetBondDocumentTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        uri: "document-uri",
        hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`)
        .send(setDocumentRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]
      const documentIds = [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ]

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i]
        const documentId = documentIds[i]

        const setDocumentRequest: SetBondDocumentTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          uri: "document-uri",
          hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`)
          .send(setDocumentRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const documentId = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const setDocumentRequest: SetBondDocumentTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          uri: "document-uri",
          hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`)
          .send(setDocumentRequest)
          .expect(400)
      }
    })

    it("should return 400 for invalid name", async () => {
      const bondContractId = "0.0.67890"
      const documentId = "invalid name"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const setDocumentRequest: SetBondDocumentTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          uri: "document-uri",
          hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`)
          .send(setDocumentRequest)
          .expect(400)
      }
    })

    it("should return 400 for invalid hash", async () => {
      const bondContractId = "0.0.67890"
      const documentId = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const setDocumentRequest: SetBondDocumentTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          uri: "document-uri",
          hash: "invalid hash",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`)
          .send(setDocumentRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const documentId = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      const setDocumentRequest = {
        accountId: "0.0.5466269",
        hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`)
        .send(setDocumentRequest)
        .expect(400)
    })
  })
})
