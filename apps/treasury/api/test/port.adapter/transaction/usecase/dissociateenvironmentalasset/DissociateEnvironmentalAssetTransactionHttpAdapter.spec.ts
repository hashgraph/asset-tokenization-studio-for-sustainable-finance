// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("DissociateEnvironmentalAssetTransaction API Integration", () => {
  let app: INestApplication
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
  })
  describe("POST /treasuries/:treasuryContractId/environmental-assets/:assetContractId/dissociate", () => {
    it("should dissociate environmental asset with valid treasuryContractId and assetContractId", async () => {
      const treasuryContractId = "0.0.123456"
      const environmentalAssetContractId = "0.0.789012"

      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(
          `/api/v1/treasuries/${treasuryContractId}/environmental-assets/` +
            `${environmentalAssetContractId}/dissociate`,
        )
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
    it("should reject invalid treasuryContractId format", async () => {
      const invalidTreasuryContractId = "invalid-treasury-contract-id"
      const assetContractId = "0.0.789012"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${invalidTreasuryContractId}/environmental-assets/${assetContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(500)
    })
    it("should reject invalid assetContractId format", async () => {
      const treasuryContractId = "0.0.123456"
      const invalidAssetContractId = "invalid-asset-contract-id"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${invalidAssetContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })
    it("should return 400 for invalid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const environmentalAssetContractId = "0.0.789012"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const dissociateRequest = {
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer())
          .post(
            `/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetContractId}/dissociate`,
          )
          .send(dissociateRequest)
          .expect(400)
      }
    })
    it("should return 400 for missing required fields in body", async () => {
      const treasuryContractId = "0.0.123456"
      const environmentalAssetContractId = "0.0.789012"
      const invalidRequests = [{}, { format: "hedera" }, { accountId: "0.0.123456789" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(
            `/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetContractId}/dissociate`,
          )
          .send(invalidRequest)
          .expect(400)
      }
    })
    it("should handle missing treasuryContractId in path", async () => {
      const environmentalAssetContractId = "0.0.789012"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/treasuries//environmental-assets/${environmentalAssetContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(404)
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
        const dissociateRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/` + `${assetContractId}/dissociate`)
          .send(dissociateRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })
    it("should handle missing assetContractId in path", async () => {
      const treasuryContractId = "0.0.123456"
      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/environmental-assets//dissociate`)
        .send(dissociateRequest)
        .expect(404)
    })

    it("should handle different valid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const environmentalAssetContractId = "0.0.789012"

      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const dissociateRequest = {
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer())
          .post(
            `/api/v1/treasuries/${treasuryContractId}/environmental-assets/` +
              `${environmentalAssetContractId}/dissociate`,
          )
          .send(dissociateRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
        expect(typeof response.body.unsignedTx).toBe("string")
      }
    })
    it("should generate unsigned transaction for non-existent assetContractId", async () => {
      const treasuryContractId = "0.0.123456"
      const nonExistentAssetContractId = "0.0.999999"

      const dissociateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${nonExistentAssetContractId}/dissociate`)
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle requests without accountId", async () => {
      const treasuryContractId = "0.0.123456"
      const environmentalAssetContractId = "0.0.789012"

      const dissociateRequest = {
        format: "ethereum",
      }

      const response = await request(app.getHttpServer())
        .post(
          `/api/v1/treasuries/${treasuryContractId}/environmental-assets/` +
            `${environmentalAssetContractId}/dissociate`,
        )
        .send(dissociateRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
  })
})
