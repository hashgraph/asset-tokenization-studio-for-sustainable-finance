// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { ReleaseBondLockTransactionRequest } from "@port/transaction/usecase/releasebondlocktransaction/model/ReleaseBondLockTransactionRequest"

describe("ReleaseBondLockTransaction API Integration", () => {
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

  describe("DELETE /bonds/:bondContractId/holders/:holderAccountId/locks", () => {
    it("should release bond lock transaction with valid data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lockId: "1",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should release bond lock transaction with partition", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lockId: "1",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(200)

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

        const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          lockId: `${i + 1}`,
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
          .send(releaseBondLockRequest)
          .expect(200)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          lockId: "1",
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
          .send(releaseBondLockRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lockId: "1",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${invalidBondContractId}/holders/${holderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(500)
    })

    it("should return 500 for invalid holderAccountId", async () => {
      const bondContractId = "0.0.67890"
      const invalidHolderAccountId = "invalid-holder"
      const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lockId: "1",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${invalidHolderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(500)
    })

    it("should return 400 for missing required field lockId", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const releaseBondLockRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(400)
    })

    it("should return 400 for invalid lockId (non-numeric string)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const releaseBondLockRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lockId: "invalid-lock-id",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(400)
    })

    it("should release locks with different lockIds successfully", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const lockIds = ["1", "2", "3", "100"]

      for (const lockId of lockIds) {
        const releaseBondLockRequest: ReleaseBondLockTransactionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          lockId,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
          .send(releaseBondLockRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should accept request without accountId", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const releaseBondLockRequest: Partial<ReleaseBondLockTransactionRequest> = {
        format: "ethereum",
        lockId: "1",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(releaseBondLockRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })
  })
})
