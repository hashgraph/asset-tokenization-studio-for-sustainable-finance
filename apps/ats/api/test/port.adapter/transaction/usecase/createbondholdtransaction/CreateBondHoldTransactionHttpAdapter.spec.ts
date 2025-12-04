// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { CreateBondHoldTransactionRequest } from "@port/transaction/usecase/createbondholdtransaction/model/CreateBondHoldTransactionRequest"

describe("CreateBondHoldTransaction API Integration", () => {
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

  describe("POST /bonds/:bondContractId/holders/:holderAccountId/holds", () => {
    it("should create bond hold transaction with valid data including toAccountId (fixed destination)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: CreateBondHoldTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.123456",
        data: "0x",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should create bond hold transaction without toAccountId (flexible destination)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039" // TO: destination account for the hold
      const createBondHoldRequest: Omit<CreateBondHoldTransactionRequest, "toAccountId"> = {
        format: "hedera",
        accountId: "0.0.5466269", // Transaction signer (holds their own tokens)
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.123456", // Who can execute/release the hold
        data: "0x",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should create bond hold transaction without partition (using default)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: Omit<CreateBondHoldTransactionRequest, "partition"> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.123456",
        data: "0x",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should create bond hold transaction without data (using default)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: Omit<CreateBondHoldTransactionRequest, "data"> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.123456",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
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

        const createBondHoldRequest: CreateBondHoldTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          escrowAccountId: "0.0.123456",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
          .send(createBondHoldRequest)
          .expect(201)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const createBondHoldRequest: CreateBondHoldTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          amount: "1000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          escrowAccountId: "0.0.123456",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
          .send(createBondHoldRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: CreateBondHoldTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${invalidBondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(500)
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest = {
        accountId: "0.0.5466269",
        amount: "1000",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(400)
    })

    it("should return 400 for missing amount", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: Partial<CreateBondHoldTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(400)
    })

    it("should return 400 for missing expirationTimestamp", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: Partial<CreateBondHoldTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        escrowAccountId: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(400)
    })

    it("should return 400 for missing escrowAccountId", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest: Partial<CreateBondHoldTransactionRequest> = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(400)
    })

    it("should return 400 for invalid amount (non-numeric string)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "invalid-amount",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        escrowAccountId: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(400)
    })

    it("should return 400 for invalid expirationTimestamp (non-date string)", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const createBondHoldRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        amount: "1000",
        expirationTimestamp: "invalid-timestamp",
        escrowAccountId: "0.0.123456",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .send(createBondHoldRequest)
        .expect(400)
    })
  })
})
