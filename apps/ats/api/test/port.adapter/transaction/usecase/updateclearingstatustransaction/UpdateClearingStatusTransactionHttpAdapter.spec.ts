// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { ClearingActionType } from "@app/transaction/clearing/updateclearingholdtransaction/service/model/ClearingActionType"
import { ClearingOperationType } from "@app/transaction/clearing/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"

describe("UpdateClearingStatusTransaction API Integration", () => {
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

  describe("PATCH /bonds/:bondContractId/holders/:holderAccountId/clearings/:clearingId", () => {
    it("should update clearing status with APPROVE action and valid request data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const updateClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        action: ClearingActionType.APPROVE,
        operationType: ClearingOperationType.HOLD,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
        .send(updateClearingRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should update clearing status with RECLAIM action and valid request data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const updateClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        action: ClearingActionType.RECLAIM,
        operationType: ClearingOperationType.HOLD,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
        .send(updateClearingRequest)
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
        const updateClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action: ClearingActionType.APPROVE,
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
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
        const updateClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action: ClearingActionType.APPROVE,
          operationType: ClearingOperationType.HOLD,
        }

        await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const invalidRequests = [
        {},
        { format: "hedera" },
        { format: "hedera", accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc" },
        {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x72657365727665640000000000000000",
        },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should return 400 for invalid action type", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const invalidActions = ["CANCEL", "DELETE", "REJECT", "INVALID", "approve", "reclaim"]

      for (const action of invalidActions) {
        const updateClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action,
          operationType: ClearingOperationType.HOLD,
        }

        await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(400)
      }
    })

    it("should handle update clearing with optional partition field omitted", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const updateClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        action: ClearingActionType.APPROVE,
        operationType: ClearingOperationType.HOLD,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
        .send(updateClearingRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different partition values for APPROVE action", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
        "0x64656661756c7400000000000000000000000000000000000000000000000000",
      ]

      for (const partition of partitions) {
        const updateClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition,
          action: ClearingActionType.APPROVE,
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different partition values for RECLAIM action", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
      ]

      for (const partition of partitions) {
        const updateClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition,
          action: ClearingActionType.RECLAIM,
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different clearingId values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingIds = [1, 2, 3, 100, 9999]

      for (const clearingId of clearingIds) {
        const updateClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action: ClearingActionType.APPROVE,
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle both action types for the same clearing", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const actions = [ClearingActionType.APPROVE, ClearingActionType.RECLAIM]

      for (const action of actions) {
        const updateClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action,
          operationType: ClearingOperationType.HOLD,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should update clearing redeem status with APPROVE action", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const updateClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        action: ClearingActionType.APPROVE,
        operationType: ClearingOperationType.REDEEM,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
        .send(updateClearingRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should update clearing redeem status with RECLAIM action", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const updateClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        action: ClearingActionType.RECLAIM,
        operationType: ClearingOperationType.REDEEM,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
        .send(updateClearingRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle both HOLD and REDEEM operation types", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const operationTypes = [ClearingOperationType.HOLD, ClearingOperationType.REDEEM]

      for (const operationType of operationTypes) {
        const updateClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action: ClearingActionType.APPROVE,
          operationType,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different formats for REDEEM operation type", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const clearingId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const updateClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          action: ClearingActionType.APPROVE,
          operationType: ClearingOperationType.REDEEM,
        }

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/${clearingId}/hold`)
          .send(updateClearingRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })
  })
})
