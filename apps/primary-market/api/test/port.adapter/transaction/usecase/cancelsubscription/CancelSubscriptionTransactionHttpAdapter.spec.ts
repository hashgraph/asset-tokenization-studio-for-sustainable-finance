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

  describe("DELETE /primary-markets/:marketContractId/offerings/:offeringId/subscriptions", () => {
    it("should delete subscription transaction with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionId: 1,
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const cancelSubscriptionRequest = {
          format: format,
          accountId: "0.0.5466269",
          subscriptionId: 1,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
          .send(cancelSubscriptionRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should delete subscription with ethereum format (accountId optional)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const cancelSubscriptionRequest = {
        format: "ethereum",
        subscriptionId: 1,
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid subscriptionIdValue values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const subscriptionValues = [1, 10, 100, 1000]

      for (const subscriptionIdValue of subscriptionValues) {
        const cancelSubscriptionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          subscriptionId: subscriptionIdValue,
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
          .send(cancelSubscriptionRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const invalidRequests = [{}, { format: "hedera" }, { id: 10 }, { format: "hedera", accountId: "0.0.12345" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject invalid subscriptionIdValue (non-numeric string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        id: "not-a-number",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(400)
    })

    it("should reject invalid subscriptionIdValue (empty string)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = 1
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        id: "",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(400)
    })

    it("should reject invalid format value", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelSubscriptionRequest = {
        format: "invalid-format",
        accountId: "0.0.12345",
        id: 10,
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(400)
    })

    it("should handle large subscriptionIdValue values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelSubscriptionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionId: 999999999,
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`)
        .send(cancelSubscriptionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })
  })
})
