// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("CancelSubscriptionTransaction API Integration", () => {
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

  describe("DELETE /primary-markets/:marketContractId/offerings/:offeringDltId/subscriptions", () => {
    it("should delete subscription transaction with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionDltId: "1",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const cancelSubscriptionRequest = {
          format: format,
          accountId: "0.0.5466269",
          subscriptionDltId: "1",
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
          .send(cancelSubscriptionRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should delete subscription with ethereum format (accountId optional)", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const cancelSubscriptionRequest = {
        format: "ethereum",
        subscriptionDltId: "1",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid subscriptionDltId values", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const subscriptionValues = ["1", "10", "100", "1000"]

      for (const subscriptionDltId of subscriptionValues) {
        const cancelSubscriptionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          subscriptionDltId: subscriptionDltId,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
          .send(cancelSubscriptionRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const invalidRequests = [
        {},
        { format: "hedera" },
        { subscriptionDltId: "10" },
        { format: "hedera", accountId: "0.0.12345" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject invalid subscriptionDltId (non-numeric string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        subscriptionDltId: "not-a-number",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(400)
    })

    it("should reject invalid subscriptionDltId (empty string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        subscriptionDltId: "",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(400)
    })

    it("should reject invalid format value", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const cancelSubscriptionRequest = {
        format: "invalid-format",
        accountId: "0.0.12345",
        subscriptionDltId: "10",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(400)
    })

    it("should handle large subscriptionDltId values", async () => {
      const marketContractId = "0.0.67890"
      const offeringDltId = "1"
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionDltId: "999999999",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringDltId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })
  })
})
