// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("ReclaimHoldTransaction API Integration", () => {
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

  describe("DELETE /bonds/:bondContractId/holders/:holderAccountId/holds/:holdId/reclaim", () => {
    it("should build reclaim hold transaction with valid request data", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1

      const reclaimHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
        .send(reclaimHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different transaction formats", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const reclaimHoldRequest = {
          format: format,
          accountId: "0.0.5466269",
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
          .send(reclaimHoldRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should validate required fields", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1

      const invalidRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        // Missing partition
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
        .send(invalidRequest)
        .expect(400)
    })

    it("should validate holdId is numeric", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = "invalid-id"

      const reclaimHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
        .send(reclaimHoldRequest)
        .expect(400)
    })

    it("should not require amount parameter (always full reclaim)", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1

      const reclaimHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        // No amount parameter - reclaim always returns full hold amount
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
        .send(reclaimHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle expired hold reclaim by any account", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 5

      // Different account reclaiming expired hold
      const reclaimHoldRequest = {
        format: "hedera",
        accountId: "0.0.9999999", // Different from holder
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
        .send(reclaimHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle holder reclaiming their own expired hold", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 6

      // Holder reclaiming their own expired hold
      const reclaimHoldRequest = {
        format: "hedera",
        accountId: holderAccountId, // Same as holder
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}/reclaim`)
        .send(reclaimHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
    })
  })
})
