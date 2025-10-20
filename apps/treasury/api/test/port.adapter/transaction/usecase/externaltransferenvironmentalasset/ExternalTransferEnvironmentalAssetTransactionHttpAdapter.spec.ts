// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("ExternalTransferEnvironmentalAssetTransaction API Integration", () => {
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

  describe("POST /environmental-assets/:environmentalAssetContractId/treasuries/:treasuryContractId/transfer", () => {
    it("should create external environmental asset transfer in hedera format", async () => {
      const environmentalAssetContractId = "0.0.123456"
      const treasuryContractId = "0.0.789012"
      const transferRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        tokenId: 23454,
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/environmental-assets/${environmentalAssetContractId}/treasuries/${treasuryContractId}/transfer`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should create external environmental asset transfer in ethereum format", async () => {
      const environmentalAssetContractId = "0.0.123456"
      const treasuryContractId = "0.0.789012"
      const transferRequest = {
        format: "ethereum",
        accountId: "0.0.123456789",
        tokenId: 0,
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/environmental-assets/${environmentalAssetContractId}/treasuries/${treasuryContractId}/transfer`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
  })
})
