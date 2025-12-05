// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { ClearingOperationType } from "@app/transaction/clearing/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"

describe("CancelClearingTransaction API Integration", () => {
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

  describe("DELETE /bonds/:bondContractId/holders/:holderAccountId/clearings/:clearingId", () => {
    it("should cancel clearing transaction with valid request data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const cancelClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        operationType: ClearingOperationType.HOLD,
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
        .send(cancelClearingRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const cancelClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const cancelClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          operationType: ClearingOperationType.HOLD,
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const invalidRequests = [{}, { format: "hedera" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should cancel clearing with optional partition field omitted", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const cancelClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        operationType: ClearingOperationType.HOLD,
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
        .send(cancelClearingRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different partition values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
        "0x64656661756c7400000000000000000000000000000000000000000000000000",
      ]

      for (const partition of partitions) {
        const cancelClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition,
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different clearingId values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingIds = [1, 2, 3, 100, 9999]

      for (const clearingId of clearingIds) {
        const cancelClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different bondContractId values", async () => {
      const bondContractIds = ["0.0.12345", "0.0.67890", "0.0.99999"]
      const holderAccountId = "0.0.7654321"
      const clearingId = 1

      for (const bondContractId of bondContractIds) {
        const cancelClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different holderAccountId values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountIds = ["0.0.111111", "0.0.222222", "0.0.333333"]
      const clearingId = 1

      for (const holderAccountId of holderAccountIds) {
        const cancelClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle cancel clearing with both formats sequentially", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const cancelClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}`)
          .send(cancelClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
        expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
      }
    })
  })
})
