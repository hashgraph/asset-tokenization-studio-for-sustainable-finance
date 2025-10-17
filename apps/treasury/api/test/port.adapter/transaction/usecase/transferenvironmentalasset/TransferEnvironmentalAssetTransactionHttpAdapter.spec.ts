// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("TransferEnvironmentalAssetTransaction API Integration", () => {
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

  describe("POST /:treasuryContractId/environmental-assets/:assetContractId/transfer", () => {
    it("should transfer environmental asset with valid treasuryContractId, assetContractId and tokenId", async () => {
      const treasuryContractId = "0.0.123456"
      const assetContractId = "0.0.789012"
      const transferRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        tokenId: 1,
        to: "0.0.987654",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}/transfer`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds, assetContractIds and tokenIds", async () => {
      const testCases = [
        {
          treasuryContractId: "0.0.123456",
          assetContractId: "0.0.789012",
          tokenId: 1,
          to: "0.0.987654",
        },
        {
          treasuryContractId: "0.0.654321",
          assetContractId: "0.0.210987",
          tokenId: 42,
          to: "0.0.456789",
        },
        {
          treasuryContractId: "0.0.999999",
          assetContractId: "0.0.111111",
          tokenId: 100,
          to: "0.0.222222",
        },
      ]

      for (const { treasuryContractId, assetContractId, tokenId, to } of testCases) {
        const transferRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
          tokenId,
          to,
        }

        const response = await request(app.getHttpServer())
          .post(`/api/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}/transfer`)
          .send(transferRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
        expect(typeof response.body.unsignedTx).toBe("string")
      }
    })
  })
})
