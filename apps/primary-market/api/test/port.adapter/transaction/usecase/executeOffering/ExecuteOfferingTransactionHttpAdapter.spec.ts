// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("ExecuteOfferingTransaction API Integration", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/")
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
    app.useLogger(false)
    await app.init()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /primary-markets/:marketContractId/offerings/:offeringId", () => {
    it("should execute offering transaction with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const executeOfferingRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        start: "0",
        end: "10",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
        .send(executeOfferingRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const executeOfferingRequest = {
          format: format,
          accountId: "0.0.5466269",
          start: "0",
          end: "10",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
          .send(executeOfferingRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should execute offering with ethereum format (accountId optional)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const executeOfferingRequest = {
        format: "ethereum",
        start: "0",
        end: "1",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
        .send(executeOfferingRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid start and end values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const indexes = [
        { start: "0", end: "10" },
        { start: "10", end: "20" },
        { start: "20", end: "30" },
      ]

      for (const index of indexes) {
        const executeOfferingRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          start: index.start,
          end: index.end,
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
          .send(executeOfferingRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const invalidRequests = [
        {},
        { format: "hedera" },
        { format: "hedera", accountId: "0.0.12345" },
        { format: "hedera", accountId: "0.0.12345", start: "1640995200000" },
        { format: "hedera", accountId: "0.0.12345", end: "1672531200000" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject invalid start timestamp (non-numeric string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const executeOfferingRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        start: "not-a-number",
        end: "10",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
        .send(executeOfferingRequest)
        .expect(400)
    })

    it("should reject invalid end timestamp (non-numeric string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const executeOfferingRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        start: "0",
        end: "not-a-number",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
        .send(executeOfferingRequest)
        .expect(400)
    })

    it("should reject invalid format value", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const executeOfferingRequest = {
        format: "invalid-format",
        accountId: "0.0.12345",
        start: "0",
        end: "10",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`)
        .send(executeOfferingRequest)
        .expect(400)
    })
  })
})
