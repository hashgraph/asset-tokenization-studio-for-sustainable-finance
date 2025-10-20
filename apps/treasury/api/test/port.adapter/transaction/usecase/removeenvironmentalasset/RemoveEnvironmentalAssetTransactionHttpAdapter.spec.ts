// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("RemoveEnvironmentalAssetTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
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

  describe("DELETE /treasuries/:treasuryContractId/environmental-assets/:assetContractId", () => {
    it("should remove environmental asset with valid treasuryContractId and assetContractId", async () => {
      const treasuryContractId = "0.0.123456"
      const assetContractId = "0.0.789012"
      const removeRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}`)
        .send(removeRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds and assetContractIds", async () => {
      const testCases = [
        {
          treasuryContractId: "0.0.123456",
          assetContractId: "0.0.789012",
        },
        {
          treasuryContractId: "0.0.654321",
          assetContractId: "0.0.210987",
        },
        {
          treasuryContractId: "0.0.999999",
          assetContractId: "0.0.111111",
        },
      ]

      for (const { treasuryContractId, assetContractId } of testCases) {
        const removeRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}`)
          .send(removeRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const assetContractId = "0.0.789012"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const removeRequest = {
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}`)
          .send(removeRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should reject invalid treasuryContractId format", async () => {
      const invalidTreasuryContractId = "invalid-treasury-contract-id"
      const assetContractId = "0.0.789012"
      const removeRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/treasuries/${invalidTreasuryContractId}/environmental-assets/${assetContractId}`)
        .send(removeRequest)
        .expect(500)
    })

    it("should reject invalid assetContractId format", async () => {
      const treasuryContractId = "0.0.123456"
      const invalidAssetContractId = "not-a-valid-asset-contract-id"
      const removeRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${invalidAssetContractId}`)
        .send(removeRequest)
        .expect(500)
    })

    it("should return 400 for invalid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const assetContractId = "0.0.789012"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const removeRequest = {
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}`)
          .send(removeRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields in body", async () => {
      const treasuryContractId = "0.0.123456"
      const assetContractId = "0.0.789012"
      const invalidRequests = [{}, { format: "hedera" }, { accountId: "0.0.123456789" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should handle missing treasuryContractId in path", async () => {
      const assetContractId = "0.0.789012"
      const removeRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/treasuries//environmental-assets/${assetContractId}`)
        .send(removeRequest)
        .expect(404)
    })

    it("should handle missing assetContractId in path", async () => {
      const treasuryContractId = "0.0.123456"
      const removeRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/`)
        .send(removeRequest)
        .expect(404)
    })
  })
})
