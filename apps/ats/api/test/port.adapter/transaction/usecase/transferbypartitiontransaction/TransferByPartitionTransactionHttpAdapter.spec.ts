// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { TransferByPartitionTransactionRequest } from "@port/transaction/usecase/transferbypartitiontransaction/model/TransferByPartitionTransactionRequest"

describe("TransferByPartitionTransaction API Integration", () => {
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

  describe("POST /bonds/:bondContractId/holders/:toAccountId/transfers", () => {
    it("should create transfer by partition transaction with valid data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest: TransferByPartitionTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        amount: "1000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should create transfer transaction without partition (using default)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest: Omit<TransferByPartitionTransactionRequest, "partition"> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should create transfer transaction with optional data field", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest: TransferByPartitionTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        data: "0x1234567890abcdef",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]
      const holderAccountIds = [
        "0x0000000000000000000000000000000000003039",
        "0x000000000000000000000000000000000000303a",
      ]

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i]
        const holderAccountId = holderAccountIds[i]

        const transferRequest: TransferByPartitionTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
          .send(transferRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const transferRequest: TransferByPartitionTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
          .send(transferRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest: TransferByPartitionTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${invalidBondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(500)
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest = {
        accountId: "0.0.5466269",
        amount: "1000",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(400)
    })

    it("should return 400 for missing amount", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest: Partial<TransferByPartitionTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(400)
    })

    it("should return 400 for invalid amount (non-numeric string)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const transferRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        toAccountId: "0.0.12345",
        amount: "invalid-amount",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/transfers`)
        .send(transferRequest)
        .expect(400)
    })
  })
})
