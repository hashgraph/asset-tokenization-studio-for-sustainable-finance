// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("ReleaseHoldTransaction API Integration", () => {
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

  describe("DELETE /bonds/:bondContractId/holders/:holderAccountId/holds/:holdId", () => {
    it("should build release hold transaction with valid request data", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1

      const releaseHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "50",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
        .send(releaseHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle partial release of hold", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 2

      const releaseHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "25", // Partial amount
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
        .send(releaseHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle full release of hold", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 3

      const releaseHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "100", // Full amount
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
        .send(releaseHoldRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle different transaction formats", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const releaseHoldRequest = {
          format: format,
          accountId: "0.0.5466269",
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
          amount: "30",
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
          .send(releaseHoldRequest)
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
        // Missing partition and amount
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
        .send(invalidRequest)
        .expect(400)
    })

    it("should validate amount is a string number", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = 1

      const invalidRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: 50, // Should be string
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
        .send(invalidRequest)
        .expect(400)
    })

    it("should validate holdId is numeric", async () => {
      const bondContractId = "0.0.6974684"
      const holderAccountId = "0.0.1234567"
      const holdId = "invalid-id"

      const releaseHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "50",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`)
        .send(releaseHoldRequest)
        .expect(400)
    })
  })
})
