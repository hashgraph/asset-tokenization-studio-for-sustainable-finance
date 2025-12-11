// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("RenounceRoleTransaction API Integration", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/")
    app.useLogger(false)
    await app.init()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("DELETE /primary-markets/:marketContractId/roles/:roleId", () => {
    it("should create renounce role transaction with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const roleId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const renounceRoleRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/roles/${roleId}`)
        .send(renounceRoleRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const roleId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const renounceRoleRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/roles/${roleId}`)
          .send(renounceRoleRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const roleId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const invalidRequests = [{}, { format: "hedera" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/roles/${roleId}`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject invalid format", async () => {
      const marketContractId = "0.0.67890"
      const roleId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const renounceRoleRequest = {
        format: "invalid",
        accountId: "0.0.12345",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/roles/${roleId}`)
        .send(renounceRoleRequest)
        .expect(400)
    })
  })
})
