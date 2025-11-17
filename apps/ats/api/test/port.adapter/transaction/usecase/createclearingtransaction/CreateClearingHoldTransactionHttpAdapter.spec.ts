// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("CreateClearingHoldTransaction API Integration", () => {
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
    app.useLogger(["error", "warn"])
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

  describe("POST /bonds/:bondContractId/holders/:holderAccountId/clearings", () => {
    it("should create clearing hold transaction with valid request data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const createClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "1000",
        expirationTimestamp: 1735689600000,
        toAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
        escrowAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
        data: "0x1234",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
        .send(createClearingRequest)

      if (response.status !== 201) {
        console.log("Error response:", JSON.stringify(response.body, null, 2))
        console.log("Error status:", response.status)
      }

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const createClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          expirationTimestamp: 1735689600000,
          toAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          escrowAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          data: "0x1234",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
          .send(createClearingRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const createClearingRequest = {
          format,
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          expirationTimestamp: 1735689600000,
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
          .send(createClearingRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const invalidRequests = [
        {},
        { format: "hedera" },
        { format: "hedera", accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc" },
        { format: "hedera", accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc", partition: "0x72657365727665640000000000000000" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should create clearing with optional fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const createClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        amount: "1000",
        expirationTimestamp: 1735689600000,
        escrowAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
        .send(createClearingRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should reject invalid amount value", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const createClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: -100,
        expirationTimestamp: 1735689600000,
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
        .send(createClearingRequest)
        .expect(400)
    })

    it("should reject invalid expirationTimestamp value", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const createClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "1000",
        expirationTimestamp: "invalid-timestamp",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
        .send(createClearingRequest)
        .expect(400)
    })

    it("should handle different partition values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
        "0x64656661756c7400000000000000000000000000000000000000000000000000",
      ]

      for (const partition of partitions) {
        const createClearingRequest = {
          format: "hedera",
          accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
          partition,
          amount: "1000",
          expirationTimestamp: 1735689600000,
          escrowAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
          .send(createClearingRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle large amount values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0.0.7654321"
      const createClearingRequest = {
        format: "hedera",
        accountId: "0xAabbCcDdEeFf0011223344556677889900AaBbCc",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "999999999999999999",
        expirationTimestamp: 1735689600000,
        escrowAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/clearings/hold`)
        .send(createClearingRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })
  })
})
