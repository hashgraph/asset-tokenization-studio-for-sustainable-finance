// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("CancelOfferingBySubscriptionIdTransaction API Integration", () => {
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

  describe("DELETE /primary-markets/:marketContractId/offerings/:offeringId/subscription-cancellations", () => {
    it("should cancel offering by subscription IDs with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionIds: [1, 2, 3],
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const cancelRequest = {
          format: format,
          accountId: "0.0.5466269",
          subscriptionIds: [1, 2],
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
          .send(cancelRequest)
          .expect(200)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should cancel offering with ethereum format (accountId optional)", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "ethereum",
        subscriptionIds: [1],
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle single subscription ID", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionIds: [1],
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(200)

      expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
    })

    it("should handle multiple subscription IDs", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        subscriptionIds: [1, 2, 3, 4, 5],
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(200)

      expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const invalidRequests = [{}, { format: "hedera" }, { format: "hedera", accountId: "0.0.12345" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject empty subscriptionIds array", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        subscriptionIds: [],
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(400)
    })

    it("should reject non-array subscriptionIds", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        subscriptionIds: "not-an-array",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(400)
    })

    it("should reject invalid format value", async () => {
      const marketContractId = "0.0.67890"
      const offeringId = "1"
      const cancelRequest = {
        format: "invalid-format",
        accountId: "0.0.12345",
        subscriptionIds: [1, 2],
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscription-cancellations`)
        .send(cancelRequest)
        .expect(400)
    })
  })
})
