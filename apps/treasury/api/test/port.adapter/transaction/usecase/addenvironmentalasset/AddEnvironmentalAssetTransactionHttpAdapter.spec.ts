// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("AddEnvironmentalAssetTransaction API Integration", () => {
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
    app.setGlobalPrefix("api/treasuries")
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

  describe("POST /:treasuryId/environmental-assets/:assetId", () => {
    it("should add environmental asset with valid hexadecimal treasuryId and assetId", async () => {
      const treasuryId = "0x1234567890abcdef1234567890abcdef12345678"
      const assetId = "0xabcdef1234567890abcdef1234567890abcdef12"
      const addRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/treasuries/${treasuryId}/environmental-assets/${assetId}`)
        .send(addRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid hexadecimal treasuryIds and assetIds", async () => {
      const testCases = [
        {
          treasuryId: "0x1234567890abcdef1234567890abcdef12345678",
          assetId: "0xabcdef1234567890abcdef1234567890abcdef12",
        },
        {
          treasuryId: "0xABCDEF12345678901234567890ABCDEF12345678",
          assetId: "0x1234567890ABCDEF1234567890ABCDEF12345678",
        },
        {
          treasuryId: "0xdeadbeefcafebabe1234567890abcdef12345678",
          assetId: "0xcafebabe1234567890abcdef1234567890abcdef",
        },
      ]

      for (const { treasuryId, assetId } of testCases) {
        const addRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/treasuries/${treasuryId}/environmental-assets/${assetId}`)
          .send(addRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const treasuryId = "0x1234567890abcdef1234567890abcdef12345678"
      const assetId = "0xabcdef1234567890abcdef1234567890abcdef12"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const addRequest = {
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/treasuries/${treasuryId}/environmental-assets/${assetId}`)
          .send(addRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should reject invalid hexadecimal treasuryId", async () => {
      const invalidTreasuryId = "invalid-treasury-id"
      const assetId = "0xabcdef1234567890abcdef1234567890abcdef12"
      const addRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/treasuries/${invalidTreasuryId}/environmental-assets/${assetId}`)
        .send(addRequest)
        .expect(400)
    })

    it("should reject invalid hexadecimal assetId", async () => {
      const treasuryId = "0x1234567890abcdef1234567890abcdef12345678"
      const invalidAssetId = "not-a-valid-asset-id"
      const addRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/treasuries/${treasuryId}/environmental-assets/${invalidAssetId}`)
        .send(addRequest)
        .expect(400)
    })

    it("should return 400 for invalid format values", async () => {
      const treasuryId = "0x1234567890abcdef1234567890abcdef12345678"
      const assetId = "0xabcdef1234567890abcdef1234567890abcdef12"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const addRequest = {
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer())
          .post(`/api/treasuries/${treasuryId}/environmental-assets/${assetId}`)
          .send(addRequest)
          .expect(400)
      }
    })

    it("should return 400 for missing required fields in body", async () => {
      const treasuryId = "0x1234567890abcdef1234567890abcdef12345678"
      const assetId = "0xabcdef1234567890abcdef1234567890abcdef12"
      const invalidRequests = [{}, { format: "hedera" }, { accountId: "0.0.123456789" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/treasuries/${treasuryId}/environmental-assets/${assetId}`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should handle missing treasuryId in path", async () => {
      const assetId = "0xabcdef1234567890abcdef1234567890abcdef12"
      const addRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/treasuries//environmental-assets/${assetId}`)
        .send(addRequest)
        .expect(404)
    })

    it("should handle missing assetId in path", async () => {
      const treasuryId = "0x1234567890abcdef1234567890abcdef12345678"
      const addRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/treasuries/${treasuryId}/environmental-assets/`)
        .send(addRequest)
        .expect(404)
    })
  })
})
