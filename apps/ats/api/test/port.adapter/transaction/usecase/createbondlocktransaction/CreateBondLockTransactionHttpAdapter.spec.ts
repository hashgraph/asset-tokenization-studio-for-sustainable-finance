// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { CreateBondLockTransactionRequest } from "@port/transaction/usecase/createbondlocktransaction/model/CreateBondLockTransactionRequest"

describe("CreateBondLockTransaction API Integration", () => {
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

  describe("POST /bonds/:bondContractId/holders/:holderAccountId/locks", () => {
    it("should create bond lock transaction with valid data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest: CreateBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should create bond lock transaction without partition (using default)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest: Omit<CreateBondLockTransactionRequest, "partition"> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
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

        const createBondLockRequest: CreateBondLockTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
          .send(createBondLockRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const createBondLockRequest: CreateBondLockTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
          .send(createBondLockRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest: CreateBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${invalidBondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(500)
    })

    it("should return 500 for invalid holderAccountId", async () => {
      const bondContractId = "0.0.67890"
      const invalidHolderAccountId = "invalid-holder"
      const createBondLockRequest: CreateBondLockTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${invalidHolderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(500)
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest = {
        accountId: "0.0.5466269",
        amount: "1000",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(400)
    })

    it("should return 400 for missing amount", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest: Partial<CreateBondLockTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(400)
    })

    it("should return 400 for missing expirationTimestamp", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest: Partial<CreateBondLockTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(400)
    })

    it("should return 400 for invalid amount (non-numeric string)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "invalid-amount",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(400)
    })

    it("should return 400 for invalid expirationTimestamp (non-numeric string)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondLockRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: "invalid-timestamp",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send(createBondLockRequest)
        .expect(400)
    })
  })
})
