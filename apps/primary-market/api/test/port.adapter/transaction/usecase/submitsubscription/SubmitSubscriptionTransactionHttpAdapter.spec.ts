// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("SubmitSubscriptionTransaction API Integration", () => {
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
    app.setGlobalPrefix("api/v1/")
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
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

  describe("POST /primary-markets/:marketContractId/offerings/:offeringId/subscriptions", () => {
    it("should submit subscription transaction with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lotUnits: "10",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const submitSubscriptionRequest = {
          format: format,
          accountId: "0.0.5466269",
          lotUnits: "5",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
          .send(submitSubscriptionRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should submit subscription with ethereum format (accountId optional)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "ethereum",
        lotUnits: "3",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid lotUnits values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const lotUnitsValues = ["1", "10", "100", "1000"]

      for (const lotUnits of lotUnitsValues) {
        const submitSubscriptionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          lotUnits: lotUnits,
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
          .send(submitSubscriptionRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const invalidRequests = [
        {},
        { format: "hedera" },
        { lotUnits: "10" },
        { format: "hedera", accountId: "0.0.12345" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject invalid lotUnits (non-numeric string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        lotUnits: "not-a-number",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(400)
    })

    it("should accept negative lotUnits (validation allows numeric strings)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        lotUnits: "-5",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should reject invalid lotUnits (empty string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        lotUnits: "",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(400)
    })

    it("should reject invalid format value", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "invalid-format",
        accountId: "0.0.12345",
        lotUnits: "10",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(400)
    })

    it("should handle large lotUnits values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const submitSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        lotUnits: "999999999",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(submitSubscriptionRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })
  })
})
