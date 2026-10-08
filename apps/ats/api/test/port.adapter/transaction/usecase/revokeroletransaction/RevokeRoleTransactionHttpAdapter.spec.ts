// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { RevokeRoleTransactionRequest } from "@port/transaction/usecase/revokerolefactorytransaction/model/RevokeRoleTransactionRequest"

describe("RevokeFactoryRoleTransaction API Integration", () => {
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

  describe("DELETE /factories/:factoryId/roles/:roleId/users/:userAccountId", () => {
    it("should revoke role with valid data", async () => {
      const factoryId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const userAccountId = "0.0.12345"
      const revokeRoleRequest: RevokeRoleTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/factories/${factoryId}/roles/${roleId}/users/${userAccountId}`)
        .send(revokeRoleRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const factoryId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const userAccountId = "0.0.12345"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const revokeRoleRequest: RevokeRoleTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/factories/${factoryId}/roles/${roleId}/users/${userAccountId}`)
          .send(revokeRoleRequest)
          .expect(200)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const factoryId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const userAccountId = "0.0.12345"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const revokeRoleRequest: RevokeRoleTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/factories/${factoryId}/roles/${roleId}/users/${userAccountId}`)
          .send(revokeRoleRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const factoryId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const userAccountId = "0.0.12345"
      const revokeRoleRequest = {
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/factories/${factoryId}/roles/${roleId}/users/${userAccountId}`)
        .send(revokeRoleRequest)
        .expect(400)
    })

    it("should return 400 for request without accountId", async () => {
      const factoryId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const userAccountId = "0.0.12345"
      const revokeRoleRequest: Partial<RevokeRoleTransactionRequest> = {
        format: "hedera",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/factories/${factoryId}/roles/${roleId}/users/${userAccountId}`)
        .send(revokeRoleRequest)
        .expect(400)
    })
  })
})
